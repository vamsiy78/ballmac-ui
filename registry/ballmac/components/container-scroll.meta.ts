import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "container-scroll",
  type: "registry:ui",
  title: "Container Scroll",
  description:
    "A showcase frame that starts tilted back in 3D and flattens to face the reader as it scrolls into view, with a title that lifts alongside.",
  category: "layout",
  tags: ["3d", "scroll", "hero", "showcase"],
  files: [{ path: "components/container-scroll.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "container-scroll-demo", title: "Product showcase", file: "container-scroll-demo.tsx" },
    { name: "container-scroll-states", title: "Steeper tilt", file: "container-scroll-states.tsx" },
  ],
  ai: {
    summary:
      "<ContainerScroll title={...}>{screenshot or live demo}</ContainerScroll>. tilt sets the starting angle; container tracks a scrollable element.",
    whenToUse: ["Product hero sections", "Showing a dashboard or app screenshot"],
    whenNotToUse: ["Content that must stay flat and readable at all times", "Pages that scroll inside nested containers without passing container"],
    composesWith: ["browser-frame", "sticky-scroll", "bento-grid"],
    a11y: [
      { keys: "Reduced motion", action: "The frame is flat from the start, with no transform" },
      { keys: "Content", action: "Children stay real, selectable, focusable content" },
    ],
    customization: ["tilt", "title slot", "frameClassName", "container"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
});
