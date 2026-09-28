# Authoring Ballmac UI items

Every component, block and template follows this standard. Reference implementations:
`registry/ballmac/components/button.tsx` (primitive) and `registry/ballmac/components/number-ticker.tsx` (motion).

## Files

| What | Where | Installs to |
|---|---|---|
| Component source | `registry/ballmac/components/<name>.tsx` | `components/ballmac/<name>.tsx` |
| Block source | `registry/ballmac/components/blocks/<name>/<name>.tsx` (+ parts in the same folder) | `components/ballmac/blocks/<name>/` |
| Template page | `registry/ballmac/app/<route>/page.tsx` | `app/<route>/page.tsx` |
| Hook / lib | `registry/ballmac/hooks/<file>.ts`, `registry/ballmac/lib/<file>.ts` | `hooks/ballmac/`, `lib/ballmac/` |
| Metadata | `<source>.meta.ts` next to the main file (blocks: in the block folder) | — |
| Examples | `registry/examples/<example-name>.tsx` | — (site previews, MCP examples) |
| Tests | `registry/tests/<name>.test.tsx` | — |

Names are permanent public API: kebab-case, no prefixes (`magnetic-button`, `ai-chat`, `hero-1`). Blocks are `<section>-<n>`.

## Source rules

1. **Header.** The first line of every file (before or after `"use client"`) is
   `// Ballmac UI: <Title>. https://ui.ballmac.com/components/<name>`.
   If any code or close structure came from an open-source project, add a second line
   `// Based on <project> (<license>, <copyright>), <what changed>.` and fill `meta.source`. Only MIT, ISC, BSD or Apache-2.0 sources; never copy from paid or "free but no redistribution" libraries (Aceternity, Tailwind Plus, any Pro kit).
2. **`"use client"`** only when the file uses state, effects, refs, event handlers or Motion.
3. **Imports** (nothing else without a reason):
   - `import * as React from "react"`
   - Radix via the `radix-ui` package: `import { Dialog as DialogPrimitive } from "radix-ui"`
   - `cn` from `@/lib/utils`
   - Motion: `motion/react`, and presets from `@/lib/ballmac/motion` (registry dependency `motion-presets`)
   - Icons: `lucide-react`
   - Other Ballmac items: `@/components/ballmac/<name>` (and list them in `registryDependencies`)
   - Variants: `class-variance-authority` when a component has variant props
4. **Components are plain functions** (React 19 passes `ref` as a prop; no `forwardRef`):
   `function Card({ className, ...props }: React.ComponentProps<"div">)`. Spread `...props` onto the root, merge `className` last with `cn(...)`.
5. **`data-slot="<part>"`** on the root and each named part (`data-slot="dialog-content"`), so users can target parts in CSS.
6. **Props types power the docs.** For every public component with its own props, declare
   `type <Component>Props = React.ComponentProps<"div"> & { /** JSDoc for each prop */ myProp?: string }`
   (or `& VariantProps<typeof xVariants>` for cva variants) and export it. The site's props table is generated
   from these literals, their JSDoc, cva `variants`/`defaultVariants`, and defaults in the function's destructuring.
7. **Exports at the bottom:** `export { Card, CardHeader, type CardProps }`. Composable parts over configuration props when there's structure (Dialog, Chat, Terminal).
8. **No `asChild` in JSX** (in item files and examples). The shadcn CLI rewrites it to Base UI's `render` prop in `base-*` projects, the `shadcn init` default. Style links and triggers directly instead: `<a className={buttonVariants({ variant: "outline" })}>`, `<DialogTrigger className={buttonVariants()}>`. Components may still *accept* `asChild`. `pnpm check` enforces this.
9. **SSR-safe:** no `window` or `document` during render; ids via `React.useId()`; any number or date formatting uses a fixed default locale (`"en-US"`) with a `locale` prop, or the server and browser disagree and React throws a hydration error.

## Design language

