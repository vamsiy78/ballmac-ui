import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "desktop-icons",
  type: "registry:ui",
  title: "Desktop Icons",
  description:
    "A macOS desktop of icons: box-select with the pointer, drag to move with snapping to grid cells, double-click or Return to open, arrow keys to move focus and Alt plus arrows to move an icon.",
  category: "macos",
  tags: ["desktop", "icons", "drag", "selection", "macos"],
  files: [{ path: "components/desktop-icons.tsx" }],
  dependencies: [],
  registryDependencies: ["shadcn:utils", "mac-icons", "i18n"],
  examples: [
    { name: "desktop-icons-demo", title: "Desktop on a wallpaper", file: "desktop-icons-demo.tsx" },
    { name: "desktop-icons-window", title: "Icons behind windows", file: "desktop-icons-window.tsx" },
  ],
  ai: {
    summary:
      "<DesktopIcons items={[{ id, name, kind, col, row }]} onItemsChange onOpen cell />. Positions are grid cells. Icons that land on an occupied cell move to the nearest free one.",
    whenToUse: ["Desktop-style demos and playgrounds", "Launch surfaces with draggable shortcuts"],
    whenNotToUse: ["Ordinary file lists (file-browser)"],
    composesWith: ["window-manager", "finder-window", "mac-icons", "mac-context-menu"],
    a11y: [
      { keys: "Arrow keys", action: "Move focus to the nearest icon in that direction" },
      { keys: "Alt+Arrow", action: "Moves the focused icon one cell" },
      { keys: "Enter", action: "Opens" },
      { keys: "Space", action: "Toggles selection" },
    ],
    customization: ["cell size", "items and positions", "onItemsChange"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
