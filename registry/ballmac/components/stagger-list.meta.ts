import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "stagger-list",
  type: "registry:ui",
  title: "Stagger List",
  description:
    "A list or grid whose items arrive one after another from any direction, then glide to their new places when filtered, sorted, added or removed.",
  category: "motion",
  tags: ["list", "stagger", "reorder", "filter", "entrance"],
  files: [{ path: "components/stagger-list.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "stagger-list-demo", title: "Filterable grid", file: "stagger-list-demo.tsx" },
    { name: "stagger-list-directions", title: "Four directions", file: "stagger-list-directions.tsx" },
  ],
  ai: {
    summary:
      "<StaggerList stagger direction distance inView reorder><StaggerItem key={id}>\u2026</StaggerItem></StaggerList>. Keep each item's key stable and filtering or sorting animates automatically.",
    whenToUse: ["Result lists that filter or sort", "Feature grids that should arrive in sequence"],
    whenNotToUse: ["A live feed where new items push others down (animated-list)", "Plain fade-ins (blur-fade)"],
    composesWith: ["animated-list", "blur-fade", "bento-grid"],
    a11y: [
      { keys: "Screen readers", action: "The real list markup is untouched; only opacity and position change" },
      { keys: "Reduced motion", action: "Items are shown at once and reordering is instant" },
    ],
    customization: ["as: ul | ol | div", "stagger and delay", "direction: up | down | left | right | scale", "reorder"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
