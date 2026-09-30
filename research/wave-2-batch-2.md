# Wave 2 batch 2: completing forms

Reviewed 2026-09-30. All five implementations are original Ballmac code. We
reviewed the form catalogs of shadcn/ui, Magic UI, Motion Primitives,
Aceternity, DaisyUI, Origin UI, ReUI, Cult UI, Kibo UI, 21st.dev, Tailwind
Plus, and Apple's Human Interface Guidelines. No third-party code was reused.

| Item | Competitor pattern reviewed | Ballmac addition |
| --- | --- | --- |
| Date Range Picker | shadcn date picker composition; ReUI date selector presets | Native date keyboard behavior, visible endpoints, automatic range order, small preset API without calendar dependencies |
| Currency Input | shadcn Input; Origin UI and ReUI amount fields | Locale-aware idle formatting, raw editing without caret jumps, parsed numeric value, bounds and currency precision |
| Stepper Form | ReUI Stepper and wizard block; DaisyUI Steps | Step validation before advancing, revisit prior steps, completion action, accessible progress |
| Slider Range | shadcn Slider; DaisyUI Range | Two accessible Radix thumbs, explicit value span, custom formatting, minimum separation |
| Signature Pad | 21st.dev signature patterns; native canvas pads | Pointer drawing and undo, typed keyboard alternative, serialized native form value |

References: [shadcn Date Picker](https://ui.shadcn.com/docs/components/base/date-picker),
[shadcn Slider](https://ui.shadcn.com/docs/components/base/slider),
[Radix Slider](https://www.radix-ui.com/primitives/docs/components/slider),
[ReUI Date Selector](https://reui.io/components/date-selector),
[ReUI Stepper](https://reui.io/components/stepper/c-stepper-9),
[ReUI wizard block](https://reui.io/blocks/application/wizard/wizard-1),
[DaisyUI Range](https://daisyui.com/components/range/),
[Magic UI catalog](https://magicui.design/docs/components),
[Aceternity forms](https://ui.aceternity.com/categories/form),
[Origin UI](https://github.com/shadcn/originui),
[Cult UI](https://www.cult-ui.com/docs/components),
[Kibo UI](https://www.kibo-ui.com/components),
[21st.dev form catalog](https://21st.dev/community/components/explore/react-html-form),
[Tailwind Plus application UI](https://tailwindcss.com/plus/ui-blocks/application-ui),
[Motion Primitives](https://motion-primitives.com/docs),
[Apple HIG](https://developer.apple.com/design/human-interface-guidelines/).
