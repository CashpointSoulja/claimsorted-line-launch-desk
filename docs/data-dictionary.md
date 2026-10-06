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

## Drafted rows (from policy wording)
The drafter (`public/drafter.js`) writes rows in the same 10-column format. It is deterministic and rule-based; no API or model is called.

| Field | Drafted value |
|---|---|
| `rule_id` | `DRF-<COV/EXC/XS/WAIT/LIM/DOC/ELIG>-NN`, numbered in order of appearance |
| `stage` | Covered events, exclusions, waiting periods, eligibility → `COVERAGE`; excess, limits → `ASSESS`; documents needed → `FNOL` |
| `rule` | Category label plus the source sentence, verbatim |
| `owner` | `NEEDS_HUMAN`: wording never says who owns a rule |
| `authority_limit_gbp`, `sla_hours` | Blank. Policy limits are not handler authority |
| `evidence_doc` | Wording title plus clause number, e.g. `... s.4.2` |
| `evidence_version`, `evidence_date` | Taken from `Wording version:` / `Effective date:` lines, otherwise `NEEDS_HUMAN` |
| `client_signoff` | Always `no`. A draft is not a sign-off |

`NEEDS_HUMAN` in any field produces a `NEEDS_HUMAN` blocker in validation, so a drafted row is accepted but can never be launch-ready until a person edits it. Clauses with hedged wording ("we may", "at our discretion", "reasonable", "normally", "may be limited") are listed as ambiguous and drafted as no row. Categories with no matching sentence are listed as "not found: needs human". Empty, non-wording or oversized (over 100,000 characters) input is refused with a reason.
