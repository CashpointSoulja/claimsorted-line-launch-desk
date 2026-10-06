# v2 roadmap

Ordered by what I'd expect to unblock the most onboarding work. Each item is a hypothesis with a test, not a commitment.

| # | Item | Why (evidence in v1) | Test before building | Size |
|---|---|---|---|---|
| 1 | **Draft from policy wording** (in progress: step 2) | Coverage rules in spec v1 cite the wrong wording version. Rules should start from the wording itself. | Do drafted rows cut time-to-first-spec on a real wording? | M |
| 2 | **Per-line framework profiles** (in progress: step 3) | One baseline can't fit pet, auto and liability. `UNKNOWN_STAGE` (recoveries) already shows the strain. | Which stages and limits really differ by line? Review with claims leads. | M |
| 3 | Real identities on approvals | v1 "approve" is a button anyone can press | Will client ops sign in a TPA tool at all? | M |
| 4 | Diff since last approved hash | Re-approval after small edits risks rubber-stamping | Does a diff view reduce time-to-reapprove without missed changes? | S |
| 5 | Explicit, expiring waivers | A binding gate will meet deadline pressure | How often do teams want to override, and for what? | S |
| 6 | Client-facing gap export (CSV) | US-13. The client fixes gaps in their own spreadsheet. | Does one export per revision cut email rounds? | S |
| 7 | Write the published pack to the real handling system | v1 is a simulated localStorage write | Needs access to the system of record. Integration out of scope for the concept. | L |
| 8 | Metrics from real claim events | v1 uses 110 synthetic claims | Does the event taxonomy map onto existing claim data? | L |
| 9 | Regression cases run in CI on every framework change | Cases are exported but not executed | Do framework edits break past launches? | S |

**Not on the roadmap:** auto-approving packs, scoring individual handlers, or model-generated rules without a source sentence.
