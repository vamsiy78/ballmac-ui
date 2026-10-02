import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "diff-viewer",
  type: "registry:ui",
  title: "Diff Viewer",
  description:
    "A line-by-line text diff with change counts, line numbers, and accessible change labels.",
  category: "data-display",
  tags: ["diff", "code", "comparison"],
  files: [{ path: "components/diff-viewer.tsx" }],
  dependencies: [],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    {
      name: "diff-viewer-demo",
      title: "Overview",
      file: "diff-viewer-demo.tsx",
    },
    {
      name: "diff-viewer-states",
      title: "States and variants",
      file: "diff-viewer-states.tsx",
    },
  ],
  ai: {
    summary:
      "A line-by-line text diff with change counts, line numbers, and accessible change labels.",
    whenToUse: ["Review before-and-after text changes"],
    whenNotToUse: ["Use Comparison Table for product features"],
    composesWith: ["code-block"],
    a11y: [
      { keys: "Tab / Arrow keys", action: "Focuses and scrolls long diffs" },
    ],
    customization: [
      "Controlled and uncontrolled state",
      "Content and token-based className styling",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-30",
})
