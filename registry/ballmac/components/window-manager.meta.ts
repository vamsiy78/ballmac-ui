import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "window-manager",
  type: "registry:ui",
  title: "Window Manager",
  description:
    "A desktop of real windows: focus raises, the title bar drags, edges and corners resize, double-click zooms, the yellow light tucks a window into a tray, and Alt plus arrow keys move and resize from the keyboard.",
  category: "macos",
  tags: ["window manager", "drag", "resize", "desktop", "macos"],
  files: [{ path: "components/window-manager.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils", "mac-window", "i18n"],
  examples: [
    { name: "window-manager-demo", title: "Three apps on a desktop", file: "window-manager-demo.tsx" },
    { name: "window-manager-controlled", title: "Open and close windows", file: "window-manager-controlled.tsx" },
  ],
  ai: {
    summary:
      "<WindowManager windows={[{ id, title, content, x, y, width, height, minWidth, minHeight }]} onClose>background</WindowManager>. Add or remove entries to open or close windows. Children render behind the windows.",
    whenToUse: ["Interactive OS-style demos", "Multi-panel tools that need freely arranged windows"],
    whenNotToUse: ["Fixed split layouts (resizable)", "Dialogs (dialog)"],
    composesWith: ["mac-window", "desktop-icons", "dock", "sheet-dialog"],
    a11y: [
      { keys: "Alt+Arrow", action: "Moves the focused window" },
      { keys: "Alt+Shift+Arrow", action: "Resizes it" },
      { keys: "Ctrl/Cmd+W and M", action: "Close and minimize" },
      { keys: "Screen readers", action: "Each window is a labelled group; minimized windows are restorable from a named list" },
      { keys: "Reduced motion", action: "Windows appear and minimize without scaling" },
    ],
    customization: ["windows", "onClose", "minWidth and minHeight", "children as the desktop"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
