import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "icon-cloud",
  type: "registry:ui",
  title: "Icon Cloud",
  description:
    "Icons, logos or labels orbiting on a 3D sphere, spun by dragging, calming under the pointer and when anything has focus, with real list markup so every item stays reachable.",
  category: "motion",
  tags: ["sphere", "3d", "logos", "cloud", "tech stack"],
  files: [{ path: "components/icon-cloud.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "icon-cloud-demo", title: "Tech stack sphere", file: "icon-cloud-demo.tsx" },
    { name: "icon-cloud-links", title: "Linked labels", file: "icon-cloud-links.tsx" },
  ],
  ai: {
    summary:
      "<IconCloud size speed label>{items}</IconCloud>. Each child becomes a list item. Positions come from a Fibonacci sphere and update straight on the DOM. Links inside stay clickable because dragging only starts after a few pixels of movement.",
    whenToUse: ["Showing a technology or partner ecosystem", "A playful, interactive hero centerpiece"],
    whenNotToUse: ["Anything people must read quickly", "Long lists (use a grid)"],
    composesWith: ["orbiting-circles", "globe", "marquee"],
    a11y: [
      { keys: "Tab", action: "Items remain focusable in document order; rotation stops while one has focus" },
      { keys: "Screen readers", action: "A named list; position changes are visual only" },
      { keys: "Reduced motion", action: "A still sphere" },
    ],
    customization: ["size", "speed", "label", "children as icons, links or text"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
