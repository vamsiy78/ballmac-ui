import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "desktop-2",
  type: "registry:block",
  title: "Desktop 2: menu bar and tray panel",
  description:
    "The panel of a menu bar app on macOS or a tray flyout on Windows: a clipboard history with search, pins, a pause switch, keyboard selection and Preferences and Quit, with loading, empty and error states.",
  category: "blocks",
  blockCategory: "desktop",
  tags: ["desktop", "menu bar", "tray", "status item", "popover", "clipboard", "tauri", "electron", "macos", "windows", "feel"],
  files: [{ path: "components/blocks/desktop-2/desktop-2.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "kbd", "skeleton", "state-view", "switch", "feel-presets"],
  examples: [
    { name: "desktop-2-demo", title: "macOS menu bar", file: "desktop-2-demo.tsx" },
    { name: "desktop-2-windows", title: "Windows tray", file: "desktop-2-windows.tsx" },
    { name: "desktop-2-loading", title: "Loading", file: "desktop-2-loading.tsx" },
    { name: "desktop-2-empty", title: "Nothing copied yet", file: "desktop-2-empty.tsx" },
    { name: "desktop-2-error", title: "Could not load", file: "desktop-2-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "desktop-2-loading", trigger: "state=\"loading\"", note: "Skeleton rows the shape of history items, announced as loading; search and Clear are disabled." },
    { id: "empty", title: "Nothing copied yet", example: "desktop-2-empty", trigger: "state=\"empty\"", note: "Explains that copied items will appear; emptyState sets the copy and can add an action." },
    { id: "error", title: "Could not load", example: "desktop-2-error", trigger: "state=\"error\"", note: "An alert with Try again (onRetry); Preferences and Quit still work." },
  ],
  ai: {
    summary:
      "A status-item app panel. <Desktop2 appName items={[{ id, text, kind: 'text' | 'link' | 'code' | 'color', source, time, pinned }]} onCopy onTogglePin onClear onOpenPreferences onQuit />. frame draws a menu bar slice (macOS) or taskbar (Windows) around it for marketing pages; frame={false} renders only the panel for the real tray window. Swap the list for your own content by forking the file: the header, search, listbox and footer are separate parts.",
    whenToUse: ["The popover of a macOS menu bar app or a Windows tray app built with Tauri or Electron", "Showing a menu bar utility on its landing page"],
    whenNotToUse: ["Command search across an app (use command or spotlight-search)", "A plain dropdown menu (use dropdown-menu)"],
    composesWith: ["desktop-1", "app-window", "feel-auto"],
    a11y: [
      { keys: "Up / Down in the search field", action: "Moves through the history (a combobox with a listbox); the item is announced" },
      { keys: "Enter", action: "Copies the selected item; \"Copied\" is announced" },
      { keys: "⌘P or Ctrl+P", action: "Pins or unpins the selected item" },
    ],
    customization: [
      "feel: 'macos' | 'windows' (defaults to the page's feel); macOS draws menu-style footer rows, Windows icon buttons",
      "paused + onPausedChange control the recording switch",
      "Tauri: open it with a tray icon (tray-icon feature) and a borderless, transparent window, then render frame={false}",
      "state, onRetry, emptyState and errorState as in every Ballmac block with states",
    ],
  },
  version: "1.0.0",
  updated: "2026-10-17",
})
