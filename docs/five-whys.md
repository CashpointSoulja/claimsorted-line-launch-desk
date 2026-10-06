# Five Whys: a new line launches with handling gaps

Each answer is tagged **[Evidence]** (public source) or **[Assumption]** (to test in the first weeks).

**Problem statement (hypothesis):** A newly onboarded line could go live with a handling gap, for example no complaint route or a coverage rule citing last year's wording.

1. **Why would a gap reach go-live?** Because the client's handling spec is accepted as a document, not checked rule by rule against what every line must cover. [Assumption]
2. **Why isn't it checked rule by rule?** Because every client brings its own wording, authority and tone. ClaimSorted says it designs "workflows around your policy wording, claims philosophy, brand guidelines and tone of voice". [Evidence: claimsorted.com] So specs differ in shape. [Assumption]
3. **Why does that matter more now?** Because ClaimSorted handles auto, property, travel, gadget, pet, renters and liability [Evidence: YC job post], grew 10x in a year [Evidence: Ashby posting], and the role is asked to make the framework "hold as we add more". [Evidence: YC job post]
4. **Why would metrics not catch it quickly?** Because a blended cycle-time or reopen number can improve purely through case mix, and 30-day reopen rates are immature in the first month. The role asks for metrics "trustworthy enough to act on". [Evidence: YC job post; mechanism is standard statistics, not a ClaimSorted observation]
5. **Why does it end up on the product agenda late?** Because frontline findings ("handlers skip this step") arrive as anecdotes without rule IDs or counts, so they are hard to prioritise. [Assumption]

**Root cause (hypothesis):** there is no single versioned gate between "client sent the spec" and "handlers use it", and no metric view that refuses to decide on bad samples.

**Intervention tested by this prototype:** the gate, versioned approvals, idempotent publish and denominator-first pilot metrics. Whether ClaimSorted already does this internally is unknown. If it does, the useful part is the metric view and the product-agenda translation.
