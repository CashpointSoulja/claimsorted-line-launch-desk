# Brand sheet

Written before the UI, from the public ClaimSorted site (claimsorted.com, viewed at 1366px and 390px) and its stylesheet. The point is to make Line Launch Desk look like something that belongs next to ClaimSorted's own product, not like a generic dashboard.

## Logo
- The literal ClaimSorted wordmark, taken from the inline SVG in the live site header (viewBox `0 0 140 32`), saved unchanged as `public/assets/claimsorted-logo.svg`.
- It sits top-left, followed by a thin divider and the product name "Line Launch Desk".
- Directly under the header, a strip reads: "Independent concept by Ayo Ahmed. Not affiliated with ClaimSorted."

## Colour (from the site's CSS custom properties)
| Token | Value | Use |
|---|---|---|
| `--color--black` | `#1a1a1a` | Text |
| `--color--grey` | `#757575` | Secondary text |
| `--color--light-grey` | `#f3f3f5` | Card surfaces |
| `--color--blue` | `#2963e9` | Primary actions, covered stages, READY |
| `--color--blue-hover` | `#1242b0` | Hover |
| `--color--light-blue` | `#2963e90d` | Hero wash |
| Untitled UI orange 50/700 | `#fef6ee` / `#b93815` | HOLD and blockers |
| Untitled UI success 50/700 | `#ecfdf3` / `#027a48` | OK and verified |

## Type
- The site uses **Outfit Variable**. Outfit is open source (SIL OFL), so the app ships the Latin woff2 locally. No proprietary font needed a fallback.
- Big bold hero headline with a lighter second line, grey body copy at about 19px. The hero copies this pattern.

## Components mirrored
- Blue rounded-rectangle buttons (12px radius), like "Book a Meeting".
- Light-grey 24px-radius cards holding white inner panels, like the product illustrations (claim status, closed claims).
- The claim-status stepper (blue active pill, grey upcoming pills) becomes the 7-step launch stepper.
- The "Closed claims" chart style (blue-to-light gradient rounded bars, dashed gridline) becomes the adoption-by-handler chart.

## Don'ts
- Don't recreate ClaimSorted screens or imply this is ClaimSorted software.
- No customer logos, award badges or testimonials.
