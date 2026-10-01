import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "retro-grid",
  type: "registry:ui",
  title: "Retro Grid",
  description:
    "A perspective floor of grid lines gliding toward you under a glowing horizon, tinted with any theme color, tilt and cell size adjustable, still under reduced motion.",
  category: "backgrounds",
  tags: ["grid", "perspective", "synthwave", "background", "hero"],
  files: [{ path: "components/retro-grid.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "retro-grid-demo", title: "Hero with horizon glow", file: "retro-grid-demo.tsx" },
    { name: "retro-grid-tones", title: "Tones and tilt", file: "retro-grid-tones.tsx" },
  ],
  ai: {
    summary:
      "Place <RetroGrid angle cellSize tone speed glow /> inside a relative, overflow-hidden parent and put content above it. It fades into the page background at the horizon.",
    whenToUse: ["Landing page heroes with a technical or retro mood", "Under a centered headline and call to action"],
    whenNotToUse: ["Dense UI behind small text", "Pages with many competing backgrounds"],
    composesWith: ["grid-pattern", "light-rays", "aurora-background"],
    a11y: [
      { keys: "Screen readers", action: "Decorative: aria-hidden and pointer-events-none" },
      { keys: "Reduced motion", action: "The floor is still" },
    ],
    customization: ["angle", "cellSize", "tone", "speed", "glow"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
