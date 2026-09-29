import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "separator",
  type: "registry:ui",
  title: "Separator",
  description:
    "A semantic or decorative divider with horizontal, vertical, and centered-label layouts.",
  category: "layout",
  tags: ["divider", "layout", "section"],
  files: [{ path: "components/separator.tsx" }],
  dependencies: ["radix-ui"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "separator-demo", title: "Overview", file: "separator-demo.tsx" },
    {
      name: "separator-states",
      title: "States and variants",
      file: "separator-states.tsx",
    },
  ],
  ai: {
    summary:
      "A semantic or decorative divider with horizontal, vertical, and centered-label layouts.",
    whenToUse: [
      "Separate groups of related content",
      "Divide a form with a short label",
    ],
    whenNotToUse: ["Use spacing alone when separation is already clear"],
    composesWith: ["card"],
    a11y: [],
    customization: [
      "orientation: horizontal | vertical",
      "label: centered text",
    ],
  },
  source: {
    name: "shadcn/ui Separator",
    url: "https://github.com/shadcn-ui/ui",
    license: "MIT",
    copyright: "Copyright (c) 2023 shadcn",
    modified: true,
  },
  version: "1.0.0",
  updated: "2026-09-29",
})
