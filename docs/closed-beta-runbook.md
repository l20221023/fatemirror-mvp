# Closed Beta Runbook

This runbook covers the V0.4 closed test flow for FateMirror.

## 1. Create a test batch

1. Turn on `ADVICE_BETA_ENABLED=true`.
2. Decide the cohort name and any experiment code.
3. Set `BETA_SESSION_TTL_DAYS`, `BETA_LOCAL_DAILY_LIMIT`, `BETA_AI_DAILY_LIMIT`, and `BETA_AI_TOTAL_LIMIT`.
4. Create invites from `/[locale]/internal/operations` or `POST /api/internal/beta-invites`.
5. Or generate the first five in one step:

```bash
INTERNAL_ACCESS_CODE=... npm run beta:invites:batch -- --count=5 --cohort=beta-0-4-1
```

## 2. Generate a single invite

Use the internal invite manager and copy the plaintext code once.

The list view only shows `codeHash`, so you need the one-time create response to share the actual code.

## 3. Send invites to users

1. Share the invite code privately.
2. Remind testers that the code is one-time for the first batch unless you explicitly configure otherwise.
3. Ask testers to keep the invite code out of screenshots and logs.

## 4. Check AI configuration

Verify these values before a live test:

```bash
ADVICE_AI_ENABLED=true
ADVICE_AI_PROVIDER=openai|mock
ADVICE_MODEL=gpt-4o-mini
OPENAI_API_KEY=...
```

If `OPENAI_API_KEY` is missing, the app should still serve local advice.

## 5. Configure daily budget

Use these values for the first batch:

```bash
ADVICE_GLOBAL_DAILY_REPORT_LIMIT=10
ADVICE_GLOBAL_DAILY_BUDGET_USD=
BETA_LOCAL_DAILY_LIMIT=3
BETA_AI_DAILY_LIMIT=1
BETA_AI_TOTAL_LIMIT=2
BETA_AI_COOLDOWN_MINUTES=10
```

Adjust the cohort by editing env vars and re-deploying. The code reads the limits from the server.

## 6. Verify report generation

1. Submit a local request.
2. Submit an AI request.
3. Confirm the result page shows the report.
4. Confirm the delete flow removes the report immediately.

## 7. Check rate limiting

Watch these counters in the operations page:

1. Today AI requests.
2. Today rate limited.
3. Current fuse state.
4. Active beta sessions.

The IP hash is server-side only and should not be visible in the browser.

## 8. Check AI cost

1. Review today cost in Supabase `advice_usage_daily`.
2. Review `advice_generation_events` for fallback reasons and validation failures.
3. Keep an eye on `ADVICE_GLOBAL_DAILY_BUDGET_USD`.

## 9. Handle AI degradation

If the provider starts failing:

1. AI requests should fall back to local guidance.
2. The operations page should show the fuse state.
3. Once the cooldown ends, AI can be retried.
4. Managers can manually recover by fixing the provider and waiting for the cooldown window.

## 10. Trigger cleanup

Run:

```bash
npm run cleanup:expired-reports:dry-run
npm run cleanup:expired-reports
```

The cleanup route accepts `dryRun`, `limit`, `offset`, and `retentionDays`.

## 11. Verify deployment locally

Run:

```bash
npm run verify:deployment:local
```

The script checks health, help page availability, and cleanup authorization.
It also checks the advice page, privacy page, report noindex, and that protected internal content stays hidden without access.

## 12. Decide on expansion

Consider expanding from 5-10 testers to 20-50 testers only when:

1. Invite redemption works.
2. Session expiration works.
3. AI downgrade is visible and understandable.
4. Cleanup succeeds in dry-run mode.
5. The operations page shows useful metrics without leaking sensitive data.
6. The first five testers each receive a unique invite code.

## 13. Pause the beta

Set:

```bash
ADVICE_BETA_ENABLED=false
ADVICE_AI_ENABLED=false
```

This keeps the local guidance engine available while closing AI expansion.
