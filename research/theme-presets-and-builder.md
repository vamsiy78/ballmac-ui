# Theme presets and the theme builder

Reviewed 2026-10-02. Twelve free `registry:theme` presets and a free `/themes` builder. All code is original Ballmac work; nothing was copied. Compared with: the [shadcn themes page](https://ui.shadcn.com/themes) and its `create` flow, [tweakcn](https://tweakcn.com), [Radix Themes](https://www.radix-ui.com/themes/playground) playground, [DaisyUI themes](https://daisyui.com/docs/themes/), [Tailwind Plus](https://tailwindcss.com/plus) colour palettes (looked at, not copied), and Open Props / Radix Colors for how scales are built.

What most theme tools do: pick a hex or a swatch, copy the variables, and leave contrast to the user. Presets are static lists of values that were tuned by eye; the preview is a few cards; dark mode is an afterthought; a theme that fails WCAG is easy to make and nothing says so.

What this does instead:

| Area | Usual | Here |
| --- | --- | --- |
| Contrast | Not measured | Every text pairing (4.5:1) and every focus ring and chart colour (3:1) is measured in light and dark. The engine moves lightness until it passes, so any hue, including yellow, comes out readable. A test sweeps 360 degrees of hue, five intensities, brand and ink buttons and paper pages and fails on any miss. |
| Presets | Hand-tuned lists | Twelve specs (a few numbers each) run through the same engine as the builder, so presets and custom themes behave the same. |
| Preview | A few cards | A small app built from real Ballmac components (chart, form, alerts, every button variant), light, dark or both side by side, plus a mini app on every preset card. |
| Sharing | Account or copy-paste | The design lives in the URL. `/themes/custom.json?...` is also an installable registry item, so `shadcn add "<link>"` installs the exact design. Nothing is stored. |
| Dark mode | Inverted | Its own steps, solved against the dark surfaces. |
| Density and font | Rare | `--spacing` scales every gap; the font choice sets `--font-sans` to a system stack so nothing needs loading. Both are written only when changed. |

Engine (`packages/theme-engine`): OKLCH to sRGB with gamut fitting, WCAG luminance and contrast, `solve()` which walks lightness until a colour reaches a contrast target against every surface it sits on, `buildTheme(spec)`, `auditTheme(vars)`, `themeCss`, `themeRegistryItem`, and URL encode/decode. Inputs are clamped, so hostile query strings cannot produce an unsafe theme (tested).

Decisions:

- Presets are items named `theme-<slug>` in the `foundation` category, so they are in the registry and the CLI but not in the component catalog or MCP lists.
- The builder previews inside the page with inline custom properties. The site's `dark:` variant now ignores an ancestor `.dark` when a closer element carries `data-theme-scope="light"`; otherwise a light preview on a dark site picked up `dark:bg-destructive/60` and failed contrast (found by axe).
- Menus and dialogs portal to `<body>` outside the preview, so they are left out of it.
- "Ink" buttons (near-black, near-white in dark) with a brand-coloured ring and charts is a first-class option next to brand-coloured buttons.

Not done: chart colours were checked against the page for 3:1 contrast, but not run through a colour-blindness separation test; adjacent chart colours are 75 to 150 degrees apart at different lightness, which usually separates well, but the dataviz validator has not been run on all twelve.
