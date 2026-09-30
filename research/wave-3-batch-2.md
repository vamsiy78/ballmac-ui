# Wave 3 batch 2: interactive data display research

Reviewed 2026-09-30. These six implementations were written for Ballmac. No
competitor code or structure was reused. We reviewed shadcn/ui, Magic UI,
Aceternity UI, DaisyUI, ReUI, Origin UI, 21st.dev, Kibo UI, Cult UI, Motion
Primitives, and Tailwind Plus for visual and interaction patterns. Components
without a direct analogue informed the general design review only.

| Item | Relevant competitor pattern | Ballmac improvement |
| --- | --- | --- |
| Tree View | ReUI Tree; 21st.dev file explorers | Flat ARIA tree with level and sibling metadata, roving focus, arrow/Home/End navigation, and controlled expansion |
| File Tree | Magic UI File Tree; ReUI Tree | File-specific icons over the same keyboard-complete tree API, with a default accessible name |
| JSON Viewer | ReUI Code Block; 21st.dev JSON viewers | Recursive disclosure controls, initial expansion depth, visible value types, keyboard-scroll region |
| Diff Viewer | Magic UI Code Comparison; DaisyUI Diff | Actual line diff with aligned context, line counts, screen-reader change labels, and horizontal keyboard scrolling |
| Kanban Board | ReUI Kanban; 21st.dev boards | Pointer drag, visible move controls, Alt+arrow keyboard moves, and live movement announcement |
| Calendar Agenda | shadcn Calendar; Origin UI event calendar | Compact day agenda with native date input, day navigation, sorted events, all-day state, and deterministic timezone formatting |

References: [ReUI Tree](https://reui.io/docs/components/base/tree),
[ReUI Kanban](https://reui.io/docs/components/base/kanban),
[Magic UI File Tree](https://v3.magicui.design/docs/components/file-tree),
[Magic UI Code Comparison](https://magicui.design/docs/components/code-comparison),
[DaisyUI Diff](https://daisyui.com/components/diff/),
[shadcn Calendar](https://ui.shadcn.com/docs/components/base/calendar),
[Origin UI](https://originui.com),
[21st.dev](https://21st.dev/community/components),
[Aceternity UI catalog](https://ui.aceternity.com/components),
[Kibo UI catalog](https://www.kibo-ui.com/components),
[Cult UI catalog](https://www.cult-ui.com/docs/components),
[Motion Primitives catalog](https://motion-primitives.com/docs),
[Tailwind Plus application UI](https://tailwindcss.com/plus/ui-blocks/application-ui).
