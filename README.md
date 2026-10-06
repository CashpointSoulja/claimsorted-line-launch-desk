# Line Launch Desk

**Independent concept by Ayo Ahmed for ClaimSorted's Founding Ops & Strategy (London) role. Not affiliated with ClaimSorted.** All clients, rules and claims are synthetic.

Live: https://cashpointsoulja.github.io/claimsorted-line-launch-desk/

Line Launch Desk sits between "a client sent us the handling spec for a new line" and "claims handlers are using it". It:

1. **Imports** a spec CSV and validates every row: required columns, numbers, ISO dates, known stages. Duplicates are resolved by stable `rule_id` (identical copies kept once, conflicts rejected). Rules with the same name are never merged.
2. **Checks the spec against one framework** (8 synthetic stages: eNOL, coverage, assessment, authority, fraud, payment, complaint, reporting): SLA maxima, handler authority cap, evidence older than 180 days, coverage rules citing the wrong policy-wording version, missing client sign-off.
3. **Gates go-live**: HOLD with every gap listed until each stage has a launch-ready rule.
4. **Approves and publishes** a handling pack: approvals are bound to the pack hash, publish is refused on HOLD, re-publishing is a no-op, and a fresh read re-verifies the hash. *Simulated write: browser localStorage only.*
5. **Measures the pilot** with denominators. The blended median cycle time improves 10.0d → 4.0d while both segments get slower, so the desk says **NO DECISION**. Reopen rate excludes claims closed under 30 days ago. Playbook adoption is shown per handler.
6. **Turns gaps and flags into a product agenda** tagged HYPOTHESIS or TO TEST, and exports the pack plus regression cases.

## Run locally
```bash
npm test          # node --test, no dependencies
npm run serve     # http://localhost:8080
```
The app is static HTML/CSS/ES modules in `public/`, with no build step, backend, network calls or keys. Logic is in `public/engine.js`, synthetic data in `public/samples.js`.

## Docs
- [PRD](docs/prd.md)
- [Five Whys](docs/five-whys.md) (evidence versus assumptions)
- [Event taxonomy and metric denominators](docs/event-taxonomy.md)
- [Experiment design](docs/experiment-design.md)
- [Validation plan](docs/validation-plan.md)
- [Assumptions and fit gaps](docs/assumptions-and-fit-gaps.md)
- [Source ledger](docs/source-ledger.md)
- [Brand sheet](docs/brand-sheet.md)
- [Test results](docs/test-results.md)
- [Demo video](demo/) (vertical 1080×1920, with script and captions)

## Notices
ClaimSorted's name and logo belong to ClaimSorted and are used only to identify who this concept is addressed to. The framework stages and limits are illustrative. They aren't ClaimSorted's internal rules or regulatory requirements. Outfit typeface: SIL Open Font License.
