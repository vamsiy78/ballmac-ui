import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "finder-window",
  type: "registry:ui",
  title: "Finder Window",
  description:
    "A working mini Finder: sidebar shortcuts, back and forward history, icon and list views, search, click, shift and command selection, keyboard navigation and a path bar, on a macOS window.",
  category: "macos",
  tags: ["finder", "files", "macos", "window", "browser"],
  files: [{ path: "components/finder-window.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "mac-window", "mac-icons", "i18n"],
  examples: [
    { name: "finder-window-demo", title: "Home folder", file: "finder-window-demo.tsx" },
    { name: "finder-window-list", title: "List view", file: "finder-window-list.tsx" },
  ],
  ai: {
    summary:
      "<FinderWindow root={tree} sidebar defaultFolder view onOpenFile onSelectionChange />. root is a FinderNode tree (folder, file or drive). Double-click or Return opens; Cmd+Up goes to the parent folder.",
    whenToUse: ["Product demos and docs that show a file system", "Mac-style apps"],
    whenNotToUse: ["A real file manager for your app (file-browser)", "A single window frame (mac-window)"],
    composesWith: ["mac-window", "toolbar", "desktop-icons", "mac-context-menu"],
    a11y: [
      { keys: "Arrow keys", action: "Move the selection; Shift extends it" },
      { keys: "Enter / Cmd+Down", action: "Opens the item" },
      { keys: "Cmd+Up", action: "Opens the parent folder" },
      { keys: "Screen readers", action: "A multi-select listbox named by the folder; the path bar and item count are announced" },
    ],
    customization: ["view: icons | list", "sidebar sections", "defaultFolder", "onOpenFile"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
