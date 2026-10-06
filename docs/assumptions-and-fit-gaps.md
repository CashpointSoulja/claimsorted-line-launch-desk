# Assumptions and fit gaps

## Assumptions (all untested)
- New lines and clients arrive with a handling spec that can be expressed as rules with an owner, SLA, authority limit, evidence document and version.
- A shared framework of stages applies across lines. The 8 stages here are my guess from ClaimSorted's public description (eNOL, assessment, fraud detection, reporting) plus standard claims practice.
- Policy-wording versions are tracked and can be compared exactly.
- Pilot data includes a usable complexity segment and a "playbook step used" signal.
- Limits used (24h eNOL acknowledgement, £5,000 handler authority, 72h payment, 72h complaint acknowledgement, 180-day evidence window) are illustrative only. They aren't ClaimSorted's numbers and aren't regulatory requirements.

## Current behaviour versus proposal
- **Documented by ClaimSorted (public):** white-label eNOL and claims portal; workflows designed around client wording, philosophy and tone; structured eligibility checks; fraud algorithms; daily, weekly or monthly reporting or live feeds via SFTP/API.
- **Not known:** how onboarding is run internally, whether a framework or gate already exists, and what metrics the claims team uses.
- **Proposed here:** a versioned gate, hash-bound approvals, denominator-first pilot metrics, and agenda translation. If parts already exist, this is a discussion piece about the parts that don't.

## Ayo's fit gaps (honest)
- No direct claims-handling or TPA experience. Insurance domain knowledge comes from public material, and I'd need to learn wording, delegated authority and bordereaux practice fast.
- No UK insurance regulatory background (FCA Consumer Duty, complaints handling rules). The prototype deliberately makes no regulatory claims.
- Strength being shown: turning messy inputs into a process with explicit gates, metrics with honest denominators, and a product agenda backed by evidence.
