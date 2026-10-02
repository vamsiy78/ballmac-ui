# Right-to-left and translation

Reviewed 2026-10-02. Compared with [shadcn/ui](https://ui.shadcn.com) (RTL support added 2025 through a CLI `--rtl` flag that rewrites classes), [Magic UI](https://magicui.design), [DaisyUI](https://daisyui.com) (logical utilities, partial), [Mantine](https://mantine.dev) (full `DirectionProvider`), [MUI](https://mui.com) (RTL plugin and theme direction), [Radix Themes](https://www.radix-ui.com/themes) (`DirectionProvider`), [React Aria](https://react-spectrum.adobe.com/react-aria/) (`I18nProvider`, messages for 30+ languages) and [Tailwind CSS v4](https://tailwindcss.com/docs) logical properties. Tailwind Plus, Aceternity and shadcnblocks were looked at for claims only; nothing was copied.

What most libraries do: either nothing, or a build step that rewrites physical classes once, with no tests, no handling of keyboard arrows, no mirrored icons, and English strings fixed inside the components.

What this does instead:

| Area | Usual | Here |
| --- | --- | --- |
| Layout | A one-off class rewrite | Logical properties in the source itself (`ms-`, `pe-`, `start-`, `text-start`, `border-s`, `rounded-e`) across the 1,158 source files it checks (components, blocks, templates and examples), enforced by `scripts/rtl.ts` on every `pnpm check`, with `--fix` |
| Icons | Forgotten | Every directional lucide icon carries `rtl:rotate-180` or `rtl:-scale-x-100`; open disclosure chevrons still point down; hover nudges have their mirror |
| Keyboard | Radix only, and only inside a provider | `useDirection` reads the provider or `<html dir>`; Tabs, Slider, RadioGroup, ToggleGroup, menus, Select, Calendar, Carousel, Dock, Tree, Kanban, Launchpad, split view and the history strip swap their arrow keys. Tabs, Slider and TreeView are tested with real key presses in RTL |
| Sides | `left` and `right` only | `Sheet` and `Sidebar` take `start` and `end` (new default) and keep fixed `left` and `right` |
| Code and data | Garbled by bidi | Code blocks, terminals, logs, JSON, diffs, env rows and shortcuts are `dir="ltr"` inside |
| Strings | Fixed English | 447 messages with stable keys, `{placeholders}`, CLDR plurals, rich nodes, one `I18nProvider`; `/i18n/en.json` lists every key; label props still win |
| Dates and numbers | `en-US` hard-coded | Locale from the provider, else `<html lang>`; durations and relative times use `Intl` |
| Proof | None | An RTL toggle on every preview, `?dir=rtl`, and `pnpm rtl:sweep` which loads every preview both ways and compares the layout with its mirror image |

Decisions and limits:

- **Hardware frames keep their physical shape** (phone, tablet, Android, watch and laptop frames: buttons and bezels sit on fixed edges) and two decorative effects (light rays, sparkles text). Mac windows, the menu bar and the Finder mirror, with the traffic lights kept in red, yellow, green order. A first version kept them fixed; flex ordering still mirrored, which left a half-mirrored window, so they now mirror fully. They are listed with reasons in `scripts/rtl-exceptions.json` and on the RTL docs page. What you put inside them follows the page.
- **Charts keep their axes** (Recharts draws SVG in its own coordinates). Legends and surrounding text mirror.
- **Motion props with a named direction** (marquee, blur-fade) are physical.
- **Blocks and templates are copy-in sources**, so their copy is content, not a translation target. Their layout mirrors.
- **Messages are keyed by component** (`pagination.nextPage`), with whole sentences and placeholders, never fragments. A first pass that translated fragments (`"of"`, `"Pending ("`) was replaced by hand because it cannot be translated correctly. A test caught one place where a lookup table's label became an object.
- **Pitfalls found:** (1) the codemod's icon list matched a local component called `Quote`; icons are now only touched when imported from lucide-react. (2) `rotate-90` and `rtl:rotate-180` on one element conflict, so open and closed are chosen with a ternary. (3) Sheet, sidebar and drawer side variants were converted to logical classes while still meaning a physical edge; they were restored and `start`/`end` added. (4) Scaled previews (browser frame, lens) position with `left-0 origin-top-left`; logical `start-0` clipped them in RTL.
