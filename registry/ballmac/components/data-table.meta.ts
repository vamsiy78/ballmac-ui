import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "data-table",
  type: "registry:ui",
  title: "Data Table",
  description:
    "A complete data grid on TanStack Table: sortable headers, search, column visibility, row selection, pagination, a loading state and live result counts.",
  category: "data-display",
  tags: ["table", "sorting", "filter", "pagination", "tanstack"],
  files: [{ path: "components/data-table.tsx" }],
  dependencies: ["@tanstack/react-table@^8", "lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "checkbox", "dropdown-menu", "table", "i18n"],
  examples: [
    { name: "data-table-demo", title: "Invoices", file: "data-table-demo.tsx" },
    { name: "data-table-states", title: "Loading and empty", file: "data-table-states.tsx" },
  ],
  ai: {
    summary:
      "Pass columns (TanStack ColumnDef) and data. Use DataTableColumnHeader for sortable headers. selectable adds checkboxes; pageSize sets rows per page.",
    whenToUse: ["Lists of records people search, sort and select", "Admin and billing screens"],
    whenNotToUse: ["A small static table; use table", "Server-side paging for huge datasets without adapting the parts"],
    composesWith: ["table", "badge", "dropdown-menu"],
    a11y: [
      { keys: "Tab / Enter", action: "Sort buttons, checkboxes, pagination and the column menu are real controls" },
      { keys: "Screen readers", action: "aria-sort on headers; the result count is a polite live region" },
    ],
    customization: ["columns and cell renderers", "selectable and onSelectionChange", "searchable, columnToggle, pageSize", "stickyHeader with maxHeightClassName", "toolbar slot"],
  },
  source: {
    name: "shadcn/ui Data Table",
    url: "https://github.com/shadcn-ui/ui",
    license: "MIT",
    copyright: "Copyright (c) 2023 shadcn",
    modified: true,
  },
  version: "1.0.0",
  updated: "2026-09-30",
});
