import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "animated-list",
  type: "registry:ui",
  title: "Animated List",
  description:
    "A live feed where new items spring in at the top and the rest glide down, with leave animations, an item cap, an optional fading tail and a polite announcement for new entries.",
  category: "motion",
  tags: ["list", "feed", "notifications", "live", "spring"],
  files: [{ path: "components/animated-list.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "animated-list-demo", title: "Live notification feed", file: "animated-list-demo.tsx" },
    { name: "animated-list-log", title: "Capped activity log", file: "animated-list-log.tsx" },
  ],
  ai: {
    summary:
      "<AnimatedList max fadeEnd announce><AnimatedListItem key={id}>\u2026</AnimatedListItem></AnimatedList>. Each item needs a stable key. Prepend new entries to your array; layout animation does the rest.",
    whenToUse: ["Live activity, notification and event feeds", "Chat-like logs where entries arrive over time"],
    whenNotToUse: ["Static lists (stagger-list)", "Hundreds of rows (virtualize instead)"],
    composesWith: ["notification-stack", "activity-feed", "stagger-list"],
    a11y: [
      { keys: "Screen readers", action: "announce turns on a polite live region that reads additions only" },
      { keys: "Reduced motion", action: "Items fade in without moving or scaling" },
    ],
    customization: ["max", "fadeEnd", "announce", "label", "item content is yours"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
