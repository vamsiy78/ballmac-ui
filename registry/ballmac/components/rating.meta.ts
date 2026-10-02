import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "rating",
  type: "registry:ui",
  title: "Rating",
  description:
    "A native radio-group star rating with keyboard arrows, value text, and a clear action.",
  category: "forms",
  tags: ["rating", "stars", "feedback"],
  files: [{ path: "components/rating.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "rating-demo", title: "Overview", file: "rating-demo.tsx" },
    {
      name: "rating-states",
      title: "States and variants",
      file: "rating-states.tsx",
    },
  ],
  ai: {
    summary:
      "A native radio-group star rating with keyboard arrows, value text, and a clear action.",
    whenToUse: [
      "Collect a quick score or satisfaction rating",
      "Display a read-only score beside content",
    ],
    whenNotToUse: ["Use a text field for detailed feedback"],
    composesWith: ["button"],
    a11y: [
      {
        keys: "Arrow Left / Right",
        action: "Changes the selected native radio",
      },
      { keys: "Tab / Space", action: "Focuses and activates Clear" },
    ],
    customization: [
      "max, showValue, readOnly",
      "value / defaultValue and onValueChange",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-30",
})
