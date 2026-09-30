import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "tree-view",
  type: "registry:ui",
  title: "Tree View",
  description:
    "A keyboard-operable hierarchical tree with selection, expansion, and optional node icons.",
  category: "data-display",
  tags: ["tree", "navigation", "hierarchy"],
  files: [{ path: "components/tree-view.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "tree-view-demo", title: "Overview", file: "tree-view-demo.tsx" },
    {
      name: "tree-view-states",
      title: "States and variants",
      file: "tree-view-states.tsx",
    },
  ],
  ai: {
    summary:
      "A keyboard-operable hierarchical tree with selection, expansion, and optional node icons.",
    whenToUse: ["Browse nested navigation or structured data"],
    whenNotToUse: ["Use File Tree for folders and files"],
    composesWith: ["file-tree"],
    a11y: [
      {
        keys: "Arrow keys / Home / End / Enter / Space",
        action: "Navigates, expands, and selects nodes",
      },
    ],
    customization: [
      "Controlled and uncontrolled state",
      "Content and token-based className styling",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-30",
})
