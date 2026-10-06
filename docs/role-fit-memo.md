# Role-fit viability memo

**To:** ClaimSorted, Founding Ops & Strategy (London) · **From:** Ayo Ahmed · **Status:** independent concept, synthetic data

## The bet
The role, in ClaimSorted's words: "Handling claims at scale is an operations problem and a product problem at the same time." Line Launch Desk takes one moment where both collide, **onboarding a new line**, and makes the framework, the metrics and the product agenda work from the same evidence.

## Duty-by-duty mapping (the five duties in the public job post)
| # | JD duty (quoted) | What the desk shows | Coverage |
|---|---|---|---|
| 1 | "Define how claims are handled across every line of business, and make that framework hold as we add more." | 8-stage framework with limits; row validation; stable-ID dedupe; stale and wrong-version evidence checks; a HOLD/READY gate that lists every gap; hash-bound approvals; idempotent, verified publish. Steps 2 and 3 add drafting from wording and per-line readiness. | **Strong.** This is the core of the build. |
| 2 | "Set the operational metrics the claims team is run on, and make them trustworthy enough to act on." | Denominator-first pilot metrics; segment medians; `NO DECISION` when the blended median hides case-mix shift; n ≥ 30 rule; reopen rate excludes immature claims; event taxonomy. | **Strong for trustworthiness.** Doesn't propose the full metric set the team is run on (QA scores, leakage, NPS, cost per claim). |
| 3 | "Turn what you see on the frontline into a clear product agenda, and drive it with the product team." | Gaps and metric flags become agenda items tagged HYPOTHESIS / TO TEST with owner and evidence; regression cases exported. | **Partial.** Generates the agenda but doesn't show prioritisation or driving it with product (no sizing, no roadmap trade-offs in-app; see [v2-roadmap.md](v2-roadmap.md)). |
| 4 | "Own rollout and adoption of new product features, so they change how the team actually works." | Per-handler playbook adoption against 80%; low adoption becomes "find out why", not a rating; [rollout plan](rollout-and-adoption.md). | **Partial.** Measures adoption of one playbook. There's no feature-flag rollout, enablement material or change tracking. |
| 5 | "Own the operational relationship with clients through onboarding and beyond." | Client programme-owner sign-off bound to the exact pack; a single gap list per revision. | **Thin.** Covers onboarding only, and not "beyond". |

## What is NOT covered
- **Ongoing client relationship:** QBRs, SLA reporting to clients, bordereaux reconciliation, escalations, commercial conversations.
- **Real claims operations:** live claim handling, QA sampling, leakage and fraud outcomes, staffing and capacity planning.
- **Regulation:** FCA Consumer Duty, DISP complaint timelines and vulnerable-customer handling aren't encoded. The limits are illustrative.
- **ClaimSorted's actual systems and AI:** the desk doesn't integrate with ClaimSorted's platform. It's deterministic and makes no model calls, so its behaviour is fully testable offline.
- **Evidence of a ClaimSorted problem:** the pains are hypotheses (see [five-whys.md](five-whys.md)). Parts of this may already exist internally.

## Why it's viable as a first 30 days
1. Shadow one real onboarding with the desk's checks (phase 0 of the rollout plan).
2. Replace the synthetic framework with the real one, written with claims leads.
3. Agree the 3–5 metrics the claims team is run on, each with a written denominator.
4. Bring the first agenda items to product with evidence attached.

## Honest gaps in me
No direct claims-handling or TPA experience and no UK insurance regulatory background (see [assumptions-and-fit-gaps.md](assumptions-and-fit-gaps.md)). What the build demonstrates: turning messy inputs into a process with explicit gates, metrics that refuse to mislead, and an agenda tied to evidence.
