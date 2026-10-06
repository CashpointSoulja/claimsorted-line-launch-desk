# Test results

Actual output of `npm test` (Node v22.23.3), run on 2026-10-06.

```
TAP version 13
# Subtest: travel sample: every category drafted or flagged, each with its source sentence from the wording
ok 1 - travel sample: every category drafted or flagged, each with its source sentence from the wording
  ---
  duration_ms: 5.347873
  type: 'test'
  ...
# Subtest: category absent from the wording is "not found: needs human", with no row invented
ok 2 - category absent from the wording is "not found: needs human", with no row invented
  ---
  duration_ms: 0.712945
  type: 'test'
  ...
# Subtest: ambiguous clause is flagged for a human and never becomes a rule row
ok 3 - ambiguous clause is flagged for a human and never becomes a rule row
  ---
  duration_ms: 0.284896
  type: 'test'
  ...
# Subtest: refuses empty, non-wording and oversized input without throwing
ok 4 - refuses empty, non-wording and oversized input without throwing
  ---
  duration_ms: 0.441658
  type: 'test'
  ...
# Subtest: never crashes on arbitrary text (seeded fuzz)
ok 5 - never crashes on arbitrary text (seeded fuzz)
  ---
  duration_ms: 10.893945
  type: 'test'
  ...
# Subtest: drafted rows flow through Import and Validate unrejected, and the Gate holds them
ok 6 - drafted rows flow through Import and Validate unrejected, and the Gate holds them
  ---
  duration_ms: 1.734597
  type: 'test'
  ...
# Subtest: missing version and date become NEEDS_HUMAN, not guesses; output is deterministic
ok 7 - missing version and date become NEEDS_HUMAN, not guesses; output is deterministic
  ---
  duration_ms: 0.331527
  type: 'test'
  ...
# Subtest: v1 spec holds launch with every expected gap
ok 8 - v1 spec holds launch with every expected gap
  ---
  duration_ms: 1.617136
  type: 'test'
  ...
# Subtest: identical duplicate is kept once; same name with different IDs is not merged
ok 9 - identical duplicate is kept once; same name with different IDs is not merged
  ---
  duration_ms: 0.418018
  type: 'test'
  ...
# Subtest: missing columns rejects the whole file
ok 10 - missing columns rejects the whole file
  ---
  duration_ms: 0.163418
  type: 'test'
  ...
# Subtest: v2 spec is READY
ok 11 - v2 spec is READY
  ---
  duration_ms: 0.211564
  type: 'test'
  ...
# Subtest: publish refuses on HOLD and without approvals; is idempotent; verifies on fresh read
ok 12 - publish refuses on HOLD and without approvals; is idempotent; verifies on fresh read
  ---
  duration_ms: 8.108561
  type: 'test'
  ...
# Subtest: approval for an older pack hash does not carry over
ok 13 - approval for an older pack hash does not carry over
  ---
  duration_ms: 0.396176
  type: 'test'
  ...
# Subtest: tampered stored pack fails verification
ok 14 - tampered stored pack fails verification
  ---
  duration_ms: 0.411027
  type: 'test'
  ...
# Subtest: pilot metrics refuse the misleading aggregate
ok 15 - pilot metrics refuse the misleading aggregate
  ---
  duration_ms: 0.675473
  type: 'test'
  ...
# Subtest: regression cases and agenda derive from real gaps
ok 16 - regression cases and agenda derive from real gaps
  ---
  duration_ms: 0.820187
  type: 'test'
  ...
1..16
# tests 16
# suites 0
# pass 16
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 64.929093
```

Rendered checks: Chrome headless at 1366×900 and 390×844, no page errors or console errors, `scrollWidth − innerWidth = 0` at both widths.

## Demo video check

```text
$ ffprobe demo/line-launch-desk-demo.mp4
h264 1080x1920, aac 48000 Hz stereo, duration 91.934 s
$ ffmpeg volumedetect, 2 s windows at t=2,10,20,30,40,50,60,70,80,89
mean_volume -22.6, -21.6, -21.6, -17.7, -20.5, -21.3, -19.7, -20.3, -25.7, -20.2 dB (no silent window)
```

Frames sampled every 8 s and checked by eye: every frame is the working app with synthetic data, and captions sit below the content.
