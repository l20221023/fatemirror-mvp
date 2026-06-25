# First Five Beta Plan

## Test goal

Validate that FateMirror V0.4.1 can safely support the first 5 invited closed-beta users end to end, including invite redemption, beta session creation, local advice, AI-enhanced advice, report storage, feedback, deletion, cleanup, and cohort-level operations visibility.

## Test user selection

Choose 5 users who:

- understand this is a closed beta, not a finished product
- can follow written instructions carefully
- are willing to report confusing or unsafe output
- will not submit real names, phone numbers, addresses, or other sensitive data
- represent a mix of common use cases, such as early contact, ambiguity, conflict, cooling-off, and breakup questions

## Invite delivery

Invite delivery should remain manual and controlled.

- create 5 one-time invite codes for cohort `V0.4.1-first-5`
- send each code in a direct private channel
- include expiration date, limits, and privacy reminder
- do not place invite codes in URLs, shared docs, or public chat logs

## Pre-flight checks

Before sending invites, confirm:

- `npm test`
- `npm run test:coverage`
- `npm run lint`
- `npm run build`
- `npm run evaluate:advice:mock`
- `npm run cleanup:expired-reports:dry-run`
- `DEPLOYMENT_BASE_URL=https://target npm run verify:deployment`

Also verify:

- health endpoint is green and redacted
- payment mode is still sandbox
- beta cohort config is server-side
- invite creation only stores hashes in the database
- operations dashboard shows cohort metrics without sensitive content

## User flow

Each tester should complete the following:

1. open the beta entry page
2. redeem the invite code
3. confirm the closed-beta explanation
4. submit one local advice request
5. submit one AI deep advice request
6. refresh and reopen the stored report
7. submit feedback
8. delete the report
9. confirm the deleted report can no longer be reopened with the old access token

## Operator observations

During each user session, watch:

- invite redemption success/failure
- active beta sessions
- local advice count
- AI request count
- AI success and fallback rate
- high-risk routing count
- rate-limit hits
- average generation duration
- token estimate and cost estimate
- report deletion count
- cleanup queue size
- fuse state

## Pause conditions

Pause the beta immediately if any of the following happens:

- dangerous advice appears
- severe factual fabrication appears
- reports cannot be deleted
- raw user text reaches ordinary logs
- access credentials leak
- AI cost spikes abnormally
- database writes keep failing
- rate limiting or idempotency stops working

## Per-user completion checklist

After each tester finishes, confirm:

- invite was consumed exactly once
- session limits behaved as expected
- report was persisted with the correct cohort
- feedback was stored without sensitive payload leakage
- report deletion worked
- operations dashboard counts changed as expected

## Batch summary

After all 5 users finish, summarize:

- how many completed the full flow
- how many valid AI-enhanced reports were produced
- whether any dangerous advice or severe factual errors appeared
- AI success rate
- deletion reliability
- quota and cooldown reliability
- average measurable cost per report
- how many users said the product was helpful or partly helpful

## Gate to 10-20 users

Do not expand beyond 5 users unless all of the following are true:

- at least 4 of 5 users complete the full flow
- at least 4 valid AI-enhanced reports are generated
- dangerous advice events are 0
- severe factual error events are 0
- AI success rate is at least 80%
- report deletion works normally
- quota limits work normally
- average per-report cost is measurable
- at least 3 users rate the product helpful or partly helpful
