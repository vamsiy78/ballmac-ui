import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "progressive-blur",
  type: "registry:ui",
  title: "Progressive Blur",
  description:
    "A blur that ramps up toward an edge instead of switching on at a line, made of stacked backdrop-filter layers, for scrolling lists, headers, footers and image captions.",
  category: "motion",
  tags: ["blur", "gradient", "edge", "scroll", "backdrop"],
  files: [{ path: "components/progressive-blur.tsx" }],
  dependencies: [],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "progressive-blur-demo", title: "Scrolling list with both edges", file: "progressive-blur-demo.tsx" },
    { name: "progressive-blur-sides", title: "Four edges", file: "progressive-blur-sides.tsx" },
  ],
  ai: {
    summary:
      "<ProgressiveBlur position='top|bottom|left|right' size strength layers /> inside a relative parent that scrolls or holds an image. Pointer events pass through it. A server component with no JavaScript.",
    whenToUse: ["Scrolling lists that fade out at the edges", "Text over images, instead of a dark gradient"],
    whenNotToUse: ["Browsers or surfaces without backdrop-filter support (it degrades to no blur)"],
    composesWith: ["scroll-area", "card"],
    a11y: [
      { keys: "Screen readers", action: "Decorative: aria-hidden and pointer-events-none" },
      { keys: "Interaction", action: "Never blocks clicks or scrolling" },
    ],
    customization: ["position", "size", "strength", "layers"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
