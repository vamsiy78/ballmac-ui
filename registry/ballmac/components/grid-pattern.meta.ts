import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "grid-pattern",
  type: "registry:ui",
  title: "Grid Pattern",
  description:
    "A crisp square-grid background in the border color with optional dashed lines, filled cells, softly lighting random cells and an edge fade, drawn as one SVG pattern.",
  category: "backgrounds",
  tags: ["grid", "pattern", "svg", "background", "lines"],
  files: [{ path: "components/grid-pattern.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "grid-pattern-demo", title: "Faded grid with highlighted cells", file: "grid-pattern-demo.tsx" },
    { name: "grid-pattern-variants", title: "Dashed and flickering", file: "grid-pattern-variants.tsx" },
  ],
  ai: {
    summary:
      "<GridPattern cell strokeDasharray squares={[[col,row]]} flicker={n} fade='radial|top|bottom|none' /> in a relative parent. Random cells are picked after mount so server and browser agree.",
    whenToUse: ["Section and hero backgrounds that need structure", "Behind cards and empty states"],
    whenNotToUse: ["Dots (dot-pattern)", "A pointer-reactive grid (interactive-grid)"],
    composesWith: ["dot-pattern", "interactive-grid", "animated-grid"],
    a11y: [
      { keys: "Screen readers", action: "Decorative: aria-hidden" },
      { keys: "Reduced motion", action: "No random cells light up" },
    ],
    customization: ["cell", "x and y offset", "strokeDasharray", "squares", "flicker", "fade"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
