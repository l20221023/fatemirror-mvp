# Supabase Production Checklist

This checklist covers the V0.4.1 closed-beta release candidate before inviting the first 5 users.

## 1. Apply migrations

Apply the full migration chain, including the closed-beta and atomic beta access updates.

```bash
supabase migration list
supabase db push
```

Expected migration set:

- `001_advice_reports.sql`
- `002_advice_feedback.sql`
- `003_beta_access.sql`
- `004_usage_and_generation_events.sql`
- `005_commercial_foundation.sql`
- `006_v0_4_closed_beta.sql`
- `007_beta_access_atomic_ops.sql`

## 2. Check migration completeness

Verify the following tables and fields exist in production:

- `advice_reports`
- `advice_feedback`
- `beta_invites`
- `beta_sessions`
- `advice_usage_daily`
- `advice_generation_events`
- `commercial_orders`
- `commercial_entitlements`
- `payment_events`
- report cleanup fields such as `expires_at` and `deleted_at`
- cohort aggregation fields such as `cohort_id`
- rate-limit and fuse tracking data

Verify the following constraints and indexes:

- `beta_invites.code_hash` unique
- `beta_sessions.token_hash` unique
- `advice_reports.access_token_hash` unique
- `beta_sessions.invite_id` foreign key to `beta_invites.id`
- `advice_feedback.report_id` foreign key to `advice_reports.id`
- expiry cleanup indexes on reports
- cohort indexes on reports and sessions
- recent AI usage index on `beta_sessions.last_ai_request_at`

Verify the following concurrency protections:

- invite redemption uses `redeem_beta_invite(...)`
- beta session usage uses `increment_beta_session_usage(...)`
- invite use count does not rely on client-side read-then-write
- session AI counters do not rely on client-side read-then-write

## 3. Check RLS

Confirm Row Level Security is enabled and anonymous clients cannot directly read sensitive tables.

Check:

- `advice_reports` RLS enabled
- `advice_feedback` RLS enabled
- `beta_invites` RLS enabled
- `beta_sessions` RLS enabled

Expected behavior:

- anon client cannot read `advice_reports`
- anon client cannot read `beta_invites`
- anon client cannot read `beta_sessions`
- anon client cannot write to those tables directly
- report reads and deletes only happen through server routes using hashed access tokens

## 4. Check Service Role usage scope

The Supabase Service Role key must remain server-side only.

Verify:

- only server modules import `getSupabaseAdminClient`
- no client component reads `SUPABASE_SERVICE_ROLE_KEY`
- no browser bundle contains the service role key
- no deployment log prints the key
- no health endpoint returns the key

Recommended grep:

```bash
rg -n "SUPABASE_SERVICE_ROLE_KEY|getSupabaseAdminClient" app lib
```

## 5. Check report writes

Create one beta report in a staging-like environment and confirm:

- `cohort_id` is persisted
- `generation_mode` is persisted
- `estimated_cost` is persisted
- `fallback_reason_code` is persisted when AI falls back
- `validation_failure_codes` is persisted when validation fails
- `deleted_at` stays `null` before deletion
- feedback rows can be linked back to the report

## 6. Check cleanup task

Run a dry run first:

```bash
npm run cleanup:expired-reports:dry-run
```

Then verify the cron/API path:

```bash
curl -X POST "$DEPLOYMENT_BASE_URL/api/internal/cron/cleanup-expired-reports" ^
  -H "content-type: application/json" ^
  -H "x-cron-secret: $CRON_SECRET" ^
  -d "{\"dryRun\":true,\"limit\":5,\"offset\":0}"
```

Confirm:

- only expired reports are selected
- already deleted reports are skipped
- the route rejects requests without the cron secret
- cleanup output does not include raw report content

## 7. Roll back a bad deployment

If the app deploy is bad but schema is correct:

1. Disable public beta access in environment variables.
2. Stop new invite/session creation.
3. Roll back only the application deployment.
4. Do not delete production data or manually reset tables.
5. Re-run `npm run verify:deployment` against the restored target.

If a migration is bad:

1. Pause the rollout immediately.
2. Export the affected production rows before manual repair.
3. Apply a forward-fix migration instead of editing old migrations in place.
4. Re-run migration list and deployment verification after repair.
