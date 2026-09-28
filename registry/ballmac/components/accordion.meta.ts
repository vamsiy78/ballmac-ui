import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "accordion",
  type: "registry:ui",
  title: "Accordion",
  description:
    "Vertically stacked disclosure sections on Radix Accordion, single or multiple open, with hairline dividers, a rotating plus and height animation.",
  category: "primitives",
  tags: ["accordion", "disclosure", "faq", "collapsible", "radix"],
  files: [{ path: "components/accordion.tsx" }],
  dependencies: ["radix-ui", "lucide-react"],
  devDependencies: ["tw-animate-css"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "accordion-demo", title: "Default", file: "accordion-demo.tsx" },
    { name: "accordion-multiple", title: "Multiple open", file: "accordion-multiple.tsx" },
  ],
  ai: {
    summary: "Show and hide sections of content one at a time (type=\"single\" collapsible) or several at once (type=\"multiple\").",
    whenToUse: ["FAQ sections", "Settings or docs with optional detail", "Long content where readers scan headings first"],
    whenNotToUse: ["A single show/hide toggle (use reasoning-disclosure or a Radix Collapsible)", "Navigation between views (use tabs)"],
    composesWith: ["badge"],
    a11y: [
      { keys: "Enter / Space", action: "Toggles the focused section" },
      { keys: "↓ / ↑", action: "Moves focus between section headers" },
      { keys: "Home / End", action: "Moves focus to the first or last header" },
    ],
    customization: ["type: single | multiple", "collapsible (single): allow closing the open section", "defaultValue / value for open sections"],
  },
  source: {
    name: "shadcn/ui Accordion",
    url: "https://github.com/shadcn-ui/ui",
    license: "MIT",
    copyright: "Copyright (c) 2023 shadcn",
    modified: true,
  },
  version: "1.0.0",
  updated: "2026-09-28",
})
