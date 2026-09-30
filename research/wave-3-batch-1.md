# Wave 3 batch 1: data display research

Reviewed 2026-09-30. All ten implementations were written for Ballmac; no
third-party source code or close structure was reused. We checked the catalogs
of shadcn/ui, Magic UI, Motion Primitives, Aceternity, DaisyUI, Origin UI,
ReUI, Cult UI, Kibo UI, 21st.dev, Tailwind Plus, and Apple's Human Interface
Guidelines. Libraries without a direct analogue informed only the visual and
interaction review.

| Item | Relevant competitor pattern | Ballmac improvement |
| --- | --- | --- |
| Stat Card | DaisyUI Stat; shadcn Card; ReUI dashboard cards | Signed, intent-aware trend; optional visual; compact responsive hierarchy |
| KPI Row | DaisyUI Stats; ReUI dashboard metrics | Semantic `dl`, configurable width, readable narrow layout |
| Timeline | DaisyUI and ReUI timeline | Composable parts with current/completed states and semantic dates |
| Activity Feed | ReUI activity timeline | Actor/action structure, machine-readable dates, explicit empty state |
| Description List | shadcn Card and Tailwind Plus detail layouts | Native `dl` semantics; responsive stacked/split variants |
| Comparison Table | DaisyUI tables and Tailwind Plus comparison layouts | Table headers, text alternatives for boolean cells, keyboard-scroll region |
| Avatar Stack | Magic UI Avatar Circles and shadcn Avatar | Group name includes every person, visible overflow count, no image dependency |
| Progress Ring | Magic UI Animated Circular Progress; shadcn Progress | Accessible meter values, token colors, reduced-motion transition |
| Sparkline | shadcn Chart; ReUI compact dashboard trends | Tiny SVG without chart dependency, descriptive accessible name |
| Contribution Graph | 21st.dev contribution heatmaps | Deterministic data API, token intensity, accessible total summary |

References: [shadcn Card](https://ui.shadcn.com/docs/components/base/card),
[shadcn Chart](https://ui.shadcn.com/docs/components/base/chart),
[shadcn Progress](https://ui.shadcn.com/docs/components/base/progress),
[DaisyUI Stat](https://daisyui.com/components/stat/),
[DaisyUI Timeline](https://daisyui.com/components/timeline/),
[ReUI Timeline](https://reui.io/docs/components/base/timeline),
[ReUI Card](https://reui.io/components/card),
[Magic UI Circular Progress](https://magicui.design/docs/components/animated-circular-progress-bar),
[Magic UI catalog](https://magicui.design/docs/components),
[21st.dev Contribution Graph](https://21st.dev/community/components/educalvolpz/contribution-graph),
[Aceternity catalog](https://ui.aceternity.com/components),
[Origin UI](https://github.com/shadcn/originui),
[Cult UI](https://www.cult-ui.com/docs/components),
[Kibo UI](https://www.kibo-ui.com/components),
[Motion Primitives](https://motion-primitives.com/docs),
[Tailwind Plus application UI](https://tailwindcss.com/plus/ui-blocks/application-ui),
[Apple HIG](https://developer.apple.com/design/human-interface-guidelines/).
