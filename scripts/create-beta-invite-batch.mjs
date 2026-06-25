const baseUrl = process.env.DEPLOYMENT_BASE_URL || process.env.ADVICE_EVAL_BASE_URL || "http://127.0.0.1:3000";
const countArg = process.argv.find((arg) => arg.startsWith("--count="));
const cohortArg = process.argv.find((arg) => arg.startsWith("--cohort="));
const maxUsesArg = process.argv.find((arg) => arg.startsWith("--max-uses="));
const expiresArg = process.argv.find((arg) => arg.startsWith("--expires-at="));
const count = Math.max(1, Number(countArg ? countArg.slice("--count=".length) : "5"));
const cohortId = cohortArg ? cohortArg.slice("--cohort=".length) : "beta-0-4-1";
const maxUses = Math.max(1, Number(maxUsesArg ? maxUsesArg.slice("--max-uses=".length) : "1"));
const expiresAt = expiresArg ? expiresArg.slice("--expires-at=".length) : null;
const internalCode = process.env.INTERNAL_ACCESS_CODE || process.env.ADVICE_INTERNAL_ACCESS_CODE || "";

if (!internalCode) {
  throw new Error("Set INTERNAL_ACCESS_CODE or ADVICE_INTERNAL_ACCESS_CODE before generating beta invites.");
}

const verifyResponse = await fetch(`${baseUrl}/api/internal/verify`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ code: internalCode }),
});

if (!verifyResponse.ok) {
  throw new Error(`Failed to verify internal access code (${verifyResponse.status}).`);
}

const cookieHeader = verifyResponse.headers.get("set-cookie");
if (!cookieHeader) {
  throw new Error("Internal access verification did not return a session cookie.");
}
const internalCookie = cookieHeader.split(";")[0];

const invites = [];
for (let index = 0; index < count; index += 1) {
  const response = await fetch(`${baseUrl}/api/internal/beta-invites`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      cookie: internalCookie,
    },
    body: JSON.stringify({
      cohortId,
      maxUses,
      expiresAt,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create invite ${index + 1} (${response.status}).`);
  }

  const json = await response.json();
  invites.push({
    inviteId: json.data?.invite?.id ?? null,
    code: json.data?.code ?? null,
    cohortId,
    maxUses,
    expiresAt,
  });
}

console.log(JSON.stringify({ count: invites.length, invites }, null, 2));
