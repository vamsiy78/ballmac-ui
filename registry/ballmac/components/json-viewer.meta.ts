import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "json-viewer",
  type: "registry:ui",
  title: "JSON Viewer",
  description:
    "A collapsible JSON inspector with compact type styling and keyboard-operable branches.",
  category: "data-display",
  tags: ["json", "data", "developer"],
  files: [{ path: "components/json-viewer.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    {
      name: "json-viewer-demo",
      title: "Overview",
      file: "json-viewer-demo.tsx",
    },
    {
      name: "json-viewer-states",
      title: "States and variants",
      file: "json-viewer-states.tsx",
    },
  ],
  ai: {
    summary:
      "A collapsible JSON inspector with compact type styling and keyboard-operable branches.",
    whenToUse: ["Inspect nested API responses or configuration"],
    whenNotToUse: ["Use Code Block for unstructured text"],
    composesWith: ["code-block"],
    a11y: [
      {
        keys: "Tab / Enter / Space",
        action: "Focuses and toggles JSON branches",
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
