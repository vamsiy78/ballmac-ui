import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "data-grid",
  type: "registry:ui",
  title: "Data Grid",
  description:
    "A spreadsheet-style grid for thousands of rows: only visible rows are drawn, cells edit in place, headings sort and resize, columns pin, and it follows the ARIA grid keyboard pattern with undo and paste.",
  category: "data-display",
  tags: ["grid", "table", "spreadsheet", "virtualized", "editable", "sorting", "keyboard"],
  files: [{ path: "components/data-grid.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "badge", "checkbox", "skeleton", "state-view", "i18n", "direction"],
  examples: [
    { name: "data-grid-demo", title: "Editable tasks", file: "data-grid-demo.tsx" },
    { name: "data-grid-virtualized", title: "20,000 rows", file: "data-grid-virtualized.tsx" },
    { name: "data-grid-pinned", title: "Pinned columns", file: "data-grid-pinned.tsx" },
    { name: "data-grid-validation", title: "Validation", file: "data-grid-validation.tsx" },
    { name: "data-grid-controlled", title: "Controlled with bulk action", file: "data-grid-controlled.tsx" },
    { name: "data-grid-loading", title: "Loading", file: "data-grid-loading.tsx" },
    { name: "data-grid-empty", title: "No rows", file: "data-grid-empty.tsx" },
    { name: "data-grid-error", title: "Could not load", file: "data-grid-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "data-grid-loading", trigger: "state=\"loading\"", note: "Header and rows drawn as skeletons in the same columns, announced as loading; nothing can be edited." },
    { id: "empty", title: "No rows", example: "data-grid-empty", trigger: "state=\"empty\" or data={[]}", note: "A clear message that there are no rows yet; emptyState sets the copy and can add an action. A search with no match says so inside the grid." },
    { id: "error", title: "Could not load", example: "data-grid-error", trigger: "state=\"error\"", note: "An error with a Try again button (onRetry), announced as an alert." },
  ],
  ai: {
    summary:
      "Pass columns ({ id, header, accessorKey, type: text | number | boolean | select | date, editable, width, pin }) and rows with data or defaultData. Set height; rows outside it are not drawn. Listen with onDataChange or onCellChange.",
    whenToUse: [
      "Hundreds to tens of thousands of rows people edit like a spreadsheet",
      "Admin tools, inventories, budgets and review queues with keyboard-heavy users",
      "Wide data that needs pinned columns and resizable headings",
    ],
    whenNotToUse: [
      "A small read-only table; use table",
      "Search, filters, column menus and pagination out of the box; use data-table",
      "Formulas, merged cells or multi-sheet workbooks",
    ],
    composesWith: ["data-table", "badge", "state-view"],
    a11y: [
      { keys: "Arrow keys", action: "Move between cells (left and right swap in right-to-left)" },
      { keys: "Home / End / Ctrl+Home / Ctrl+End", action: "First and last cell of the row or the grid" },
      { keys: "Page Up / Page Down", action: "Move a screenful of rows" },
      { keys: "Enter / F2", action: "Edit the cell; Enter saves and moves down, Tab saves and moves right, Escape cancels" },
      { keys: "Type a character", action: "Start editing a text, number or date cell with that character" },
      { keys: "Space", action: "Toggle a checkbox cell or the row checkbox; Shift+Space selects the row" },
      { keys: "Delete", action: "Clear an editable cell" },
      { keys: "Ctrl+Z / Ctrl+Shift+Z", action: "Undo and redo, one edit or paste at a time" },
      { keys: "Ctrl+C / Ctrl+V", action: "Copy the cell; paste cells copied from a spreadsheet" },
      { keys: "Screen readers", action: "role=grid with aria-rowcount, aria-rowindex, aria-colindex and aria-sort, so virtualized rows keep their place; edits, undo and paste are announced" },
    ],
    customization: [
      "columns: type, width, pin, editable, options, validate, format, cell, parse, setValue",
      "density: compact | default | comfortable",
      "selectable with selectedRowIds, sorting with onSortingChange",
      "search to filter rows; footer for your own status text",
      "controlled data with onDataChange(rows, changes)",
    ],
  },
  version: "1.0.0",
  updated: "2026-10-19",
});
