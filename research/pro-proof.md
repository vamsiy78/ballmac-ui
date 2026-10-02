# Pro batch 5: testimonials, logos, stats and calls to action (20)

Looked at (not copied): Magic UI testimonial and marquee patterns (MIT), shadcn blocks (MIT), Tremor (Apache-2.0), DaisyUI stats, and paid kits for layout ideas only. No code was taken from paid or unlicensed kits. Logos in the demos are invented wordmarks, never real brands.

**Testimonials (7)**
| Block | Question it answers |
|---|---|
| testimonials-pro-1 | Do people like me say good things about this topic? Topic chips filter a masonry wall |
| testimonials-pro-2 | Is it popular? Two opposing rows with a real pause button |
| testimonials-pro-3 | What is the best single story? One big quote with a person picker |
| testimonials-pro-4 | What did it do for them? Counting number first, quote second |
| testimonials-pro-5 | Can I read longer quotes at my pace? Scroll-snap carousel with keys |
| testimonials-pro-6 | What is the rating and what do critics say? Average, bars, sort, Helpful |
| testimonials-pro-7 | Which story is closest to mine? Expanding panels |

**Logo clouds (4)**: counted moving rows (1), grid with a result on hover (2), industry tabs (3), logos in orbit (4).

**Stats (5)**: numbers with trend lines (1), ninety-day uptime strip (2), return-on-investment slider (3), regions on a map (4), us against the average (5).

**Calls to action (4)**: newsletter (1), split with picture (2), pointer spotlight (3), launch countdown with waiting list (4).

**Decisions**
- Every claim is a prop: figures, assumptions (ROI), sources (comparison) and launch dates are sample data and are labelled as such. The comparison block always prints a source line.
- Moving content has a stop: block 2 has a button, markers pause on hover and focus, reduced motion makes rows static and scrollable, and the orbit is CSS-only and turned off for reduced motion.
- Forms (cta 1 and 4) validate on submit, mark the input invalid, announce errors with `role="alert"` and move focus to the success message.
- The countdown renders placeholders on the server and starts after mount so server and browser markup match; its label summarises the time left instead of reading every second.
- The uptime percentage is computed from the days given, so the bars and the headline never disagree.

**Lessons**
- A `dl` needs `dt` before `dd`; reverse the visual order with `flex-col-reverse`.
- Counter-rotating items in an orbit need the animation to include their own offset, or the logo snaps upright without its position.
- Any text with the words "Based on" trips the licence check; write "From".
