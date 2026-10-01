import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "interactive-grid",
  type: "registry:ui",
  title: "Interactive Grid",
  description:
    "A canvas grid whose cells light up under the pointer and fade out behind it, leaving a glowing trail, drawn only while something is moving and listening on its parent so content above never blocks it.",
  category: "backgrounds",
  tags: ["grid", "canvas", "hover", "trail", "background"],
  files: [{ path: "components/interactive-grid.tsx" }],
  dependencies: [],
  registryDependencies: ["shadcn:utils", "color"],
  examples: [
    { name: "interactive-grid-demo", title: "Hero that reacts to the pointer", file: "interactive-grid-demo.tsx" },
    { name: "interactive-grid-colors", title: "Colors and cell size", file: "interactive-grid-colors.tsx" },
  ],
  ai: {
    summary:
      "<InteractiveGrid cell color lineColor radius decay fade /> inside a relative parent. Colors are CSS variable names. It listens to the parent, repaints on theme changes and stops its frame loop when idle.",
    whenToUse: ["Heroes and empty states that should respond to the mouse", "Playful 404 pages"],
    whenNotToUse: ["Touch-only audiences (there is no hover)", "Large amounts of text over the grid"],
    composesWith: ["grid-pattern", "flickering-grid", "particles"],
    a11y: [
      { keys: "Screen readers", action: "Decorative: aria-hidden and pointer-events-none" },
      { keys: "Reduced motion", action: "A still grid; nothing lights up" },
    ],
    customization: ["cell", "color and lineColor", "radius", "decay", "fade"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
