import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "empty-state",
  type: "registry:ui",
  title: "Empty State",
  description:
    "A ready-to-use empty screen with guidance and primary and secondary action slots.",
  category: "feedback",
  tags: ["empty", "placeholder", "action"],
  files: [
    {
      path: "components/empty-state.tsx",
    },
  ],
  dependencies: ["lucide-react"],
  registryDependencies: ["empty", "shadcn:utils"],
  examples: [
    {
      name: "empty-state-demo",
      title: "Overview",
      file: "empty-state-demo.tsx",
    },
    {
      name: "empty-state-states",
      title: "States and variants",
      file: "empty-state-states.tsx",
    },
  ],
  ai: {
    summary:
      "A ready-to-use empty screen with guidance and primary and secondary action slots.",
    whenToUse: ["Explain an empty collection", "Offer a clear first action"],
    whenNotToUse: ["Use empty for a custom composition"],
    composesWith: ["empty", "button"],
    a11y: [
      {
        keys: "Tab / Enter",
        action: "Focus and activate supplied actions",
      },
    ],
    customization: ["Compact layout", "Icon and actions"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
})
