import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "progress-ring",
  type: "registry:ui",
  title: "Progress Ring",
  description:
    "A token-colored circular progress meter with a readable center and accessible value.",
  category: "data-display",
  tags: ["progress", "gauge", "status"],
  files: [{ path: "components/progress-ring.tsx" }],
  dependencies: [],
  registryDependencies: ["shadcn:utils"],
  examples: [
    {
      name: "progress-ring-demo",
      title: "Overview",
      file: "progress-ring-demo.tsx",
    },
    {
      name: "progress-ring-states",
      title: "States and variants",
      file: "progress-ring-states.tsx",
    },
  ],
  ai: {
    summary:
      "A token-colored circular progress meter with a readable center and accessible value.",
    whenToUse: ["Show bounded progress in a small area"],
    whenNotToUse: ["Use Progress for a full-width track"],
    composesWith: ["progress"],
    a11y: [
      {
        keys: "None",
        action: "Progressbar name and current value are announced",
      },
    ],
    customization: ["Content, layout, and token-based className styling"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
})
