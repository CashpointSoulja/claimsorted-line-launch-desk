# Line Launch Desk

- Live app: https://cashpointsoulja.github.io/claimsorted-line-launch-desk/
- Demo video: https://drive.google.com/file/d/1_DTgWZ7ykOGdYlVcwWS1DCE6kUyE5zoa/view

**Independent concept by Ayo Ahmed for ClaimSorted's Founding Ops & Strategy (London) role. Not affiliated with ClaimSorted.** All clients, rules and claims are synthetic.

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

## Also in the app
- **Launch readiness by line (illustrative):** the six lines listed on claimsorted.com (property, auto, small commercial, general liability, accident and health including travel, warranty). Each has a fictional client and a synthetic spec, and goes through the same `validateSpec` and `evaluateGate` as the pet example. One line is READY and five HOLD, each for a different reason. Source: `public/lines.js`.
- **Draft from policy wording:** paste wording or pick one of three synthetic samples (travel, small commercial property, appliance warranty). A deterministic, rule-based extractor with no API drafts rows in the import format for covered events, exclusions, excess, waiting periods, limits, documents needed and eligibility checks. Every item shows its source sentence. Anything not found or ambiguous is marked "needs human", never invented, and drafted rows hold at the gate until a person confirms them. Source: `public/drafter.js`.

## Docs
Start here: [ELI5](docs/eli5.md) · [30-second explanation](docs/thirty-second-explanation.md)

Product
- [PRD](docs/prd.md)
- [Jobs to be done](docs/jtbd.md)
- [Hypothesis personas](docs/personas.md) (ops lead, claims handler, product manager, MGA client ops contact)
- [Service blueprint](docs/service-blueprint.md)
- [User stories and acceptance criteria](docs/user-stories.md)
- [Five Whys](docs/five-whys.md) (evidence versus assumptions)
- [Rollout and adoption plan](docs/rollout-and-adoption.md)
- [v2 roadmap](docs/v2-roadmap.md)
- [Role-fit viability memo](docs/role-fit-memo.md) (the 5 JD duties mapped to features, and what isn't covered)

Design and data
- [Data dictionary](docs/data-dictionary.md)
- [State machines](docs/state-machines.md)
- [Event taxonomy and metric denominators](docs/event-taxonomy.md)
- [Experiment design](docs/experiment-design.md)
- [Validation plan](docs/validation-plan.md)
- [Risks and limits](docs/risk-and-limits.md)
- [Privacy](docs/privacy.md) (synthetic only)
- [Test plan](docs/test-plan.md)
- [Assumptions and fit gaps](docs/assumptions-and-fit-gaps.md)
- [Source ledger](docs/source-ledger.md)
- [Brand sheet](docs/brand-sheet.md)
- [Test results](docs/test-results.md)
- [Demo video](demo/) (vertical 1080×1920, with script and captions)

## Notices
ClaimSorted's name and logo belong to ClaimSorted and are used only to identify who this concept is addressed to. The framework stages and limits are illustrative. They aren't ClaimSorted's internal rules or regulatory requirements. Outfit typeface: SIL Open Font License.
