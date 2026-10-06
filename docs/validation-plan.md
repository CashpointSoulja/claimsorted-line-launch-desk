# Validation plan

## What has been verified (in this repo)
- `npm test` runs `node --test` over `tests/engine.test.mjs`. It covers the v1 HOLD gaps, dedupe by ID versus name, missing columns, v2 READY, publish refusal, approval staleness, idempotent publish, fresh-read verification, tamper detection, the case-mix NO DECISION, reopen-denominator maturity and the agenda tags. See `docs/test-results.md` for actual output.
- Rendered screenshots at 1366px and 390px with no console errors and no horizontal overflow.

## What needs real-world validation (first 30 days, if hired)
1. **Does the problem exist?** Review the last 3–5 line launches: list gaps found after go-live and when they were found. If there were none, drop the gate idea and keep only the metrics view.
2. **Is the 8-stage framework right?** Walk two claims leads through it. Expect stages to be added (recoveries/subrogation was already surfaced by the pet sample) or split.
3. **Are the limits right?** SLA maxima, the authority cap and the evidence-age window are placeholders. Replace them with ClaimSorted's and each client's real ones.
4. **Will clients sign versioned packs?** Test with one friendly client on the next revision.
5. **Are pilot metrics trustworthy?** Compare segment-level medians from the claims system against the blended dashboard for one recent launch.

## Kill criteria
- Fewer than one material gap per three launches in the historical review.
- Ops leads say the gate adds more than a day without catching anything they'd miss.
