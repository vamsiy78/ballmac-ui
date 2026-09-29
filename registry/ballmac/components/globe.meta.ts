import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "globe",
  type: "registry:ui",
  title: "Globe",
  description:
    "An interactive WebGL dot globe (cobe) with markers, drag-to-spin momentum and arrow-key control. Colors come from theme tokens and repaint on theme change; starts lazily and pauses off-screen.",
  category: "backgrounds",
  featured: true,
  tags: ["globe", "webgl", "map", "regions", "3d", "hero", "interactive"],
  files: [{ path: "components/globe.tsx" }],
  dependencies: ["cobe@^0.6"],
  registryDependencies: ["shadcn:utils", "color"],
  examples: [
    { name: "globe-demo", title: "Regions card", file: "globe-demo.tsx" },
    { name: "globe-hero", title: "Hero horizon", file: "globe-hero.tsx" },
  ],
  ai: {
    summary:
      "Render <Globe markers={[{ location: [lat, lng], size: 0.06 }]} /> in a sized container (it is a square, w-full, max 600px). The canvas has role=img and an aria-label; pass label to describe what it shows. It starts WebGL only when scrolled near the viewport.",
    whenToUse: [
      "Showing global reach: regions, edge locations, offices, customers by country",
      "A hero or feature-card visual for infrastructure, networking or travel products",
    ],
    whenNotToUse: [
      "Precise geographic data or choropleths (use a real map library)",
      "Several globes on one page; each is a WebGL context",
    ],
    composesWith: ["number-ticker", "spotlight-card", "badge"],
    a11y: [
      { keys: "Arrow Left / Arrow Right", action: "Spins the globe" },
      { keys: "Arrow Up / Arrow Down", action: "Tilts the globe; it settles back" },
    ],
    customization: [
      "markers: [{ location: [lat, lng], size }]",
      "markerColor (default --chart-1), baseColor and glowColor: CSS variable names or any CSS color; defaults adapt to light and dark",
      "speed (radians per frame, 0 to stop), phi, theta, mapBrightness, mapSamples",
      "interactive={false} for a purely decorative globe",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-29",
})
