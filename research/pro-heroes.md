# Pro batch 1: 20 hero blocks

**Bar:** better than the hero sections in shadcnblocks, Tailwind Plus, Magic UI Pro, Untitled UI and Origin UI by being more specific. Each hero has one idea you can only get by using the block (a real command palette, a calculator that computes, a form with states), a media slot with generated fallback art, dark mode, right-to-left support and keyboard access. Those kits were only looked at; no code was copied.

**What the kits do**
- Marketing-kit heroes are mostly a headline, two buttons and a static screenshot inside a different frame. Little behaviour, little distinction between them.
- Animated libraries (Magic UI, Aceternity) give single effects (beams, spotlight, globe) with no content structure, no form logic and weak accessibility (no reduced-motion fallback, hidden tab traps).
- Template kits include sign-up forms but without validation, loading, error or success states.

**What these 20 do differently**

| # | Idea | Behaviour you can't get from a screenshot |
|---|---|---|
| 1 | Aurora with product shot | Glow-border frame, media slot (light and dark file), proof row |
| 2 | Bento of live widgets | Counting figure, working switches, progress ring |
| 3 | Command palette | Real combobox: filter, arrow keys, Enter, `onSelect` |
| 4 | Email capture + logo marquee | Validation, loading, error, success; marquee pauses |
| 5 | Cinematic video | Full-bleed backdrop slot, film card opens a dialog |
| 6 | Retro horizon | Moving grid floor and striped sun, always dark |
| 7 | Audience switcher | Segmented switch swaps headline, points, CTA and image |
| 8 | Tilted screenshot wall | Three drifting columns, pause on hover and focus |
| 9 | Giant counter | Count-up number and definition list with trends |
| 10 | Rotating customer quotes | Tabs with arrow keys, pause button, stops under reduced motion |
| 11 | Orbiting integrations | Two counter-rotating rings, hidden list for screen readers |
| 12 | Download with platform detection | Picks the visitor's OS after load, copyable command |
| 13 | API with runnable code | Language tabs, Run streams the response |
| 14 | Conference countdown | Live countdown, ticket progress, speakers |
| 15 | Mobile app | Phone slot, floating notifications, store buttons |
| 16 | Waitlist with position | Place in line and a copyable invite link |
| 17 | Rotating word + ticker | Screen reader gets the whole sentence |
| 18 | Laptop and phone | Two media slots, opening laptop |
| 19 | ROI calculator | Slider recomputes savings; honest formula shown |
| 20 | Flashlight reveal | Pointer light; drifts on touch; rests under reduced motion |

**Decisions**
- Names are `hero-pro-N`; they live in the private Pro repository (`registry/pro`), install as `@ballmac-pro/hero-pro-N`.
- Media slot props follow phase 4: `media`/`mediaAlt` for one big picture, `screen`, `desktop`/`mobile`, `backdrop`, `image` per audience or tile.
- Every form is a real `<form>` with a label, `aria-invalid`, `role="alert"` errors and `role="status"` success.
- Anything auto-moving stops or has a pause control (hero 10), or is decorative and stops under reduced motion.
- Code samples are tokenised by hand; no syntax-highlighter dependency.
- Colours come from tokens. Where text sits on a tinted chip, the foreground token is used for contrast (axe caught chart-2 on white).

**Lessons**
- Tailwind skips git-ignored folders; the private checkout needs its own `@source` line in `globals.css`.
- A section forced into `dark` keeps its own colours when the page is light, so it needs no `dark:` variants.
- `BlurFadeGroup` keeps content hidden until it scrolls in; above-the-fold copy should pass `inView: false`.
- A definition list's `div` wrapper may hold only `dt` and `dd`, so a sparkline goes inside the `dd`.
- A string such as `from "parcel"` in a code sample trips the import detector in `pnpm check`; split it into tokens.
