---
title: "Install with no setup"
date: 2026-10-07
tags: [CLI, themes, docs]
summary: "Ballmac UI is in the official shadcn registry directory, so adding a component needs no configuration."
shot: /docs/get-started/install
imageAlt: "The install guide, showing the shadcn add command for Ballmac UI in four package managers."
---

### New

- `npx shadcn@latest add @ballmac/button` works with nothing to configure. The registry entry is kept as a fallback for older CLIs and for the shadcn MCP server, which only reads `components.json`. See [Install your first component](/docs/get-started/install).
- Every theme preset has its own clean link (for example `/themes/rose`), and a customised design is `/themes?h=…`. A note beside Copy link explains that your design lives in the link and is never stored.

### Improved

- Clearer page titles and descriptions for the components, blocks, templates and themes pages, structured data for the organisation and the website, and an [llms.txt](/llms.txt) that lists blocks, templates and Pro.
- Copying a theme link is announced to screen readers.

### Fixed

- The analytics scripts load only on Vercel, so running the site locally or on your own host no longer logs console errors.
