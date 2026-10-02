# Pro batch 2: 20 feature blocks

**Bar:** feature sections in kits are usually a grid of icon, title and sentence. These twenty each teach something by letting the visitor do it (drag, filter, press keys, switch controls) or by showing proof (measured numbers, a real comparison table). Kits were looked at only; no code was copied.

| # | Idea | What you can do or see |
|---|---|---|
| 1 | Before / after slider | Drag or arrow-key a divider; before and after media slots |
| 2 | Pointer-lit grid | One glow follows the pointer across all cards |
| 3 | Auto accordion | Steps advance on a progress line; pause control; picture per step |
| 4 | Us vs them table | Real table, hidden text for ticks and crosses |
| 5 | Measured results | Count-up numbers with bars, line or ring |
| 6 | Filterable list | Category chips, search, live count |
| 7 | Live controls | Switches move a score ring and an activity log |
| 8 | Drawing workflow | Connector line draws itself on scroll |
| 9 | Alternating rows | Tag, points, quote and picture slot per row |
| 10 | Press the keys | Real key combinations light up the list |
| 11 | Terminal-driven | Pick a feature, a terminal types the commands |
| 12 | Release timeline | Typed changes (new, improved, fixed) |
| 13 | Hover-reveal cards | Glow edge; details open on hover or focus |
| 14 | Chips in motion | Three marquee rows of capabilities |
| 15 | Platform tabs | Web, mobile, desktop with arrow-key tabs |
| 16 | Scroll-snap carousel | Native snap, arrows disable at the ends |
| 17 | Sticky stack | Cards pile up as you scroll (pure CSS) |
| 18 | Picture mosaic | Media tiles with spans and links |
| 19 | In every plan | Calm panel of what all plans include |
| 20 | Assistant skills | Skill picker over a streaming sample chat |

**Decisions**
- Names are `features-pro-N`, installed from the private registry as `@ballmac-pro/features-pro-N`.
- Each is a `<section aria-labelledby>` with one `h2`.
- Anything that moves by itself can be paused or is decorative and stops under reduced motion.
- Media slots follow phase 4 (`before`/`after`, `image` per item, `tiles[].image`).
- Colour is never the only carrier of meaning (ticks have hidden text, the score has a word, chips have labels).

**Lessons**
- Coloured text on a tinted chip fails contrast for most chart tokens; keep chip text `text-foreground` and colour only the icon.
- `role="region"` on a `ul` removes the list semantics; put the region on a wrapper and the list inside.
- Scroll-snap needs `scroll-padding` to match the container's padding or the first card sticks to the edge.
- `display: contents` wrappers cannot be animated; animate a real box.
- A sticky stack needs no JavaScript: each card gets `position: sticky` with a slightly larger `top`.
