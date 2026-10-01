import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "ripple",
  type: "registry:ui",
  title: "Ripple",
  description:
    "Concentric rings that breathe outward as a background, plus a press ripple that spreads from the pointer (or the center for keyboard) on any surface.",
  category: "backgrounds",
  tags: ["ripple", "rings", "background", "click", "material"],
  files: [{ path: "components/ripple.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "ripple-demo", title: "Ring background behind a hero", file: "ripple-demo.tsx" },
    { name: "ripple-click", title: "Press ripple on cards", file: "ripple-click.tsx" },
  ],
  ai: {
    summary:
      "<Ripple circles size gap duration /> fills its positioned parent. <ClickRipple centered duration> wraps a surface and ripples on pointer down, and from the center on Enter or Space when the wrapper itself has focus.",
    whenToUse: ["A calm focal point behind a central call to action", "Touch feedback on custom cards and tiles"],
    whenNotToUse: ["Standard buttons (the Ballmac button already has press feedback)"],
    composesWith: ["card", "button", "orbiting-circles"],
    a11y: [
      { keys: "Screen readers", action: "All rings and ripples are aria-hidden and pointer-events-none" },
      { keys: "Reduced motion", action: "Rings are still and press ripples are skipped" },
    ],
    customization: ["circles, size, gap", "duration", "ClickRipple centered"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
