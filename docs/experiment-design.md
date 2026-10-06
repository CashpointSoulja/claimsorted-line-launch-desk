# Experiment design (TO TEST, not run)

**Question:** Does putting new-line specs through a versioned launch gate reduce day-one handling gaps without delaying go-live?

- **Unit:** a new client line launch (not a claim). Launches are rare, so this is a stepped rollout, not an A/B test.
- **Design:** for the next N launches, alternate gate-first and current process if volume allows. Otherwise run the gate on all of them and compare against the last comparable launches, as a weaker pre/post. Pre-register the comparison set before looking at results.
- **Primary metric:** day-one gap rate = launches with at least one framework gap found in the first 30 days ÷ launches.
- **Secondary metrics:** days from spec received to go-live; client revisions to READY; week-2 playbook adoption per handler.
- **Guardrails:** go-live slip of 5 working days or less versus target; no increase in client escalations during onboarding.
- **Segmentation:** line of business (pet, travel, gadget, property, auto, liability), new client versus new line for an existing client, UK versus US.
- **Decision criteria:** adopt if the gap rate falls and go-live slip stays within the guardrail over at least 6 launches. With fewer than 6 launches, or mixed segments, output **HOLD: no decision** and keep collecting.
- **Pilot-metric rule inside each launch:** decide on cycle time only per segment with at least 30 closed claims in each week. A blended improvement with slower segments is reported as **NO DECISION** (see the in-app counterexample).
- **Threats:** small N, launch heterogeneity, Hawthorne effect on the ops team, and the gate itself changing how gaps get reported.
