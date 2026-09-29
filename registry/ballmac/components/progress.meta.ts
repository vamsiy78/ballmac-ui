import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "progress",
  type: "registry:ui",
  title: "Progress",
  description:
    "A Radix progress bar with clamped values, optional percentage text, and a reduced-motion-safe pending state.",
  category: "feedback",
  tags: ["loading", "progress", "status"],
  files: [{ path: "components/progress.tsx" }],
  dependencies: ["radix-ui"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "progress-demo", title: "Overview", file: "progress-demo.tsx" },
    {
      name: "progress-states",
      title: "States and variants",
      file: "progress-states.tsx",
    },
  ],
  ai: {
    summary:
      "A Radix progress bar with clamped values, optional percentage text, and a reduced-motion-safe pending state.",
    whenToUse: [
      "Show completion of a bounded task",
      "Show work in progress when completion is unknown",
    ],
    whenNotToUse: ["Use a spinner for very short waits"],
    composesWith: ["spinner"],
    a11y: [],
    customization: [
      "value: current value or null for indeterminate",
      "showValue: display percentage",
    ],
  },
  source: {
    name: "shadcn/ui Progress",
    url: "https://github.com/shadcn-ui/ui",
    license: "MIT",
    copyright: "Copyright (c) 2023 shadcn",
    modified: true,
  },
  version: "1.0.0",
  updated: "2026-09-29",
})