- **Tokens only.** `bg-background`, `bg-card`, `bg-muted`, `bg-accent`, `bg-primary`, `text-foreground`, `text-muted-foreground`, `text-primary-foreground`, `border-border`, `border-input`, `ring-ring`, `bg-destructive`, `chart-1…5`. No hex or named colors. White/black alpha is fine for overlays and shadows (`bg-black/50`, `shadow-[0_1px_2px_0_rgb(0_0_0/0.12)]`). Use `dark:` only when a token can't express it.
- **Scale.** Controls: `h-9` (sm `h-8`, lg `h-11`), `text-sm`, `rounded-md`, `px-3`–`px-4`. Surfaces (cards, panels, dialogs): `rounded-xl`, `border`, `bg-card`, `p-5`–`p-6`. Pills: `rounded-full`.
- **Focus:** `outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50` (+ `focus-visible:border-ring` on inputs). Invalid: `aria-invalid:border-destructive aria-invalid:ring-destructive/20`.
- **Disabled:** `disabled:pointer-events-none disabled:opacity-50` (and the `peer-disabled`/`data-[disabled]` equivalents).
- **Typography:** labels `text-sm font-medium`, secondary text `text-muted-foreground`, mono details `font-mono text-xs`. Numbers `tabular-nums`.
- **Motion:** only through `@/lib/ballmac/motion` presets or `transition-[…] duration-150/200` CSS. `spring.snappy` for controls, `spring.gentle` for panels. **Always respect reduced motion**: `useReducedMotion()` from `motion/react` (then skip or fade), or `motion-reduce:` variants for CSS animation. Infinite animations must stop under reduced motion.
- **Decorative elements** (glows, grids, beams) are `aria-hidden="true"` and `pointer-events-none`.
- **Responsive:** fluid widths (`w-full max-w-*`), wrap on narrow screens, no horizontal overflow at 360 px.

## Accessibility

- Use Radix for anything with focus management or ARIA patterns (dialog, tooltip, select, checkbox, switch, popover, tabs, menus).
- Every interactive element is reachable and operable by keyboard, with a visible focus ring.
- Icon-only buttons have `aria-label`. Live content (streaming text, status) uses `aria-live="polite"` where it helps.
- Color is never the only signal (pair status colors with text or icons).

## Metadata (`<name>.meta.ts`)

```ts
import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "switch",
  type: "registry:ui",             // blocks: "registry:block"
  title: "Switch",
  description: "…",               // 20–240 chars; what it is and its standout ability
  category: "primitives",          // see packages/metadata/src/schema.ts
  tags: ["toggle", "form"],
  files: [{ path: "components/switch.tsx" }],
  dependencies: ["radix-ui"],      // npm packages the files import ("motion@^12" style ranges OK)
  registryDependencies: ["shadcn:utils"], // + Ballmac items by bare name, e.g. "button"
  examples: [
    { name: "switch-demo", title: "Default", file: "switch-demo.tsx" }, // first is always <name>-demo
    { name: "switch-form", title: "In a form", file: "switch-form.tsx" },
  ],
  ai: {
    summary: "One or two sentences an agent can act on.",
    whenToUse: ["2–4 concrete situations"],
    whenNotToUse: ["1–3 situations, naming the better item where one exists"],
    composesWith: ["label"],
    a11y: [{ keys: "Space", action: "Toggles the switch" }],
    customization: ["size: sm | default", "Props and variants people will change"],
  },
  version: "1.0.0",
  updated: "2026-09-28",
})
```

Write descriptions for two readers: a developer scanning a catalog and a coding agent choosing between items. Be specific and honest; no marketing words ("stunning", "beautiful", "powerful").

## Examples

- Default export, self-contained, realistic content (no lorem ipsum, no fake brand or customer names; neutral placeholders like "Acme" are fine, or product-neutral copy).
- The `-demo` example is the catalog thumbnail and page hero: make it show the component at its best in ≤ 320 px height.
- Examples render inside a centered preview stage; don't add page padding or backgrounds.

## Tests

Add `registry/tests/<name>.test.tsx` for anything interactive: keyboard behavior, ARIA state, controlled and uncontrolled usage. Pure presentational components don't need tests.

## Checks while authoring (safe in parallel)

```bash
node_modules/.bin/tsx scripts/check-item.ts <name> [<name>…]   # metadata, deps, headers, examples
(cd apps/www && npx tsc --noEmit)                             # types (includes registry/)
(cd registry && npx vitest run tests/<name>.test.tsx)         # tests
```

The full build (`pnpm build:registry`, `next build`, `pnpm smoke`) runs centrally after a batch lands.
