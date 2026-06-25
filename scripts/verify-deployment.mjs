const baseUrl =
  process.env.DEPLOYMENT_BASE_URL ||
  process.env.ADVICE_EVAL_BASE_URL ||
  "http://127.0.0.1:3000";

const REQUIRED_ENV_NAMES = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "OPENAI_API_KEY",
  "ADVICE_AI_ENABLED",
  "ADVICE_MODEL",
  "ADVICE_REPOSITORY",
  "ADVICE_BETA_ENABLED",
  "ADVICE_GLOBAL_DAILY_REPORT_LIMIT",
  "ADVICE_GLOBAL_DAILY_BUDGET_USD",
  "BETA_SESSION_TTL_DAYS",
  "BETA_LOCAL_DAILY_LIMIT",
  "BETA_AI_DAILY_LIMIT",
  "BETA_AI_TOTAL_LIMIT",
  "BETA_AI_COOLDOWN_MINUTES",
  "RATE_LIMIT_HASH_SECRET",
  "CRON_SECRET",
  "INTERNAL_ACCESS_SECRET",
];

const STATUS = {
  SUCCESS: "ACCEPTANCE_SUCCESS",
  TARGET_UNREACHABLE: "TARGET_UNREACHABLE",
  HEALTH_FAILED: "HEALTH_FAILED",
  CONFIG_MISSING: "CONFIG_MISSING",
  PAGE_STATUS_ERROR: "PAGE_STATUS_ERROR",
  PERMISSION_ERROR: "PERMISSION_ERROR",
};

async function fetchText(pathname, init) {
  const startedAt = Date.now();

  try {
    const response = await fetch(`${baseUrl}${pathname}`, init);
    const text = await response.text();
    return {
      ok: true,
      pathname,
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      text,
      durationMs: Date.now() - startedAt,
    };
  } catch (error) {
    return {
      ok: false,
      pathname,
      status: null,
      headers: {},
      text: null,
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function fetchJson(pathname, init) {
  const result = await fetchText(pathname, init);
  if (!result.ok || typeof result.text !== "string") {
    return { ...result, json: null, parseError: null };
  }

  try {
    return { ...result, json: JSON.parse(result.text), parseError: null };
  } catch (error) {
    return {
      ...result,
      json: null,
      parseError: error instanceof Error ? error.message : String(error),
    };
  }
}

function pageCheck(name, result) {
  return {
    name,
    ok: Boolean(result.ok && result.status && result.status >= 200 && result.status < 400),
    detail: result.ok
      ? `status=${result.status}`
      : `unreachable: ${result.error ?? "unknown_error"}`,
  };
}

const [
  health,
  homePage,
  advicePage,
  helpPage,
  privacyPage,
  reportPage,
  internalPage,
  betaVerify,
  internalVerify,
] = await Promise.all([
  fetchJson("/api/health"),
  fetchText("/"),
  fetchText("/en/reading/advice"),
  fetchText("/en/help"),
  fetchText("/en/privacy"),
  fetchText("/en/reading/advice/result"),
  fetchText("/en/internal/operations"),
  fetchJson("/api/beta/verify", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ code: "definitely-invalid" }),
  }),
  fetchJson("/api/internal/verify", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ code: "definitely-invalid" }),
  }),
]);

const probes = [
  health,
  homePage,
  advicePage,
  helpPage,
  privacyPage,
  reportPage,
  internalPage,
  betaVerify,
  internalVerify,
];

