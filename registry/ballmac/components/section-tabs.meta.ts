import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "section-tabs",
  type: "registry:ui",
  title: "Section Tabs",
  description:
    "Sticky in-page tabs that follow the reader's section, slide an indicator to it, keep the active tab in view on narrow screens and scroll to a section on click.",
  category: "navigation",
  tags: ["tabs", "scrollspy", "sticky", "anchor links"],
  files: [{ path: "components/section-tabs.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils", "scroll", "motion-presets", "i18n"],
  examples: [
    { name: "section-tabs-demo", title: "Product page", file: "section-tabs-demo.tsx" },
    { name: "section-tabs-states", title: "Pill, narrow", file: "section-tabs-states.tsx" },
  ],
  ai: {
    summary:
      "sections: {id,label} matching element ids in the page. offset is the space to leave for this bar and any header. variant underline or pill.",
    whenToUse: ["Long product, pricing and docs pages", "Anchored sections of a settings page"],
    whenNotToUse: ["Switching views without scrolling; use tabs", "Vertical page outlines; use table-of-contents"],
    composesWith: ["table-of-contents", "navbar", "tabs"],
    a11y: [
      { keys: "Enter", action: "Scrolls to the section and updates the URL hash" },
      { keys: "Tab", action: "Real links; middle-click and copy link work" },
      { keys: "Screen readers", action: "Current section has aria-current=location" },
    ],
    customization: ["variant", "sticky and stickyTop", "offset", "container"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
});
