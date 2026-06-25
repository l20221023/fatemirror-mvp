# Vercel Rate Limit Checklist

This document describes where to enforce rate limiting for the closed beta.

## The app layer is the final authority

Do not rely on Vercel alone. Application code and the data layer must enforce the final decision.

## Recommended protection points

- `/api/beta/verify`
- `/api/advice/reports`
- `/api/advice/generate`
- `/api/commercial/orders`
- `/api/commercial/webhook`
- `/api/internal/*`

## Suggested Vercel/WAF rules

1. Block obvious abuse bursts on the public advice endpoints.
2. Allow internal routes only from authenticated manager traffic.
3. Keep webhook endpoints restricted to the payment provider.
4. Prefer short burst rules over very long bans so testers do not get stuck.

## Recommended request thresholds

| Route | Suggested limit |
| --- | --- |
| `/api/beta/verify` | 5 failures per 15 minutes per IP hash |
| `/api/advice/reports` | 5 requests per hour per IP hash |
| `/api/advice/generate` | 3 AI requests per IP per day |
| `/api/internal/*` | Manager-only, never public |

## What must stay server-side

- Invite redemption
- Session creation and revocation
- AI quota and cooldown checks
- Global report and cost caps
- Cleanup authorization

## Preview vs production

- Preview deploys should use lower limits.
- Production should use the full closed-beta limits from env vars.
- Never hard-code Vercel control plane rules in the app source.

## Review checklist

1. Confirm the env vars in `.env.example`.
2. Confirm the operations page shows the active counters.
3. Confirm a revoked session cannot continue generating AI.
4. Confirm cleanup requires the cron secret.
