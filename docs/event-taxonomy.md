# Event taxonomy

All events are emitted in the browser and shown in the in-app event log. Nothing is sent anywhere. Names are `object_action`, snake_case.

| Event | When | Payload | Used for |
|---|---|---|---|
| `spec_loaded` | Sample, revised sample or file loaded | `source`, `bytes` | Funnel start |
| `spec_validated` | Validate clicked | `source`, `rows`, `accepted`, `rejected`, `deduped`, `errors`, `blockers` | Spec quality per revision |
| `gate_evaluated` | After validation | `decision` (READY/HOLD), `open_gaps`, `stages_covered`, `stages_total` | Revisions to READY |
| `approval_recorded` | Approver clicks approve | `approver`, `pack_hash`, `gate` | Sign-off latency |
| `publish_refused` | Publish while HOLD or approvals missing/stale | `pack_hash`, `reason`, `open_gaps` | Guard effectiveness |
| `pack_published` | First publish of a hash | `pack_hash`, `publish_id` | Launches |
| `publish_noop` | Re-publish of the same hash | `pack_hash`, `publish_id` | Idempotency check |
| `publish_verified` | Fresh-read verification | `pack_hash`, `ok`, `rules` | Write integrity |
| `metric_decision` | Pilot metrics computed | `metric`, `decision`, `n_week_1`, `n_week_2` | Decision audit |
| `export_downloaded` | Pack or regression cases exported | `kind`, `pack_hash` or `count` | Handover |
| `local_state_reset` | Reset clicked | — | Demo hygiene |

## Metric definitions (denominators explicit)
- **Launch-ready rate (per revision)** = launch-ready rules ÷ rows in file.
- **Revisions to READY** = count of `gate_evaluated` events for a programme up to the first READY.
- **Day-one gap rate** = launches with at least one post-go-live framework gap ÷ `pack_published` launches. (Needs post-launch QA data the prototype doesn't have.)
- **Median cycle time** = median of (closed − opened) in days over closed claims, **reported per segment**. The blended value is shown but never decided on alone.
- **30-day reopen rate** = claims reopened within 30 days ÷ claims closed at least 30 days before the as-of date. Immature claims are excluded and their count is shown.
- **Playbook adoption** = claims where the new playbook step was used ÷ all claims handled, per handler. Target 80%.

## Draft from policy wording
| Event | When | Payload |
|---|---|---|
| `wording_drafted` | Draft rules clicked | `source` (`sample:<id>` or `pasted`), `status` (`drafted`/`refused`), `sentences`, `drafted`, `ambiguous`, `needs_human` |
| `draft_sent_to_import` | Drafted rows sent to Import (then validated) | `rows`, `policy_wording_version` |
