import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "scroll-progress",
  type: "registry:ui",
  title: "Scroll Progress",
  description:
    "A thin reading-progress bar fixed to the top or bottom of the page, or to a scrollable panel, that fills on a soft spring (or exactly under reduced motion).",
  category: "navigation",
  tags: ["progress", "reading", "scroll", "indicator"],
  files: [{ path: "components/scroll-progress.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "scroll-progress-demo", title: "Article progress", file: "scroll-progress-demo.tsx" },
    { name: "scroll-progress-states", title: "Bottom, thicker", file: "scroll-progress-states.tsx" },
  ],
  ai: {
    summary:
      "Render <ScrollProgress /> once. Pass container (a ref) to follow a scrollable element and add className='absolute' inside its wrapper.",
    whenToUse: ["Long articles and docs", "Multi-section landing pages"],
    whenNotToUse: ["Task or upload progress; use progress", "Step indicators; use progress-steps"],
    composesWith: ["table-of-contents", "back-to-top"],
    a11y: [
      { keys: "Screen readers", action: "Decorative (aria-hidden); the page's own scroll position is already exposed" },
      { keys: "Reduced motion", action: "No spring smoothing" },
    ],
    customization: ["position: top | bottom", "thickness", "container"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
});
