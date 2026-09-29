import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "alert",
  type: "registry:ui",
  title: "Alert",
  description:
    "A semantic callout with five theme-aware tones, clear icon placement, an action row, and opt-in urgent announcements.",
  category: "feedback",
  tags: ["alert", "callout", "status"],
  files: [{ path: "components/alert.tsx" }],
  dependencies: ["class-variance-authority"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "alert-demo", title: "Overview", file: "alert-demo.tsx" },
    {
      name: "alert-states",
      title: "States and variants",
      file: "alert-states.tsx",
    },
  ],
  ai: {
    summary:
      "A semantic callout with five theme-aware tones, clear icon placement, an action row, and opt-in urgent announcements.",
    whenToUse: [
      "Display a status or important message",
      "Pair a warning with a clear next action",
    ],
    whenNotToUse: ["Use a toast for transient confirmation"],
    composesWith: ["badge", "button"],
    a11y: [{ keys: "Tab", action: "moves to links and actions" }],
    customization: [
      "variant: default | info | success | warning | destructive",
      "urgent: announce new urgent content",
    ],
  },
  source: {
    name: "shadcn/ui Alert",
    url: "https://github.com/shadcn-ui/ui",
    license: "MIT",
    copyright: "Copyright (c) 2023 shadcn",
    modified: true,
  },
  version: "1.0.0",
  updated: "2026-09-29",
})
