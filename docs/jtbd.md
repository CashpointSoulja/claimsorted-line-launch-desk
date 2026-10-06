# Jobs to be done (hypotheses)

These are hypotheses drawn from ClaimSorted's public role description ("make the framework hold as we add more", "metrics trustworthy enough to act on"). They haven't been validated with ClaimSorted staff or clients.

## Core job
**When** a new client line is about to go live, **I want to** know every place where the client's handling spec doesn't meet our claims framework, **so I can** launch on the agreed date without handlers improvising on live claims.

## Related jobs
| # | When… | I want to… | So I can… | Where the desk does it |
|---|---|---|---|---|
| J1 | a client sends a spec spreadsheet | reject malformed rows and resolve duplicates by ID | trust that what I import is what they meant | Import + Row validation |
| J2 | the spec is imported | see coverage of all eight framework stages | spot missing complaint or reporting routes before go-live | Framework coverage |
| J3 | someone asks "can we go live?" | get one answer with every open gap listed | have a single conversation with the client, not ten | Launch gate (HOLD/READY) |
| J4 | the client and ops agree | sign off the exact version | avoid a later edit silently inheriting an old approval | Approve & publish (hash-bound) |
| J5 | publish is pressed twice or retried | have nothing duplicated | keep one source of truth for handlers | Idempotent publish + fresh-read verify |
| J6 | pilot week two looks faster | know whether it's real or case mix | avoid scaling a change that made every segment slower | Pilot metrics (NO DECISION) |
| J7 | a handler keeps skipping a step | turn it into a question for product | fix the tool or the playbook rather than blame people | Product agenda (TO TEST) |

## Emotional and social jobs
- Ops lead: "I don't want to be the person who launched a line with no complaint route."
- Client ops contact: "I want my sign-off to mean this version, not whatever it becomes later."
- Product manager: "I want frontline evidence I can prioritise against, not loud anecdotes."
