import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "usage-meter",
  type: "registry:ui",
  title: "Usage Meter",
  description:
    "A plan-limit meter as a bar or ring, with normal, near-limit and over-limit states shown by icon and words, optional stacked segments and a meter role.",
  category: "saas",
  tags: ["usage", "limit", "quota", "meter"],
  files: [{ path: "components/usage-meter.tsx" }],
  dependencies: ["motion@^12", "lucide-react"],
  registryDependencies: ["shadcn:utils", "motion-presets", "i18n"],
  examples: [
    { name: "usage-meter-demo", title: "Storage with segments", file: "usage-meter-demo.tsx" },
    { name: "usage-meter-states", title: "Warning, over and ring", file: "usage-meter-states.tsx" },
  ],
  ai: {
    summary:
      "label, used (or segments), limit, unit. warnAt sets the warning percent. variant bar | ring. Exposes role=meter with a readable value.",
    whenToUse: ["Storage, seats, API calls and other quotas", "Plan pages that nudge upgrades"],
    whenNotToUse: ["Task progress; use progress", "Multiple steps; use progress-steps"],
    composesWith: ["billing-card", "plan-selector", "progress"],
    a11y: [
      { keys: "Screen readers", action: "role=meter with aria-valuetext such as '86 of 100 k. 86% used, nearing the limit.'" },
      { keys: "Color", action: "State is conveyed by icon and text as well as color" },
      { keys: "Reduced motion", action: "Fills appear at their final size" },
    ],
    customization: ["segments", "warnAt", "variant", "note and action slots"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
});
