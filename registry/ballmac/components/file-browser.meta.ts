import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "file-browser",
  type: "registry:ui",
  title: "File Browser",
  description:
    "A file manager for apps: breadcrumb folders, search, sortable columns, row checkboxes with select-all, a bulk-action bar, list and grid views and full keyboard control.",
  category: "data-display",
  tags: ["files", "browser", "table", "upload", "folders"],
  files: [{ path: "components/file-browser.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n", "direction"],
  examples: [
    { name: "file-browser-demo", title: "Project files", file: "file-browser-demo.tsx" },
    { name: "file-browser-grid", title: "Grid view", file: "file-browser-grid.tsx" },
  ],
  ai: {
    summary:
      "<FileBrowser entries rootLabel view onOpenFile onDelete onDownload />. entries is a FileEntry tree. Sort by name, modified or size (aria-sort). Space selects, Enter opens, arrow keys move.",
    whenToUse: ["Drive-style pages inside an app", "Choosing files for download or deletion"],
    whenNotToUse: ["A Mac-styled window (finder-window)", "Plain tables (data-table)"],
    composesWith: ["data-table", "breadcrumb", "file-dropzone"],
    a11y: [
      { keys: "Arrow keys", action: "Move between rows or cards" },
      { keys: "Space", action: "Toggles selection" },
      { keys: "Enter", action: "Opens a folder or file" },
      { keys: "Screen readers", action: "Sort state, selection count and item count are announced" },
    ],
    customization: ["view", "rootLabel", "onDelete and onDownload", "sorting"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
