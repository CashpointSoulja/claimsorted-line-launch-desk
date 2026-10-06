# User stories and acceptance criteria

Every criterion below is implemented and tested unless marked *(proposed)*. Test names are in `tests/engine.test.mjs`.

| ID | Story | Acceptance criteria | Test |
|---|---|---|---|
| US-01 | As an ops lead, I want a file missing required columns rejected outright, so that a partial import is never mistaken for a complete one. | Any missing column of the 10 required ⇒ `MISSING_COLUMNS`, zero rows accepted. | missing columns rejects the whole file |
| US-02 | As an ops lead, I want duplicates resolved by `rule_id`, never by name. | Identical row with the same ID ⇒ kept once (`DUPLICATE_IDENTICAL`). Same ID, different content ⇒ rejected (`DUPLICATE_CONFLICT`). Same name, different IDs ⇒ both kept. | identical duplicate is kept once… |
| US-03 | As an ops lead, I want broken rows rejected with a reason. | Blank required field ⇒ `MISSING_FIELDS`. Unknown stage ⇒ `UNKNOWN_STAGE`. Non-numeric or negative number ⇒ `BAD_NUMBER`. Non-ISO date ⇒ `BAD_DATE`. | v1 spec holds launch… |
| US-04 | As an ops lead, I want rules that break framework limits to block launch. | SLA above stage max ⇒ `SLA_OVER_FRAMEWORK`. Authority above £5,000 ⇒ `AUTHORITY_OVER_CAP`. Evidence older than 180 days ⇒ `STALE_EVIDENCE`. Coverage rule on a different wording version ⇒ `WORDING_VERSION_MISMATCH`. No client sign-off ⇒ `NO_CLIENT_SIGNOFF`. | v1 spec holds launch… |
| US-05 | As an ops lead, I want one gate decision listing every gap. | Any error, blocker, or stage without a ready rule ⇒ `HOLD` with all gaps listed. Otherwise `READY`. | v1 holds / v2 READY |
| US-06 | As a client programme owner, I want my approval tied to the exact version. | Approval stores the pack hash. If the pack changes, the old approval doesn't count. | approval for an older pack hash does not carry over |
| US-07 | As an ops lead, I want publish to be safe to retry. | Refused on HOLD and when either approval is missing. First publish writes. Second publish ⇒ `noop`, nothing written. | publish refuses… is idempotent |
| US-08 | As an ops lead, I want to verify what was published. | A fresh read recomputes the hash. A tampered store ⇒ verification fails. | tampered stored pack fails verification |
| US-09 | As Ops & Strategy, I want the desk to refuse a misleading aggregate. | Blended median improves while any segment worsens ⇒ `NO DECISION`. Segments with n < 30 are listed. | pilot metrics refuse the misleading aggregate |
| US-10 | As Ops & Strategy, I want the reopen rate to use only mature claims. | Claims closed fewer than 30 days before as-of are excluded and their count shown. | pilot metrics… |
| US-11 | As a PM, I want frontline gaps turned into an agenda. | Agenda items derive from gap codes and metric flags, each tagged `HYPOTHESIS` or `TO TEST`. | regression cases and agenda derive from real gaps |
| US-12 | As a PM, I want regression cases from the gaps found. | One case per non-info issue, with expected outcome `reject_row` or `hold_launch`. | regression cases and agenda… |
| US-13 | As a client ops contact, I want the gap list as a file I can work through. | *(proposed)* CSV export of open gaps. | — |
