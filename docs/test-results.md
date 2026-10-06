# Test results

Actual output of `npm test` (Node v22.23.3), run on 2026-10-06.

```

> claimsorted-line-launch-desk@0.1.0 test
> node --test tests/*.test.mjs

TAP version 13
# Subtest: v1 spec holds launch with every expected gap
ok 1 - v1 spec holds launch with every expected gap
# Subtest: identical duplicate is kept once; same name with different IDs is not merged
ok 2 - identical duplicate is kept once; same name with different IDs is not merged
# Subtest: missing columns rejects the whole file
ok 3 - missing columns rejects the whole file
# Subtest: v2 spec is READY
ok 4 - v2 spec is READY
# Subtest: publish refuses on HOLD and without approvals; is idempotent; verifies on fresh read
ok 5 - publish refuses on HOLD and without approvals; is idempotent; verifies on fresh read
# Subtest: approval for an older pack hash does not carry over
ok 6 - approval for an older pack hash does not carry over
# Subtest: tampered stored pack fails verification
ok 7 - tampered stored pack fails verification
# Subtest: pilot metrics refuse the misleading aggregate
ok 8 - pilot metrics refuse the misleading aggregate
# Subtest: regression cases and agenda derive from real gaps
ok 9 - regression cases and agenda derive from real gaps
1..9
# tests 9
# suites 0
# pass 9
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 58.33469
```

Rendered checks: Chrome headless at 1366×900 and 390×844, no page errors or console errors, `scrollWidth − innerWidth = 0` at both widths.
