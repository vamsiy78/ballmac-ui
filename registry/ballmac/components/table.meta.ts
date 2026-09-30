import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "table",
  type: "registry:ui",
  title: "Table",
  description:
    "A semantic table in a focusable, named scroll region, with sticky header, striping, three densities, aria-sort headers and numeric columns.",
  category: "data-display",
  tags: ["table", "data", "semantic", "responsive"],
  files: [{ path: "components/table.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "table-demo", title: "Invoices", file: "table-demo.tsx" },
    { name: "table-states", title: "Sortable and sticky", file: "table-states.tsx" },
  ],
  ai: {
    summary:
      "Static table parts. The wrapper scrolls on narrow screens and is keyboard focusable; pass label to name it and sort on TableHead for aria-sort.",
    whenToUse: ["Invoices, logs and lists of records", "Read-only or lightly interactive data"],
    whenNotToUse: ["Sorting, filtering and pagination logic; build on data-table", "Key-value pairs; use description-list"],
    composesWith: ["badge", "pagination"],
    a11y: [
      { keys: "Tab", action: "Focuses the scroll region, then any controls inside it" },
      { keys: "Arrow keys", action: "Scroll the focused region" },
    ],
    customization: ["stickyHeader with containerClassName max height", "striped", "density: compact | default | comfortable", "numeric on TableHead and TableCell"],
  },
  source: {
    name: "shadcn/ui Table",
    url: "https://github.com/shadcn-ui/ui",
    license: "MIT",
    copyright: "Copyright (c) 2023 shadcn",
    modified: true,
  },
  version: "1.0.0",
  updated: "2026-09-30",
});
