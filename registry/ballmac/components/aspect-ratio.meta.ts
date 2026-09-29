import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "aspect-ratio",
  type: "registry:ui",
  title: "Aspect Ratio",
  description:
    "A CSS-native ratio frame that reserves space for media and safely handles invalid ratio values.",
  category: "layout",
  tags: ["media", "image", "layout"],
  files: [{ path: "components/aspect-ratio.tsx" }],
  dependencies: [],
  registryDependencies: ["shadcn:utils"],
  examples: [
    {
      name: "aspect-ratio-demo",
      title: "Overview",
      file: "aspect-ratio-demo.tsx",
    },
    {
      name: "aspect-ratio-states",
      title: "States and variants",
      file: "aspect-ratio-states.tsx",
    },
  ],
  ai: {
    summary:
      "A CSS-native ratio frame that reserves space for media and safely handles invalid ratio values.",
    whenToUse: [
      "Reserve image or video space before it loads",
      "Keep cards aligned across a grid",
    ],
    whenNotToUse: ["Use fixed height when cropping is intentional"],
    composesWith: ["card"],
    a11y: [],
    customization: ["ratio: width divided by height; default 16/9"],
  },
  source: {
    name: "shadcn/ui Aspect Ratio",
    url: "https://github.com/shadcn-ui/ui",
    license: "MIT",
    copyright: "Copyright (c) 2023 shadcn",
    modified: true,
  },
  version: "1.0.0",
  updated: "2026-09-29",
})
