# State machines

These are as implemented in `public/engine.js` and `public/app.js`.

## 1. Spec row
```mermaid
stateDiagram-v2
  [*] --> Parsed
  Parsed --> Rejected: error (MISSING_ID, MISSING_FIELDS, UNKNOWN_STAGE, BAD_NUMBER, BAD_DATE)
  Parsed --> Deduped: same rule_id, identical content
  Parsed --> Rejected: same rule_id, different content (DUPLICATE_CONFLICT)
  Parsed --> Accepted_Blocked: any blocker (SLA, authority, stale, wording, sign-off)
  Parsed --> Accepted_Ready: no issues
```

## 2. Launch gate
```mermaid
stateDiagram-v2
  [*] --> NoSpec
  NoSpec --> HOLD: validate (any gap)
  NoSpec --> READY: validate (0 gaps, 8/8 stages)
  HOLD --> READY: revised spec validates clean
  READY --> HOLD: edited spec introduces a gap
```
Gap = any `error` or `blocker` issue, or a stage that is `missing` or `blocked`.

## 3. Approval (per approver: ops_lead, client_programme_owner)
```mermaid
stateDiagram-v2
  [*] --> Unapproved
  Unapproved --> Approved_h: approve while gate READY, current hash h
  Approved_h --> Stale: spec edit changes hash to h'
  Stale --> Approved_h2: re-approve h'
```
An approval counts only if its stored hash equals the current pack hash.

## 4. Publication
```mermaid
stateDiagram-v2
  [*] --> Unpublished
  Unpublished --> Unpublished: publish refused (HOLD or missing/stale approval)
  Unpublished --> Published: publish (READY + both approvals = h)
  Published --> Published: publish again (noop, nothing written)
  Published --> Verified: fresh read, recomputed hash = h
  Published --> Tampered: fresh read, recomputed hash ≠ h
  Published --> Unpublished: reset local state
```

## 5. Pilot metric decision (median cycle time)
```mermaid
stateDiagram-v2
  [*] --> Evaluate
  Evaluate --> NO_DECISION: aggregate improved AND a segment worsened
  Evaluate --> HOLD: any segment n < 30
  Evaluate --> IMPROVED: aggregate improved, segments agree, samples sufficient
  Evaluate --> NOT_IMPROVED: aggregate not improved, samples sufficient
```
`NO DECISION` takes precedence. Under-sampled segments are appended to its explanation.
