import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "animated-beam",
  type: "registry:ui",
  title: "Animated Beam",
  description:
    "An SVG beam that connects two elements with a curved path and sends a glowing gradient pulse along it. Follows layout changes, pauses off-screen, static under reduced motion.",
  category: "motion",
  featured: true,
  tags: ["beam", "connection", "integration", "diagram", "svg", "hero", "motion"],
  files: [{ path: "components/animated-beam.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "animated-beam-demo", title: "Agent integrations", file: "animated-beam-demo.tsx" },
    { name: "animated-beam-bidirectional", title: "Two-way sync", file: "animated-beam-bidirectional.tsx" },
  ],
  ai: {
    summary:
      "Give a relative container a ref, give each endpoint element a ref, and render <AnimatedBeam containerRef fromRef toRef /> inside the container once per connection. Put endpoint nodes above the beams with relative z-10. The SVG is aria-hidden and pointer-events-none.",
    whenToUse: [
      "Integration diagrams: tools or data sources flowing into an agent or product",
      "Showing a request path between services on a landing page",
      "Explaining a sync or pipeline visually in a feature section",
    ],
    whenNotToUse: [
      "Real, data-driven graphs with many nodes (use a graph library)",
      "Conveying state on its own; label the nodes, the beam is decorative",
    ],
    composesWith: ["orbiting-circles", "dot-pattern", "border-beam"],
    customization: [
      "curvature in px (positive bows up), reverse to flip direction",
      "duration, delay and repeatDelay in seconds; stagger delays across beams",
      "pulseLength as a fraction of the path (default 0.35)",
      "startXOffset/startYOffset/endXOffset/endYOffset to attach to node edges",
      "pathColor, pathWidth, pathOpacity; gradientStartColor/gradientStopColor default to var(--chart-1) → var(--chart-4)",
    ],
  },
  source: {
    name: "Magic UI Animated Beam",
    url: "https://github.com/magicuidesign/magicui",
    license: "MIT",
    copyright: "Copyright (c) Magic UI",
    modified: true,
  },
  version: "1.0.0",
  updated: "2026-09-29",
})
