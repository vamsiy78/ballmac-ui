import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "search-field",
  type: "registry:ui",
  title: "Search Field",
  description:
    "A compact search control with a clear action, Enter callback, and preserved keyboard focus.",
  category: "forms",
  tags: ["search", "filter", "input"],
  files: [{ path: "components/search-field.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    {
      name: "search-field-demo",
      title: "Overview",
      file: "search-field-demo.tsx",
    },
    {
      name: "search-field-states",
      title: "States and variants",
      file: "search-field-states.tsx",
    },
  ],
  ai: {
    summary:
      "A compact search control with a clear action, Enter callback, and preserved keyboard focus.",
    whenToUse: ["Filter a list or catalog", "Submit a query from a toolbar"],
    whenNotToUse: ["Use spotlight-search for site-wide command search"],
    composesWith: ["input"],
    a11y: [
      { keys: "Enter", action: "Submits the current query" },
      { keys: "Tab / Space", action: "Clears the query and returns focus" },
    ],
    customization: ["onSearch", "value / defaultValue and onValueChange"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
})
