import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "dotted-map",
  type: "registry:ui",
  title: "Dotted Map",
  description:
    "A world map built from dots, with pulsing markers, optional labels and animated routes between places, as one lightweight SVG with a text summary for screen readers.",
  category: "data-display",
  tags: ["map", "world", "dots", "markers", "locations"],
  files: [{ path: "components/dotted-map.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils", "motion-presets", "i18n"],
  examples: [
    { name: "dotted-map-demo", title: "Offices with routes", file: "dotted-map-demo.tsx" },
    { name: "dotted-map-regions", title: "Dense map with labels", file: "dotted-map-regions.tsx" },
  ],
  ai: {
    summary:
      "<DottedMap markers={[{ lat, lng, label, tone }]} arcs={[{ from:[lat,lng], to:[lat,lng] }]} dots latRange tone labels />. The land mask is built in; nothing is fetched. Higher dots gives finer coastlines.",
    whenToUse: ["Where-we-operate and customer-location sections", "Network and traffic visualizations"],
    whenNotToUse: ["Interactive geographic data or zooming (use a map library)", "A 3D globe (globe)"],
    composesWith: ["globe", "stat-card"],
    a11y: [
      { keys: "Screen readers", action: "The map is an image whose name lists every labelled place" },
      { keys: "Reduced motion", action: "Routes are drawn solid and markers do not pulse" },
    ],
    customization: ["dots", "latRange", "tone", "labels", "markers and arcs"],
  },
  source: {
  name: "cobe",
  url: "https://github.com/shuding/cobe",
  license: "MIT",
  copyright: "Copyright (c) 2021 Shu Ding",
  modified: true
},
  version: "1.0.0",
  updated: "2026-10-01",
})
