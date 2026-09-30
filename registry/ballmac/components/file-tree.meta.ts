import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "file-tree",
  type: "registry:ui",
  title: "File Tree",
  description:
    "A folder and file explorer with semantic tree navigation and file-type icons.",
  category: "data-display",
  tags: ["files", "folders", "tree"],
  files: [{ path: "components/file-tree.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["tree-view"],
  examples: [
    { name: "file-tree-demo", title: "Overview", file: "file-tree-demo.tsx" },
    {
      name: "file-tree-states",
      title: "States and variants",
      file: "file-tree-states.tsx",
    },
  ],
  ai: {
    summary:
      "A folder and file explorer with semantic tree navigation and file-type icons.",
    whenToUse: ["Browse a project or document hierarchy"],
    whenNotToUse: ["Use Tree View for non-file hierarchies"],
    composesWith: ["tree-view"],
    a11y: [
      {
        keys: "Arrow keys / Home / End / Enter / Space",
        action: "Navigates folders and selects files",
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
