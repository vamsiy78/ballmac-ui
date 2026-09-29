import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "spinner",
  type: "registry:ui",
  title: "Spinner",
  description:
    "A compact loading indicator with three sizes, an accessible label, and reduced-motion behavior.",
  category: "feedback",
  tags: ["loading", "busy", "indicator"],
  files: [{ path: "components/spinner.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "spinner-demo", title: "Overview", file: "spinner-demo.tsx" },
    {
      name: "spinner-states",
      title: "States and variants",
      file: "spinner-states.tsx",
    },
  ],
  ai: {
    summary:
      "A compact loading indicator with three sizes, an accessible label, and reduced-motion behavior.",
    whenToUse: [
      "Show a short in-progress action",
      "Place inside a disabled submit button",
    ],
    whenNotToUse: ["Use progress for a measurable operation"],
    composesWith: ["button"],
    a11y: [],
    customization: [
      "size: sm | default | lg",
      "label: screen reader announcement",
    ],
  },
  source: {
    name: "shadcn/ui Spinner",
    url: "https://github.com/shadcn-ui/ui",
    license: "MIT",
    copyright: "Copyright (c) 2023 shadcn",
    modified: true,
  },
  version: "1.0.0",
  updated: "2026-09-29",
})
