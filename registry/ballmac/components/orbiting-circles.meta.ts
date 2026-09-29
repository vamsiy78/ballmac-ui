import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "orbiting-circles",
  type: "registry:ui",
  title: "Orbiting Circles",
  description:
    "Items that orbit a center on circular tracks while staying upright. Evenly spaced, any radius, speed and direction; stack several for rings. Paused off-screen, static under reduced motion.",
  category: "motion",
  tags: ["orbit", "integrations", "icons", "rings", "hero", "motion"],
  files: [{ path: "components/orbiting-circles.tsx" }],
  dependencies: [],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "orbiting-circles-demo", title: "Integrations", file: "orbiting-circles-demo.tsx" },
    { name: "orbiting-circles-minimal", title: "Single ring", file: "orbiting-circles-minimal.tsx" },
  ],
  ai: {
    summary:
      "Inside a relative container with a fixed height, render the center element, then one <OrbitingCircles radius duration> per ring with the orbiting items as children. Each ring fills the container (absolute inset-0) and centers itself; items are laid out evenly around the circle.",
    whenToUse: [
      "An integrations or ecosystem section: your product in the middle, tools around it",
      "A hero visual for a platform that connects many services",
    ],
    whenNotToUse: [
      "Items people must read or click reliably (moving targets); use a grid",
      "More than about 8 items per ring",
    ],
    composesWith: ["animated-beam", "dot-pattern"],
    customization: [
      "radius (px), duration (s per orbit), reverse, startAngle (degrees)",
      "iconSize: the box each item gets (px)",
      "path toggles the dashed track; restyle it with [&_[data-slot=orbiting-circles-path]_circle]:stroke-…",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-29",
})
