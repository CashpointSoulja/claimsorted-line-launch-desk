# Test plan

## Scope
Engine rules (validation, gate, approvals, publish, verify, metrics, agenda), the browser UI at desktop and mobile widths, the static deploy, and the demo video.

## Levels
| Level | How | Where | Pass criteria |
|---|---|---|---|
| Unit | `npm test` (node:test, no dependencies) | `tests/engine.test.mjs` | All tests pass; one test per acceptance criterion in [user-stories.md](user-stories.md) |
| UI smoke | Headless Chrome via Playwright at 1366×900 and 390×844 | local `npm run serve` | No console or page errors; no horizontal overflow; v1 shows HOLD with gaps; v2 reaches READY → approve → publish → noop → verified |
| Visual | Screenshots inspected by eye at both widths | — | Logo visible, independent-concept notice visible, nothing clipped |
| Deploy | `curl` the live URL and its assets | GitHub Pages | HTTP 200 for page, JS, logo and MP4 with no sign-in |
| Video | ffprobe and volumedetect over 2s windows; frames sampled | `demo/` | 1080×1920, audio in every window, frames are the real app |
| Publication audit | grep of all tracked files and full history; check authors and MP4 tags | repo | No tool or agent attribution, machine paths or credentials; Ayo Ahmed is the only author |

## Case matrix (engine)
| Area | Positive | Negative / edge |
|---|---|---|
| Columns | v1 and v2 have all 10 | missing column ⇒ whole file rejected |
| Duplicates | identical ⇒ kept once | conflict ⇒ rejected; same name with different IDs ⇒ both kept |
| Row checks | valid rows accepted | blank field, unknown stage, bad number, bad date |
| Framework | v2 covers 8/8 | SLA over max, authority over cap, stale evidence, wording mismatch, no sign-off, stage missing |
| Gate | v2 READY | v1 HOLD with every gap listed |
| Approvals | both on current hash ⇒ publish allowed | older hash ⇒ refused |
| Publish | first ⇒ published | second ⇒ noop; on HOLD ⇒ refused |
| Verify | fresh read matches | tampered store ⇒ fails |
| Metrics | segments shown with n | aggregate better but segments worse ⇒ NO DECISION; immature claims excluded from reopen |
| Agenda | items tagged HYPOTHESIS / TO TEST | no metrics ⇒ only gap-derived items |

## Out of scope
Real client specs, load and performance, accessibility audit beyond a manual check, and cross-browser testing beyond Chrome.

Results are recorded in [test-results.md](test-results.md).
