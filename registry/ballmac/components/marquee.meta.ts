import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "marquee",
  type: "registry:ui",
  title: "Marquee",
  description:
    "An endless horizontal or vertical scroller for logo rows and testimonials. Speed is in pixels per second, it pauses on hover and focus, and it fills any width.",
  category: "motion",
  tags: ["animation", "scroller", "logos", "testimonials", "ticker", "motion"],
  files: [{ path: "components/marquee.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "marquee-demo", title: "Logo row", file: "marquee-demo.tsx" },
    { name: "marquee-vertical", title: "Vertical testimonials", file: "marquee-vertical.tsx" },
  ],
  ai: {
    summary:
      "Put the items directly inside <Marquee>; it measures one copy, clones as many as the viewport needs (clones are aria-hidden and inert) and loops them with a GPU transform. Under reduced motion it renders a single copy in a scrollable row.",
    whenToUse: [
      "A row of customer or partner logos under a hero",
      "A wall of short testimonials (vertical, several columns side by side)",
      "A ticker of changelog items, integrations or stats",
    ],
    whenNotToUse: [
      "Content people must read or act on in full (use a grid or carousel with controls)",
      "Critical navigation or calls to action",
    ],
    composesWith: ["spotlight-card", "badge", "avatar"],
    a11y: [
      { keys: "Tab", action: "Moves focus into the first copy of the content and pauses the scroll" },
    ],
    customization: [
      "speed in px/s (default 40); reverse; vertical (set a height with className, e.g. h-80)",
      "gap as px number or CSS length (default 16)",
      "fade toggles the edge mask; pauseOnHover (default true)",
      "Style parts with [data-slot=marquee-track] and [data-slot=marquee-content]",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-28",
})
