# Wave 1 batch 1: competitor review

Reviewed 2026-09-29. The Ballmac sources credit the permissively licensed
shadcn/ui API and structure. No code was copied from the other libraries.

| Item | Ideas reviewed | Ballmac addition |
|---|---|---|
| Alert | shadcn composable alert; ReUI status tones and action patterns; Tailwind Plus actionable layouts | Five token-based tones, action slot, and opt-in urgent announcement |
| Aspect Ratio | shadcn ratio API; DaisyUI media/card layouts | Native CSS aspect ratio with guarded invalid values and reserved media space |
| Breadcrumb | shadcn parts; DaisyUI icon trails; Tailwind Plus hierarchy examples | Truncation at narrow widths, current-page semantics, and keyboard focus |
| Card | shadcn structure; Aceternity/Cult hover cards; ReUI dashboard density | Compact spacing, action slot, restrained lift, and reduced-motion behavior |
| Empty | shadcn composition; 21st.dev empty-state breadth; Tailwind Plus action patterns | Compact mode, clear next action, and an accessible icon slot |
| Pagination | shadcn links; DaisyUI breadth; Tailwind Plus responsive pages | Current-page contrast, 36px targets, compact mobile labels, native links |
| Progress | shadcn Radix behavior; DaisyUI variants; Apple progress guidance | Clamped value, optional percentage, and a distinct pending state |
| Separator | shadcn Radix semantics; DaisyUI labeled divider | Centered label while retaining decorative/semantic options |
| Skeleton | shadcn placeholder; ReUI composed loading layouts | Reduced-motion-safe pulse and realistic card/list demos |
| Spinner | shadcn loading icon; Apple compact activity guidance | Three sizes, accessible status name, and reduced-motion stop |

Magic UI and Motion Primitives concentrate on motion effects, while Kibo UI
focuses on more complex product components. Their catalogs informed the decision
to keep these foundational parts light and composable. Origin UI and DaisyUI
were reviewed for breadth and state variants; Aceternity, Cult UI, 21st.dev,
and Tailwind Plus were reviewed for presentation patterns only.

Sources: [shadcn/ui components](https://ui.shadcn.com/docs/components),
[shadcn MIT license](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md),
[DaisyUI components](https://daisyui.com/components/),
[Magic UI components](https://magicui.design/docs/components),
[Motion Primitives](https://motion-primitives.com/docs),
[Aceternity cards](https://ui.aceternity.com/categories/cards),
[Cult UI MinimalCard](https://www.cult-ui.com/docs/components/minimal-card),
[ReUI Alert](https://reui.io/docs/components/base/alert),
[ReUI Card](https://reui.io/components/card),
[21st.dev empty states](https://21st.dev/community/components/explore/shadcn-empty-state),
[Kibo UI](https://www.kibo-ui.com/docs),
[Origin UI](https://github.com/shadcn/originui),
[Tailwind Plus UI blocks](https://tailwindcss.com/plus/ui-blocks/application-ui),
[Apple progress indicators](https://developer.apple.com/design/human-interface-guidelines/progress-indicators).
