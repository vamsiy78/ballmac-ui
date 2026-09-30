import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "table-of-contents",
  type: "registry:ui",
  title: "Table Of Contents",
  description:
    "An 'On this page' list with a scroll spy and a sliding current-section marker. It collects headings itself or takes a list, and scrolls below sticky headers.",
  category: "navigation",
  tags: ["toc", "scrollspy", "docs", "anchor links"],
  files: [{ path: "components/table-of-contents.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils", "scroll", "motion-presets"],
  examples: [
    { name: "table-of-contents-demo", title: "Auto-collected", file: "table-of-contents-demo.tsx" },
    { name: "table-of-contents-states", title: "Explicit items", file: "table-of-contents-states.tsx" },
  ],
  ai: {
    summary:
      "Leave items out to collect h2 and h3 headings (they need text; missing ids are created). Current section gets aria-current=location.",
    whenToUse: ["Documentation and long articles", "Settings pages with many sections"],
    whenNotToUse: ["Horizontal in-page tabs; use section-tabs", "App navigation; use sidebar"],
    composesWith: ["scroll-progress", "section-tabs"],
    a11y: [
      { keys: "Enter", action: "Scrolls to the section and updates the URL hash" },
      { keys: "Screen readers", action: "A labelled navigation; the current section has aria-current=location" },
      { keys: "Reduced motion", action: "Jumps instead of smooth scrolling; the marker does not glide" },
    ],
    customization: ["items or headingsFrom", "levels", "title", "offset and container"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
});
