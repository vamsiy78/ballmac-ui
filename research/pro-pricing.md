# Pro batch 3: 15 pricing blocks

**Bar:** pricing sections in kits are three cards and a toggle. Pricing is where visitors decide, so these fifteen each answer a different buying question honestly, with the arithmetic visible and every number formatted for a fixed locale so the server and browser agree. Kits were looked at only; no code was copied. All prices in the demos are sample numbers.

| # | Question it answers | What it does |
|---|---|---|
| 1 | Monthly or yearly? | Rolling digits, computed saving badge, glowing favourite |
| 2 | What does a bigger team cost per seat? | Slider with volume tiers; the active tier is marked |
| 3 | What will I pay for what I use? | Sliders produce a line-by-line bill |
| 4 | How do the plans differ in detail? | Sticky table, collapsible groups, one plan at a time on phones |
| 5 | Is there only one plan? | Term picker (monthly, yearly, longer) with arrow keys |
| 6 | Can I pay what I want? | Presets, validated custom amount, impact line |
| 7 | Which plan is for me? | Three questions, a recommendation with reasons |
| 8 | What is the price in my currency? | You supply each price; nothing is converted |
| 9 | What about enterprise? | Dark panel with a validated contact form |
| 10 | What does that feature mean? | Info button opens a plain-words explanation |
| 11 | Which one do you want me to choose? | Raised dark middle plan |
| 12 | Can I add only what I need? | Base plan plus extras with a sticky summary |
| 13 | How much do credits cost? | Packs, bonus, per-credit price and saving |
| 14 | Is there a price for my group? | Tabs for individuals, teams, students and nonprofits |
| 15 | What happens during the trial? | Timeline plus the price afterwards |

**Decisions**
- Policies are copy, not code: trial length, eligibility, refunds and discounts are props with neutral sample text. Edit them to match what you actually offer.
- Every number that changes is derived in one place and tested (tier price × seats, blocks above the included amount, base + extras − yearly discount, credits + bonus).
- Money uses `Intl.NumberFormat` with a `locale` prop and a currency code. Block 8 takes explicit prices per currency instead of converting.
- Forms (6, 9) validate on submit, move focus to the first error and use `role="alert"` and `role="status"`.

**Lessons**
- `dir="ltr"` on a block that holds a number also pins it to the left in a right-to-left page; put it on the number itself.
- Small green text (`chart-2`) on white fails contrast; use the foreground colour for text and keep green for icons and fills.
- Card CTAs need a flexible list above them (`flex-1`) or they collide with long feature lists.
- Accessible names of cards built from block-level spans have no spaces in jsdom; test with loose patterns.
