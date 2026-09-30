import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "inline-alert",
  type: "registry:ui",
  title: "Inline Alert",
  description:
    "A short in-context message with semantic live priority and an optional corrective action.",
  category: "feedback",
  tags: ["validation", "message", "status"],
  files: [
    {
      path: "components/inline-alert.tsx",
    },
  ],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    {
      name: "inline-alert-demo",
      title: "Overview",
      file: "inline-alert-demo.tsx",
    },
    {
      name: "inline-alert-states",
      title: "States and variants",
      file: "inline-alert-states.tsx",
    },
  ],
  ai: {
    summary:
      "A short in-context message with semantic live priority and an optional corrective action.",
    whenToUse: [
      "Explain a field or form outcome",
      "Show a small inline confirmation",
    ],
    whenNotToUse: ["Use alert for a larger callout"],
    composesWith: ["alert", "input"],
    a11y: [
      {
        keys: "Tab / Enter",
        action: "Focus and activate an optional action",
      },
    ],
    customization: ["tone: info | success | error", "Action slot"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
})
