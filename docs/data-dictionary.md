# Data dictionary

All values are synthetic. The source of truth is `public/engine.js` and `public/samples.js`.

## Handling spec CSV (input), one row per rule
| Column | Type | Required | Rule | Example |
|---|---|---|---|---|
| `rule_id` | string | yes | Stable key. Dedupe and conflict detection use this, never `rule`. | `PET-COV-01` |
| `stage` | enum | yes | One of `FNOL, COVERAGE, ASSESS, AUTHORITY, FRAUD, PAYMENT, COMPLAINT, REPORTING` (case-insensitive) | `COVERAGE` |
| `rule` | string | yes | Human-readable rule text | `Check pre-existing condition exclusion` |
| `owner` | string | yes | Team accountable | `Claims handler` |
| `authority_limit_gbp` | number ≥ 0 | blank allowed | Checked against stage `maxAuthorityGbp` | `5000` |
| `sla_hours` | number ≥ 0 | blank allowed | Checked against stage `maxSlaHours` | `48` |
| `evidence_doc` | string | yes | Source document name | `Policy wording s.4.2` |
| `evidence_version` | string | yes | For COVERAGE, must equal the programme's `policy_wording_version` | `HPW-2026.2` |
| `evidence_date` | ISO date | yes | Must be no more than 180 days before `as_of` | `2026-10-01` |
| `client_signoff` | `yes` / other | yes | Anything other than `yes` blocks | `yes` |

## Programme
| Field | Example |
|---|---|
| `client` | Harbour Pet Insurance (fictional MGA) |
| `line` | Pet (UK) |
| `policy_wording_version` | HPW-2026.2 |
| `as_of` | 2026-10-05 |
| `go_live` | 2026-11-02 |

## Framework `LLD-FW-0.1 (synthetic baseline)`
| Stage | Label | Limit |
|---|---|---|
| FNOL | eNOL intake | max SLA 24h |
| COVERAGE | Coverage & eligibility | wording version must match |
| ASSESS | Assessment | max SLA 120h |
| AUTHORITY | Authority & referral | max handler authority £5,000 |
| FRAUD | Fraud & leakage checks | — |
| PAYMENT | Settlement & payment | max SLA 72h |
| COMPLAINT | Complaint route | max SLA 72h |
| REPORTING | Client reporting | — |
| (all) | evidence age | ≤ 180 days |

These limits are illustrative. They aren't ClaimSorted's internal limits or regulatory requirements.

## Issue (validation output)
| Field | Values |
|---|---|
| `severity` | `error` (row rejected), `blocker` (row accepted but blocks launch), `info` |
| `code` | `MISSING_COLUMNS, MISSING_ID, MISSING_FIELDS, UNKNOWN_STAGE, BAD_NUMBER, BAD_DATE, DUPLICATE_IDENTICAL, DUPLICATE_CONFLICT, SLA_OVER_FRAMEWORK, AUTHORITY_OVER_CAP, STALE_EVIDENCE, WORDING_VERSION_MISMATCH, NO_CLIENT_SIGNOFF`; gate adds `STAGE_MISSING, STAGE_BLOCKED` |
| `rule_id`, `line` | Source row (line 1 is the header) |
| `message` | Human-readable reason |

## Handling pack (published)
`{ framework, client, line, policy_wording_version, go_live, rules[] }`. `rules` contains launch-ready rules only, with the 10 spec columns, sorted by `rule_id`. **Pack hash:** `pk_` + 8-hex FNV-1a of the canonical JSON. This is an integrity check for the demo, not a cryptographic signature.

## Publication record (localStorage key `lld.publications`)
`{ [pack_hash]: { publishId: "PUB-<hash>", at: ISO time, pack, approvals: { ops_lead, client_programme_owner } } }`

## Pilot claim (synthetic, 110 rows)
| Field | Type | Example |
|---|---|---|
| `claim_id` | string | `HP-0001` |
| `week` | ISO week | `2026-W35` |
| `segment` | `simple` / `complex` | `complex` |
| `handler` | string | `Handler 3` |
| `opened`, `closed` | ISO datetime | — |
| `reopened_30d` | bool | — |
| `used_playbook` | bool | — |

## Metric rules
`minSegmentN = 30`, `adoptionTarget = 0.8`, `reopenWindowDays = 30`. Definitions and denominators are in [event-taxonomy.md](event-taxonomy.md).

## Regression case (export)
`{ case_id: "RC-001", rule_id, line, expect: "reject_row" | "hold_launch", code, why }`
