import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "callout",
  type: "registry:ui",
  title: "Callout",
  description:
    "An editorial guidance panel with a clear kind label, icon, title, and optional action.",
  category: "feedback",
  tags: ["guidance", "tip", "note"],
  files: [
    {
      path: "components/callout.tsx",
    },
  ],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    {
      name: "callout-demo",
      title: "Overview",
      file: "callout-demo.tsx",
    },
    {
      name: "callout-states",
      title: "States and variants",
      file: "callout-states.tsx",
    },
  ],
  ai: {
    summary:
      "An editorial guidance panel with a clear kind label, icon, title, and optional action.",
    whenToUse: [
      "Add contextual guidance to docs or settings",
      "Explain a recommended next step",
    ],
    whenNotToUse: ["Use alert for urgent system feedback"],
    composesWith: ["alert", "button"],
    a11y: [
      {
        keys: "Tab",
        action: "Focus an optional action",
      },
    ],
    customization: ["kind: tip | note | caution", "Action slot and content"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
})
