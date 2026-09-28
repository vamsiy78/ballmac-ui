import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "badge",
  type: "registry:ui",
  title: "Badge",
  description:
    "A small pill label in four variants with an optional status dot and success, warning and error tones. Style links with badgeVariants().",
  category: "primitives",
  tags: ["badge", "status", "tag", "label", "pill"],
  files: [{ path: "components/badge.tsx" }],
  dependencies: ["radix-ui", "class-variance-authority"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "badge-demo", title: "Default", file: "badge-demo.tsx" },
    { name: "badge-status", title: "Status", file: "badge-status.tsx" },
  ],
  ai: {
    summary:
      "Short metadata or status label. Use variant for emphasis, status (neutral | success | warning | error) for state with a coloured dot, and badgeVariants() on an <a> for a link.",
    whenToUse: ["Status of a deployment, invoice or job", "Counts, plan names and version tags", "Small labels on cards and table rows"],
    whenNotToUse: ["Clickable filters that toggle (use a toggle or button)", "Long text (it doesn't wrap)", "Notifications that need attention (use an alert or toast)"],
    composesWith: ["avatar", "button", "switch"],
    a11y: [],
    customization: ["variant: default | secondary | outline | destructive", "status: neutral | success (chart-2) | warning (chart-3) | error (destructive); overrides variant colours with a soft tint", "dot: shows a leading dot; on by default when status is set", "badgeVariants({ variant }) gives the same styles to an <a> or button"],
  },
  source: {
    name: "shadcn/ui Badge",
    url: "https://github.com/shadcn-ui/ui",
    license: "MIT",
    copyright: "Copyright (c) 2023 shadcn",
    modified: true,
  },
  version: "1.0.0",
  updated: "2026-09-28",
})
