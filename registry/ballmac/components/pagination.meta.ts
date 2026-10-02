import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "pagination",
  type: "registry:ui",
  title: "Pagination",
  description:
    "A semantic page navigation set with current-page feedback, generous targets, and small-screen labels.",
  category: "navigation",
  tags: ["pages", "navigation", "links"],
  files: [{ path: "components/pagination.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "pagination-demo", title: "Overview", file: "pagination-demo.tsx" },
    {
      name: "pagination-states",
      title: "States and variants",
      file: "pagination-states.tsx",
    },
  ],
  ai: {
    summary:
      "A semantic page navigation set with current-page feedback, generous targets, and small-screen labels.",
    whenToUse: [
      "Navigate a large result set by page",
      "Show a current page and neighboring destinations",
    ],
    whenNotToUse: ["Use infinite scroll when discrete pages are unnecessary"],
    composesWith: ["button"],
    a11y: [
      { keys: "Tab", action: "moves between page links" },
      { keys: "Enter", action: "opens the focused page" },
    ],
    customization: ["isActive: marks the current page"],
  },
  source: {
    name: "shadcn/ui Pagination",
    url: "https://github.com/shadcn-ui/ui",
    license: "MIT",
    copyright: "Copyright (c) 2023 shadcn",
    modified: true,
  },
  version: "1.0.0",
  updated: "2026-09-29",
})
