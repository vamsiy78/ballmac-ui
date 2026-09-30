import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "sticky-scroll",
  type: "registry:ui",
  title: "Sticky Scroll",
  description:
    "Scroll-driven storytelling: text steps scroll past while one visual stays pinned and crossfades to match, with each visual inline on small screens.",
  category: "layout",
  tags: ["scrollytelling", "sticky", "feature", "marketing"],
  files: [{ path: "components/sticky-scroll.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils", "motion-presets"],
  examples: [
    { name: "sticky-scroll-demo", title: "Feature story", file: "sticky-scroll-demo.tsx" },
    { name: "sticky-scroll-states", title: "Visual on the left", file: "sticky-scroll-states.tsx" },
  ],
  ai: {
    summary:
      "items: {id,title,description,visual}. The step nearest the middle of the viewport is active (aria-current=step) and its visual shows in the pinned panel.",
    whenToUse: ["Feature tours on landing pages", "Step-by-step explanations with a matching picture"],
    whenNotToUse: ["Short lists of benefits; use a plain grid", "Content that must all be visible at once"],
    composesWith: ["container-scroll", "bento-grid"],
    a11y: [
      { keys: "Reading order", action: "Steps are an ordered list; the pinned visual is decorative and hidden from assistive technology" },
      { keys: "Reduced motion", action: "No crossfade or scale" },
    ],
    customization: ["visualSide: left | right", "stickyOffset and stepMinHeight", "container for panel scrolling", "onActiveChange"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
});
