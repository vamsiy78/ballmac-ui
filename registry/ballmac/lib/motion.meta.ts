import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "motion-presets",
  type: "registry:lib",
  title: "Motion Presets",
  description:
    "Shared easings, durations, springs and enter variants for Motion, so every animated component moves with the same rhythm.",
  category: "foundation",
  tags: ["motion", "animation", "easing", "spring"],
  files: [{ path: "lib/motion.ts" }],
  dependencies: ["motion@^12"],
  ai: {
    summary: "Import ease, duration, spring, variants and stagger from @/lib/ballmac/motion instead of hard-coding animation values.",
    whenToUse: ["Writing a new animated component that should match Ballmac UI", "Page or section entrance animations"],
    whenNotToUse: ["CSS-only transitions (use the --bm-ease-* and --bm-duration-* variables)"],
    customization: ["spring.snappy for controls, spring.gentle for panels, spring.bouncy for accents", "variants.fadeUp with stagger() for lists"],
  },
  version: "1.0.0",
  updated: "2026-09-28",
})
