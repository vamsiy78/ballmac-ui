import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "skeleton",
  type: "registry:ui",
  title: "Skeleton",
  description:
    "A theme-aware loading placeholder with an animation that stops when reduced motion is requested.",
  category: "feedback",
  tags: ["loading", "placeholder", "pulse"],
  files: [{ path: "components/skeleton.tsx" }],
  dependencies: [],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "skeleton-demo", title: "Overview", file: "skeleton-demo.tsx" },
    {
      name: "skeleton-states",
      title: "States and variants",
      file: "skeleton-states.tsx",
    },
  ],
  ai: {
    summary:
      "A theme-aware loading placeholder with an animation that stops when reduced motion is requested.",
    whenToUse: [
      "Reserve content space while data loads",
      "Preview the shape of a card or list",
    ],
    whenNotToUse: ["Use a spinner for a single short operation"],
    composesWith: ["card"],
    a11y: [],
    customization: ["animated: enable pulse motion"],
  },
  source: {
    name: "shadcn/ui Skeleton",
    url: "https://github.com/shadcn-ui/ui",
    license: "MIT",
    copyright: "Copyright (c) 2023 shadcn",
    modified: true,
  },
  version: "1.0.0",
  updated: "2026-09-29",
})
