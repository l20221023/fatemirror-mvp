function parseArgs(argv) {
  const options = { dryRun: true, retentionDays: undefined, limit: undefined, offset: undefined };

  for (const arg of argv) {
    if (arg === "--apply") {
      options.dryRun = false;
      continue;
    }

    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (arg.startsWith("--retention-days=")) {
      const value = Number(arg.slice("--retention-days=".length));
      if (Number.isFinite(value) && value > 0) {
        options.retentionDays = value;
      }
      continue;
    }

    if (arg.startsWith("--limit=")) {
      const value = Number(arg.slice("--limit=".length));
      if (Number.isFinite(value) && value > 0) {
        options.limit = value;
      }
      continue;
    }

    if (arg.startsWith("--offset=")) {
      const value = Number(arg.slice("--offset=".length));
      if (Number.isFinite(value) && value >= 0) {
        options.offset = value;
      }
    }
  }

  return options;
}

const options = parseArgs(process.argv.slice(2));
const baseUrl = process.env.ADVICE_EVAL_BASE_URL || "http://127.0.0.1:3000";
const secret = process.env.CRON_SECRET || process.env.ADVICE_CLEANUP_CRON_SECRET || "";

try {
  const response = await fetch(`${baseUrl}/api/internal/cron/cleanup-expired-reports`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(secret ? { "x-cron-secret": secret } : {}),
    },
    body: JSON.stringify({
      dryRun: options.dryRun,
      retentionDays: options.retentionDays,
      limit: options.limit,
      offset: options.offset,
    }),
  });

  const json = await response.json().catch(() => null);
  console.log(JSON.stringify(json ?? { success: false, error: "INVALID_JSON" }, null, 2));

  if (!response.ok) {
    process.exitCode = 1;
  }
} catch (error) {
  console.log(
    JSON.stringify(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
