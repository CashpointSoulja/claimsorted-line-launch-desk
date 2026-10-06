# PRD: Line Launch Desk

Independent concept by Ayo Ahmed for ClaimSorted's Founding Ops & Strategy (London) role. Not affiliated with ClaimSorted. Everything here is synthetic, and every claim about ClaimSorted's problems is a hypothesis.

## Problem (hypothesis)
The role brief says the job is to "define how claims are handled across every line of business, and make that framework hold as we add more", to "set the operational metrics the claims team is run on, and make them trustworthy enough to act on", and to own client onboarding and feature adoption. ClaimSorted says it handles auto, property, travel, gadget, pet, renters and liability, and that it designs workflows "around your policy wording, claims philosophy, brand guidelines and tone of voice".

**Hypothesis:** every new client or line brings its own handling spec (wording, delegated authority, SLAs, reporting). If that spec goes live without being checked against a shared framework, gaps like a missing complaint route, authority above cap or an out-of-date wording reference reach claims handlers on day one. Blended pilot metrics then hide whether the launch is actually working.

I have no internal access and don't know how ClaimSorted runs onboarding today. This is a bet to test, not a defect I found.

## User
- Primary: Ops & Strategy lead onboarding a new client line.
- Secondary: client programme owner (signs off), claims team lead (adopts the playbook), product team (gets the agenda).

## Job to be done
"When a client sends us their handling spec for a new line, I want to know exactly what stops it from going live, get the right sign-offs on the exact version, and measure the pilot honestly, so we don't learn about gaps from complaints."

## Scope (what the prototype does)
1. **Import** a spec CSV (sample, revised sample, upload or paste). Every edit invalidates earlier validation.
2. **Validate rows**: required columns, blank fields, numbers, ISO dates, unknown stages. Duplicates are keyed by stable `rule_id`: identical copies are dropped once, conflicting copies are rejected. Rules with the same name but different IDs are never merged.
3. **Framework checks** against a synthetic 8-stage baseline (eNOL, coverage, assessment, authority, fraud, payment, complaint, reporting): SLA maxima, authority cap, evidence older than 180 days, coverage rules citing the wrong policy-wording version, no client sign-off.
4. **Coverage and gate**: each stage needs at least one launch-ready rule. Any error, blocker or uncovered stage means **HOLD**, with every gap listed.
5. **Approve and publish**: two approvals (ops lead, client programme owner) tied to the pack hash. Publishing is refused on HOLD or with stale approvals, and is idempotent (re-publishing is a no-op). A fresh-read verification recomputes the hash. The write is simulated in localStorage and labelled as such.
6. **Pilot metrics** with denominators: median cycle time by week and segment, 30-day reopen rate excluding immature claims, playbook adoption by handler. A built-in case-mix counterexample means the tool outputs **NO DECISION** instead of declaring a win.
7. **Product agenda**: gaps and metric flags become agenda items tagged HYPOTHESIS or TO TEST, with the rule IDs or counts as evidence.
8. **Export** the handling pack and regression cases (each refused row becomes an expected `reject_row` or `hold_launch` case).

## Non-goals
- No real client data, ClaimSorted systems, integrations, AI calls or payments.
- No regulatory judgement. Framework limits are illustrative, not FCA or any insurer's rules.
- No claims handling. This sits before go-live and around the pilot.

## Success metrics (to test, not measured)
- Primary: share of new-line launches that reach go-live with zero day-one framework gaps (gaps found after go-live ÷ launches).
- Secondary: days from spec received to READY; percentage of gate gaps closed by the client in one revision.
- Guardrails: launch slip versus target go-live; handler adoption of the new playbook at or above 80% in week 2.

## Risks
- The framework becomes a bureaucratic checklist. Mitigation: blockers only for things that hurt policyholders or leak indemnity; everything else is a warning.
- Clients resist versioned sign-off. Mitigation: one gap list per revision, not a form.
