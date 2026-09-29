import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "empty",
  type: "registry:ui",
  title: "Empty",
  description:
    "A responsive empty-state surface with media, concise guidance, and a dedicated action area.",
  category: "feedback",
  tags: ["empty", "placeholder", "state"],
  files: [{ path: "components/empty.tsx" }],
  dependencies: [],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "empty-demo", title: "Overview", file: "empty-demo.tsx" },
    {
      name: "empty-states",
      title: "States and variants",
      file: "empty-states.tsx",
    },
  ],
  ai: {
    summary:
      "A responsive empty-state surface with media, concise guidance, and a dedicated action area.",
    whenToUse: [
      "Explain why a list has no content",
      "Give the next step after a search yields no results",
    ],
    whenNotToUse: ["Use a skeleton while loading"],
    composesWith: ["button"],
    a11y: [{ keys: "Tab", action: "reaches actions in the empty state" }],
    customization: ["compact: reduce vertical padding"],
  },
  source: {
    name: "shadcn/ui Empty",
    url: "https://github.com/shadcn-ui/ui",
    license: "MIT",
    copyright: "Copyright (c) 2023 shadcn",
    modified: true,
  },
  version: "1.0.0",
  updated: "2026-09-29",
})
