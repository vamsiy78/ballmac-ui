# Wave 2 batch 1: competitor review

Reviewed 2026-09-30. All ten implementations were written for Ballmac; no
third-party source code was reused. The component catalogs were checked across
shadcn/ui, Magic UI, Motion Primitives, Aceternity, DaisyUI, Origin UI, ReUI,
Cult UI, Kibo UI, 21st.dev, Tailwind Plus, and Apple's guidance. Magic UI and
Motion Primitives focus on motion rather than these form controls.

| Item | Competitor pattern reviewed | Ballmac addition |
|---|---|---|
| File Dropzone | Aceternity drop surface; ReUI previews; Kibo type/size handling | Native browse fallback, live validation, removable list, controlled selection |
| Multi Select | ReUI searchable chips and selection flows; shadcn popover conventions | Radix focus handling, native checkboxes, search, cap, form values |
| Tag Input | ReUI inline tags; Origin UI field variety | Paste multiple tags, prevent duplicates, Backspace removal, form values |
| Number Input | ReUI number field; shadcn input baseline | Native spinbutton plus bounded step controls |
| Password Input | ReUI visibility and strength examples | Four-step guide with specific improvement text and keyboard toggle |
| Search Field | Aceternity expressive search input; shadcn input baseline | Compact clear action, Enter callback, focus return |
| Phone Input | ReUI phone patterns; native telephone input | Dialing-code selector that preserves national-number formatting |
| Color Picker | Cult UI palette editor; ReUI color input | Native chooser, editable hex, live swatch, controlled API |
| Rating | DaisyUI stars; Kibo keyboard and form behavior | Native radio semantics, focus ring, read-only and clear states |
| Time Picker | ReUI time fields; native input behavior | Native time control with optional quick-pick presets |

The demos use realistic product tasks rather than isolated controls. Native
inputs and radio/checkbox behavior provide the keyboard baseline; the
multi-select popover uses Radix for focus management. All motion is limited to
CSS transitions that stop under reduced motion.

Sources: [shadcn/ui components](https://ui.shadcn.com/docs/components),
[DaisyUI components](https://daisyui.com/components/),
[Aceternity form collection](https://ui.aceternity.com/categories/form),
[ReUI input patterns](https://reui.io/components/input),
[ReUI multi-select patterns](https://reui.io/components/combobox),
[ReUI file upload patterns](https://reui.io/components/file-upload),
[Cult UI color picker](https://www.cult-ui.com/docs/components/color-picker),
[Kibo UI dropzone](https://www.kibo-ui.com/components/dropzone),
[Kibo UI rating](https://www.kibo-ui.com/components/rating),
[21st.dev forms](https://21st.dev/community/components/explore/react-html-form),
[Origin UI](https://github.com/shadcn/originui),
[Tailwind Plus application UI](https://tailwindcss.com/plus/ui-blocks/application-ui),
[Magic UI components](https://magicui.design/docs/components),
[Motion Primitives](https://motion-primitives.com/docs),
[MDN telephone input](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/tel).
