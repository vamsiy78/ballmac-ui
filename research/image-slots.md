# Image slots research

**Bar:** let a buyer replace generated artwork with real product images in every hero, card and template without editing markup, and never ship a layout jump, a missing alt, or a broken-image icon.

**What others do**
- shadcn/ui blocks: hard-coded `<img>` or placeholder divs; you edit the JSX. No alt contract, no aspect box.
- Magic UI and DaisyUI: demo images are inline `<img>`/`next/image` in examples; no slot prop, no fallback.
- Aceternity (not reused, only observed): images fixed in the component, same pattern.
- `next/image`: solves sizing and loading but is framework-bound; registry items cannot depend on it.

**Decision:** one `Media` component (URL | object with alt | element), a fixed aspect box, lazy by default with `priority` for the hero, `srcDark` for dark mode, the original artwork as `fallback` (also on load error), and a dev warning when alt is missing. Pass a `next/image` element when you want its optimiser.

**Where it is better:** the item still looks finished with no image, a failed file degrades to the artwork, alt text is part of the type, and `pnpm check` rejects bare images in blocks and templates.
