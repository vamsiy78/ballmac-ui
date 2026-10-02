import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "breadcrumb",
  type: "registry:ui",
  title: "Breadcrumb",
  description:
    "A compact navigation trail with truncation, semantic current page, and visible keyboard focus.",
  category: "navigation",
  tags: ["navigation", "hierarchy", "links"],
  files: [{ path: "components/breadcrumb.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "breadcrumb-demo", title: "Overview", file: "breadcrumb-demo.tsx" },
    {
      name: "breadcrumb-states",
      title: "States and variants",
      file: "breadcrumb-states.tsx",
    },
  ],
  ai: {
    summary:
      "A compact navigation trail with truncation, semantic current page, and visible keyboard focus.",
    whenToUse: [
      "Show a location inside a deep hierarchy",
      "Provide a way back to parent sections",
    ],
    whenNotToUse: ["Use tabs for switching peer views"],
    composesWith: ["pagination"],
    a11y: [{ keys: "Tab", action: "moves among breadcrumb links" }],
    customization: ["aria-label: name the navigation landmark"],
  },
  source: {
    name: "shadcn/ui Breadcrumb",
    url: "https://github.com/shadcn-ui/ui",
    license: "MIT",
    copyright: "Copyright (c) 2023 shadcn",
    modified: true,
  },
  version: "1.0.0",
  updated: "2026-09-29",
})
