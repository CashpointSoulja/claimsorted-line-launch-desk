# Service blueprint: onboarding a new line

The scenario is synthetic: Harbour Pet (fictional MGA), Pet (UK), go-live 2026-11-02. Rows marked *(proposed)* aren't built.

| Phase | Client actions | Frontstage (what the client sees) | Backstage (ops) | Support systems | Evidence / output |
|---|---|---|---|---|---|
| 1. Spec handover | Sends the handling-spec CSV | Upload confirmation, row count | Ops lead loads the spec | `validateSpec` (CSV parse, required columns) | `spec_loaded` event |
| 2. Row validation | — | List of rejected rows with reasons *(proposed: client-facing export)* | Ops reviews rejected and duplicate rows | Stable-ID dedupe, number/date/stage checks | `spec_validated` {rows, rejected, deduped} |
| 3. Framework check | Answers gap questions | Gap list per stage | Ops compares the spec with the 8-stage framework | `coverage`, SLA/authority caps, 180-day evidence age, wording version | Coverage grid |
| 4. Launch gate | Sends a revised spec | HOLD with every gap, or READY | Ops decides whether go-live date holds | `evaluateGate` | `gate_evaluated` {decision, open_gaps} |
| 5. Sign-off | Programme owner approves the pack hash | "Approved as Client programme owner" | Ops lead approves the same hash | Approvals keyed by pack hash | `approval_recorded` |
| 6. Publish | — | Publish ID | Ops publishes; a retry is a no-op | `publishPack` (localStorage, simulated) | `pack_published` / `publish_noop` / `publish_refused` |
| 7. Verify | — | "Fresh read matches published hash" | Ops verifies before handlers start | `verifyPublication` recomputes the hash | `publish_verified` |
| 8. Pilot | Receives segmented reporting *(proposed)* | Cycle time by segment with denominators | Ops & Strategy reads metrics | `pilotMetrics` | `metric_decision` {decision, n per segment} |
| 9. Learn | — | — | PM triages agenda items | `productAgenda`, `regressionCases` | Exports (JSON) |

**Line of visibility:** the client sees phases 1, 3, 4, 5 and (proposed) 8. Handlers see only the published pack.
**Fail points:** 2 (a conflicting duplicate), 3 (stale or wrong-version evidence), 5 (approval of an older hash), 6 (double publish), 8 (blended metric misread). Each one has an explicit refusal in the desk.
