# Risks and limits

## What this prototype is not
- **Not connected to anything.** There is no ClaimSorted system, client system, API or database. "Publish" writes only to this browser's `localStorage`.
- **Not ClaimSorted's framework.** The eight stages and every limit (SLA maxima, £5,000 authority cap, 180-day evidence age) are illustrative.
- **Not regulatory advice.** It doesn't encode FCA rules (for example DISP complaint timelines or Consumer Duty). A real framework would need compliance sign-off.
- **Not a signature system.** The pack hash is FNV-1a for integrity in the demo. It isn't cryptographic and there are no identities: anyone in the browser can click "approve".
- **Not evidence of a ClaimSorted problem.** The pain points are hypotheses (see [five-whys.md](five-whys.md)).

## Product risks
| Risk | Likelihood | Impact | Mitigation in desk / plan |
|---|---|---|---|
| Real specs aren't one row per rule (PDFs, Word docs, nested conditions) | High | High | Validation plan step 1: collect three real specs. The CSV is an intake contract, not an assumption about clients. |
| Framework becomes a bottleneck for unusual lines | Medium | Medium | `UNKNOWN_STAGE` becomes a HYPOTHESIS agenda item (e.g. recoveries) rather than a silent drop |
| Gate is overridden under deadline pressure | Medium | High | *(proposed)* explicit, logged waiver with owner and expiry. Not built: today HOLD is absolute. |
| Teams read metrics as targets for handlers | Medium | High | Adoption flags are TO TEST ("find out why"), not performance ratings |
| Small pilots give noisy metrics | High | Medium | n ≥ 30 per segment, otherwise HOLD. Denominators always shown. |
| Approval fatigue (rubber-stamping) | Medium | Medium | *(proposed)* show a diff since the last approved hash |

## Technical limits
- Single static page with no auth, no multi-user state and no persistence beyond one browser.
- The CSV parser is RFC 4180-style (quoted fields, escaped quotes, commas, newlines inside quotes). It has no encoding detection and no Excel files.
- Metrics compare only the first and last pilot weeks, with two segments.
- Synthetic data is constructed to show each behaviour. It isn't a statistical simulation.