if (probes.every((probe) => !probe.ok)) {
  const report = {
    status: STATUS.TARGET_UNREACHABLE,
    baseUrl,
    failures: probes.map((probe) => ({
      name: probe.pathname,
      detail: probe.error ?? "target_unreachable",
    })),
  };

  console.log(JSON.stringify(report, null, 2));
  process.exitCode = 1;
} else {
  const healthJson = health.json ?? {};
  const envPresence = healthJson.envPresence ?? {};
  const healthAdvice = healthJson.advice ?? {};
  const reportHtml = (reportPage.text || "").toLowerCase();
  const internalHtml = internalPage.text || "";

  const missingConfig = REQUIRED_ENV_NAMES.filter((name) => envPresence[name] === false || envPresence[name] === null);

  const checks = [
    pageCheck("home_page", homePage),
    pageCheck("advice_form", advicePage),
    pageCheck("help_page", helpPage),
    pageCheck("privacy_page", privacyPage),
    {
      name: "health_api",
      ok: Boolean(health.ok && health.status === 200 && healthJson.healthy !== false && health.parseError === null),
      detail: health.ok
        ? `status=${health.status}, healthy=${String(healthJson.healthy)}`
        : `unreachable: ${health.error ?? "unknown_error"}`,
    },
    {
      name: "health_redaction",
      ok:
        !("serviceRoleKey" in healthJson) &&
        !("supabaseUrl" in healthJson) &&
        !("databaseUrl" in healthJson) &&
        !("fullModelConfig" in healthJson),
      detail: "health response omits secrets, database URL, and full model configuration",
    },
    {
      name: "beta_verify_exists",
      ok: Boolean(betaVerify.ok && [403, 429].includes(betaVerify.status)),
      detail: betaVerify.ok
        ? `status=${betaVerify.status}`
        : `unreachable: ${betaVerify.error ?? "unknown_error"}`,
    },
    {
      name: "internal_verify_exists",
      ok: Boolean(internalVerify.ok && [403, 500].includes(internalVerify.status)),
      detail: internalVerify.ok
        ? `status=${internalVerify.status}`
        : `unreachable: ${internalVerify.error ?? "unknown_error"}`,
    },
    {
      name: "internal_page_rejected_without_auth",
      ok:
        Boolean(internalPage.ok) &&
        (
          [302, 303, 307, 308, 401, 403].includes(internalPage.status) ||
          !internalHtml.includes("V0.4 closed-beta operations")
        ),
      detail: internalPage.ok
        ? `status=${internalPage.status}`
        : `unreachable: ${internalPage.error ?? "unknown_error"}`,
    },
    {
      name: "report_page_noindex",
      ok: Boolean(reportPage.ok && reportPage.status === 200 && reportHtml.includes("noindex")),
      detail: reportPage.ok
        ? `status=${reportPage.status}, noindex=${String(reportHtml.includes("noindex"))}`
        : `unreachable: ${reportPage.error ?? "unknown_error"}`,
    },
    {
      name: "commercial_mode_sandbox",
      ok: healthAdvice.paymentMode === "sandbox",
      detail: `paymentMode=${healthAdvice.paymentMode ?? "unknown"}`,
    },
    {
      name: "production_payment_not_enabled",
      ok: healthAdvice.paymentMode !== "production",
      detail: `paymentMode=${healthAdvice.paymentMode ?? "unknown"}`,
    },
    {
      name: "production_like_repository_not_memory",
      ok:
        !healthJson.runtime?.productionLike ||
        (healthAdvice.repository !== "memory" && healthJson.supabaseConfigured === true),
      detail: `repository=${healthAdvice.repository ?? "unknown"}, supabaseConfigured=${String(healthJson.supabaseConfigured)}`,
    },
    {
      name: "critical_env_present",
      ok: missingConfig.length === 0 && Array.isArray(healthJson.missingCriticalEnv) && healthJson.missingCriticalEnv.length === 0,
      detail:
        missingConfig.length === 0
          ? "all required environment toggles are present"
          : `missing=${missingConfig.join(", ")}`,
    },
  ];

  let status = STATUS.SUCCESS;
  if (!checks.find((check) => check.name === "health_api")?.ok) {
    status = STATUS.HEALTH_FAILED;
  } else if (!checks.find((check) => check.name === "critical_env_present")?.ok) {
    status = STATUS.CONFIG_MISSING;
  } else if (
    !checks.find((check) => check.name === "internal_page_rejected_without_auth")?.ok
  ) {
    status = STATUS.PERMISSION_ERROR;
  } else if (checks.some((check) => !check.ok)) {
    status = STATUS.PAGE_STATUS_ERROR;
  }

  const report = {
    status,
    ok: status === STATUS.SUCCESS,
    baseUrl,
    runtime: healthJson.runtime ?? null,
    health: healthJson,
    checks,
    failures: checks.filter((check) => !check.ok),
  };

  console.log(JSON.stringify(report, null, 2));

  if (status !== STATUS.SUCCESS) {
    process.exitCode = 1;
  }
}
