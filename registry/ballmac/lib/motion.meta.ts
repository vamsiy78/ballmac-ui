import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "motion-presets",
  type: "registry:lib",
  title: "Motion Presets",
  description:
    "Shared easings, durations, springs and enter variants for Motion that follow the theme's motion tokens (speed, bounce, travel, hover, stagger), plus a useMotion hook.",
  category: "foundation",
  tags: ["motion", "animation", "easing", "spring"],
  files: [{ path: "lib/motion.ts" }],
  dependencies: ["motion@^12"],
  ai: {
    summary: "Import ease, duration, spring, variants and stagger from @/lib/ballmac/motion instead of hard-coding animation values. They read the theme's --bm-* motion variables, so a motion theme changes them with no code changes. useMotion() gives the same numbers reactively.",
    whenToUse: ["Writing a new animated component that should match Ballmac UI", "Page or section entrance animations"],
    whenNotToUse: ["CSS-only transitions (use the --bm-ease-* and --bm-duration-* variables)"],
    customization: ["spring.snappy for controls, spring.gentle for panels, spring.bouncy for accents", "variants.fadeUp with stagger() for lists", "useMotion() for live durations, springs, distance, lift, press and loop; MotionProvider scopes a setting to a preview"],
  },
  version: "1.1.0",
  updated: "2026-10-11",
  changelog: [
    { version: "1.1.0", date: "2026-10-11", note: "Durations, springs, variants and stagger follow the theme's --bm-* motion variables (defaults are unchanged). Adds useMotion, MotionProvider, getMotion and refreshMotion." },
    { version: "1.0.0", date: "2026-09-28", note: "First release." },
  ],
})
