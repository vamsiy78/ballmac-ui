import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "shortcut",
  type: "registry:lib",
  title: "Shortcut",
  description: "Keyboard shortcuts as plain strings (\"Mod+Shift+K\"): written as ⇧⌘K on a Mac and Ctrl+Shift+K elsewhere, recorded from key presses, and normalized so conflicts can be found.",
  category: "foundation",
  tags: ["keyboard", "shortcut", "hotkey", "macos", "windows", "feel"],
  files: [{ path: "lib/shortcut.ts" }],
  dependencies: [],
  registryDependencies: ["feel-presets"],
  ai: {
    summary: "formatShortcut('Mod+Shift+K', feel) → '⇧⌘K' or 'Ctrl+Shift+K'. shortcutFromEvent(event, isMac) records a key press (null while only modifiers are down). normalizeShortcut(s, feel) gives one spelling per combination for comparing.",
    whenToUse: ["Showing shortcuts in menus, tooltips and settings in each platform's notation", "Recording or comparing user-chosen shortcuts"],
    whenNotToUse: ["Listening for shortcuts at runtime: use your framework's hotkey hook or Tauri's global-shortcut plugin, and pass them these strings"],
  },
  version: "1.0.0",
  updated: "2026-10-17",
})
