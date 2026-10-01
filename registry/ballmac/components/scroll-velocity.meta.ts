import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "scroll-velocity",
  type: "registry:ui",
  title: "Scroll Velocity",
  description:
    "A looping row of text or logos that drifts sideways and speeds up, or reverses, with how fast you scroll the page or any scroll container, repeating itself to fill the width.",
  category: "motion",
  tags: ["marquee", "scroll", "velocity", "text", "ticker"],
  files: [{ path: "components/scroll-velocity.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "scroll-velocity-demo", title: "Two rows in a scroller", file: "scroll-velocity-demo.tsx" },
    { name: "scroll-velocity-logos", title: "Logo row", file: "scroll-velocity-logos.tsx" },
  ],
  ai: {
    summary:
      "<ScrollVelocity baseVelocity direction sensitivity scrollContainer gap>content</ScrollVelocity>. Stack rows with opposite directions. Repeats are aria-hidden and inert; reduced motion shows one scrollable row.",
    whenToUse: ["Big typographic dividers between sections", "Logo and keyword strips that react to scrolling"],
    whenNotToUse: ["A steady marquee that ignores scroll (marquee)"],
    composesWith: ["marquee", "text-animate"],
    a11y: [
      { keys: "Screen readers", action: "Only the first copy is read; repeats are hidden and not focusable" },
      { keys: "Reduced motion", action: "A static, horizontally scrollable row" },
    ],
    customization: ["baseVelocity", "direction", "sensitivity", "scrollContainer", "gap"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
