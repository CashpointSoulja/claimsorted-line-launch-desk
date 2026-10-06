# Test results

Actual output of `npm test` (Node v22.23.3), run on 2026-10-06.

```
TAP version 13
# Subtest: travel sample: every category drafted or flagged, each with its source sentence from the wording
ok 1 - travel sample: every category drafted or flagged, each with its source sentence from the wording
  ---
  duration_ms: 6.078394
  type: 'test'
  ...
# Subtest: category absent from the wording is "not found: needs human", with no row invented
ok 2 - category absent from the wording is "not found: needs human", with no row invented
  ---
  duration_ms: 0.819192
  type: 'test'
  ...
# Subtest: ambiguous clause is flagged for a human and never becomes a rule row
ok 3 - ambiguous clause is flagged for a human and never becomes a rule row
  ---
  duration_ms: 0.317018
  type: 'test'
  ...
# Subtest: refuses empty, non-wording and oversized input without throwing
ok 4 - refuses empty, non-wording and oversized input without throwing
  ---
  duration_ms: 0.442297
  type: 'test'
  ...
# Subtest: never crashes on arbitrary text (seeded fuzz)
ok 5 - never crashes on arbitrary text (seeded fuzz)
  ---
  duration_ms: 12.700727
  type: 'test'
  ...
# Subtest: drafted rows flow through Import and Validate unrejected, and the Gate holds them
ok 6 - drafted rows flow through Import and Validate unrejected, and the Gate holds them
  ---
  duration_ms: 2.713917
  type: 'test'
  ...
# Subtest: missing version and date become NEEDS_HUMAN, not guesses; output is deterministic
ok 7 - missing version and date become NEEDS_HUMAN, not guesses; output is deterministic
  ---
  duration_ms: 0.439655
  type: 'test'
  ...
# Subtest: v1 spec holds launch with every expected gap
ok 8 - v1 spec holds launch with every expected gap
  ---
  duration_ms: 3.04412
  type: 'test'
  ...
# Subtest: identical duplicate is kept once; same name with different IDs is not merged
ok 9 - identical duplicate is kept once; same name with different IDs is not merged
  ---
  duration_ms: 0.530369
  type: 'test'
  ...
# Subtest: missing columns rejects the whole file
ok 10 - missing columns rejects the whole file
  ---
  duration_ms: 0.404327
  type: 'test'
  ...
# Subtest: v2 spec is READY
ok 11 - v2 spec is READY
  ---
  duration_ms: 0.650097
  type: 'test'
  ...
# Subtest: publish refuses on HOLD and without approvals; is idempotent; verifies on fresh read
ok 12 - publish refuses on HOLD and without approvals; is idempotent; verifies on fresh read
  ---
  duration_ms: 10.297203
  type: 'test'
  ...
# Subtest: approval for an older pack hash does not carry over
ok 13 - approval for an older pack hash does not carry over
  ---
  duration_ms: 0.434062
  type: 'test'
  ...
# Subtest: tampered stored pack fails verification
ok 14 - tampered stored pack fails verification
  ---
  duration_ms: 0.456787
  type: 'test'
  ...
# Subtest: pilot metrics refuse the misleading aggregate
ok 15 - pilot metrics refuse the misleading aggregate
  ---
  duration_ms: 0.731214
  type: 'test'
  ...
# Subtest: regression cases and agenda derive from real gaps
ok 16 - regression cases and agenda derive from real gaps
  ---
  duration_ms: 0.930129
  type: 'test'
  ...
# Subtest: six illustrative lines matching the lines listed on claimsorted.com
ok 17 - six illustrative lines matching the lines listed on claimsorted.com
  ---
  duration_ms: 2.406564
  type: 'test'
  ...
# Subtest: readiness comes from the same validate + gate engine
ok 18 - readiness comes from the same validate + gate engine
  ---
  duration_ms: 4.354211
  type: 'test'
  ...
# Subtest: per-line decisions and the gaps that drive them
ok 19 - per-line decisions and the gaps that drive them
  ---
  duration_ms: 0.97818
  type: 'test'
  ...
1..19
# tests 19
# suites 0
# pass 19
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 74.849674
```

Rendered checks: Chrome headless at 1366×900 and 390×844, no page errors or console errors, `scrollWidth − innerWidth = 0` at both widths.

## Demo video check

```text
$ ffprobe demo/line-launch-desk-demo.mp4
h264 1080x1920, aac 48000 Hz stereo, duration 115.174 s
$ ffmpeg volumedetect, 2 s windows at t=2,12,22,32,42,52,62,72,82,92,102,112
mean_volume -22.9, -20.3, -18.6, -22.8, -18.8, -18.2, -17.0, -17.9, -18.6, -22.9, -20.7, -19.1 dB (no silent window)
$ ffmpeg silencedetect noise=-40dB d=0.6
no silence of 0.6 s or longer
```

Frames sampled every 4 s and checked by eye: every frame is the working app with synthetic data, including the line switcher and the wording drafter, and captions are burned in below the content.
