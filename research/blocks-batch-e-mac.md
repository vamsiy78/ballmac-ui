# Blocks batch E: Mac showcase

Reviewed 2026-10-01. All five blocks are original Ballmac code assembled from components already in the registry (menu bar, window manager, dock, device frames, widgets, app icons, segmented control, radio group, copy button, chart on Recharts, switch, keyboard keys). No code was copied from Aceternity, Tailwind Plus, shadcnblocks or any Pro kit, so none carry a "Based on" header. Layouts were compared with the [shadcn blocks](https://ui.shadcn.com/blocks) hero and pricing examples, [Magic UI](https://magicui.design) device mockups and dock, [Origin UI](https://originui.com), [DaisyUI](https://daisyui.com) mockup components, and the download, pricing and "tour" pages of widely used Mac apps (Raycast, CleanShot X, Things, Bartender, Setapp).

Shared decisions: the scenes are drawn from theme tokens (wallpaper from `--chart-*`), so they follow light and dark; purely decorative art is hidden from assistive technology and the same information is available as real text; every control is a real button, radio or link; fixed `en-US` formatting; no randomness in render; motion respects reduced motion.

| Block | Competitor pattern studied | Ballmac improvement |
| --- | --- | --- |
| Showcase 1 | Screenshot-in-a-frame heroes, static dock mockups | A working desktop: real menu bar menus, windows that close and reopen from the dock, weather and calendar widgets, a narrow layout under 640 px, a fixed clock for stable renders |
| Download 1 | "Download for Mac" buttons | Apple silicon / Intel chooser that swaps file, size and SHA-256, polite download status, requirements, copyable checksum and Homebrew command, install steps and release notes with a version switch |
| Devices 1 | Device lineup images | Composed from the real frames at container-relative sizes, devices that rise on hover or press, four toggle buttons with text so the section works without the art |
| Features 7 | Menu-bar app tours | A vertical radio list with shortcut keycaps that drives a miniature menu bar and popover, arrow-key operable, panel changes announced through the selected radio |
| Pricing 4 | One-time vs subscription tables | Buy once / Subscribe switch, license size radios, a cost chart with legend and text summary, a computed break-even year and an optional-updates switch |

Accessibility notes: axe (serious and critical) is clean on every `/preview/*` page in light and dark, and `scripts/a11y-open-states.ts` scans the interacted states (an open menu, the Intel download after click, a pinned device, another feature selected, subscribe with updates on). Findings that shaped the final code: a hover followed by a click un-highlighted the device it had just highlighted (hover and press are now tracked separately), the dock kept a dangling separator when an item was hidden on phones, and the device art was too small until the stage ratio and device widths were retuned.
