# Rollout and adoption plan (proposal, not run)

The JD says: "Own rollout and adoption of new product features, so they change how the team actually works." A process nobody follows isn't finished. This plan treats Line Launch Desk itself as the feature being rolled out.

## Phases
| Phase | Scope | Who | Exit criteria |
|---|---|---|---|
| 0. Shadow (2 weeks) | Run the desk alongside the current onboarding for **one** new line. No gate authority. | Ops lead + me | Desk found every gap the manual process found, plus or minus the list of extra gaps it found; ≤ 1 false-positive blocker per 20 rules |
| 1. Advisory gate (next 2 lines) | HOLD is shown to the client and ops, and go-live still needs an ops-lead call | Ops lead, client ops contact | Both client contacts sign off in the desk instead of over email; time from spec received → READY recorded |
| 2. Binding gate | No line goes live while the gate says HOLD; waivers are explicit, owned and expire | Head of claims ops | 0 go-lives with unresolved gaps; waiver count reported weekly |
| 3. Default for all new lines | Framework versioned; quarterly review of stage limits | Ops & Strategy | Framework change log; agenda items closed per quarter |

## Adoption metrics (with denominators)
| Metric | Numerator / denominator | Target to test |
|---|---|---|
| Desk coverage | new lines onboarded via the desk / all new lines started | 100% by phase 3 |
| Sign-off in-tool | rules signed in the desk / rules in published packs | ≥ 90% |
| Playbook step used | claims where the step was used / claims where it applied, **per handler** | ≥ 80% (`adoptionTarget`) |
| Gap closure time | median days from first HOLD → READY, by line | baseline in phase 0 |
| Post-launch surprises | handling gaps found in the first 30 live days / lines launched | trending to 0 |

## Adoption tactics
- **Find out why before more training.** When a handler is below target (Handler 3 at 12/27 in the synthetic pilot), the desk raises a TO TEST agenda item. Sit with them for an hour: the step may be wrong for the claim type.
- **Make the right path the easy path.** The published pack is what handlers see. Nothing else is current.
- **Close the loop in public.** Each agenda item gets an owner and a decision date, and is shared with the team when closed.
- **Client side:** send the gap list as one document per revision, not a drip of emails.

## Kill or rethink signals
- Phase 0 finds no gap that the manual process missed. The desk is overhead, so stop.
- More than 30% of blockers are waived in phase 2. The framework limits are wrong, so revisit them with claims leads.
