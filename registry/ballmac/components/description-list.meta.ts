import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "description-list",
  type: "registry:ui",
  title: "Description List",
  description:
    "A semantic key-value surface with responsive split and stacked layouts.",
  category: "data-display",
  tags: ["details", "key-value", "metadata"],
  files: [{ path: "components/description-list.tsx" }],
  dependencies: [],
  registryDependencies: ["shadcn:utils"],
  examples: [
    {
      name: "description-list-demo",
      title: "Overview",
      file: "description-list-demo.tsx",
    },
    {
      name: "description-list-states",
      title: "States and variants",
      file: "description-list-states.tsx",
    },
  ],
  ai: {
    summary:
      "A semantic key-value surface with responsive split and stacked layouts.",
    whenToUse: ["Display read-only properties for an object"],
    whenNotToUse: ["Use a form for editable fields"],
    composesWith: ["card"],
    a11y: [
      {
        keys: "None",
        action: "Static content is announced with semantic structure",
      },
    ],
    customization: ["Content, layout, and token-based className styling"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
})
