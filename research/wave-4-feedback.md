# Wave 4: feedback and status research

Reviewed 2026-09-30. All ten components are original Ballmac implementations. We reviewed the public demos and catalogs of shadcn/ui, Magic UI, Aceternity UI, DaisyUI, ReUI, Origin UI, Cult UI, Kibo UI, 21st.dev, Motion Primitives, Tailwind Plus, and Apple's Human Interface Guidelines. No competitor source code was copied. The existing Ballmac `Empty` primitive is composed by Empty State.

| Item | Competitor pattern considered | Ballmac improvement |
| --- | --- | --- |
| Banner | ReUI and DaisyUI alerts; shadcn Alert | Page-wide copy hierarchy, separate action, semantic tone, controlled and local dismissal |
| Callout | shadcn Alert; documentation callouts in Origin UI | Editorial guidance with visible kind label, icon, action, and theme-token rail |
| Status Dot | DaisyUI Status; ReUI badges | Status text always accompanies color, optional announcement, reduced-motion pulse |
| Empty State | shadcn Empty; 21st.dev empty states | A ready-to-install recipe over Ballmac Empty, with primary and secondary actions |
| Progress Steps | DaisyUI Steps; ReUI steppers | Ordered-list semantics, current-step marker, keyboard navigation back to completed steps |
| Loading Dots | DaisyUI Loading; Magic UI motion examples | Accessible status name, three sizes, animation stops for reduced motion |
| Inline Alert | shadcn Alert; ReUI validation summaries | Small form-friendly footprint, live priority by tone, corrective action slot |
| Toast Stack | shadcn/Sonner; DaisyUI Toast; 21st.dev notification stacks | Translucent token surfaces, controlled/local state, Escape dismissal, pause while interacting |
| Countdown | DaisyUI Countdown | Deterministic server render, controlled/local seconds, pause and completion announcement |
| Shortcut Hint | shadcn Kbd; 21st.dev action hints | Full accessible action phrase plus compact visual keycaps |

References: [shadcn component catalog](https://ui.shadcn.com/docs/components), [shadcn Alert](https://ui.shadcn.com/docs/components/base/alert), [Magic UI catalog](https://magicui.design/docs/components), [Aceternity catalog](https://ui.aceternity.com/components), [DaisyUI catalog](https://daisyui.com/components/), [ReUI catalog](https://reui.io/components), [Origin UI](https://originui.com), [Cult UI](https://www.cult-ui.com/docs/components), [Kibo UI](https://www.kibo-ui.com/components), [21st.dev components](https://21st.dev/community/components), [Motion Primitives](https://motion-primitives.com/docs), [Tailwind Plus application UI](https://tailwindcss.com/plus/ui-blocks/application-ui), [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/).
