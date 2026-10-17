import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "desktop-8",
  type: "registry:block",
  title: "Desktop 8: keyboard shortcuts editor",
  description:
    "A shortcuts editor: commands grouped and searchable by name or by pressing the keys, a recorder on each row, a warning with Replace when keys are taken, reset per command, Restore defaults, and each platform's notation.",
  category: "blocks",
  blockCategory: "desktop",
  tags: ["desktop", "keyboard", "shortcuts", "hotkeys", "keybindings", "preferences", "tauri", "electron", "macos", "windows", "feel"],
  files: [{ path: "components/blocks/desktop-8/desktop-8.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "app-window", "button", "feel-presets", "shortcut"],
  examples: [
    { name: "desktop-8-demo", title: "macOS", file: "desktop-8-demo.tsx" },
    { name: "desktop-8-windows", title: "Windows, with changes", file: "desktop-8-windows.tsx" },
  ],
  statesNone: "Shortcuts are local settings that apply as they change: nothing to load, submit or fail.",
  ai: {
    summary:
      "A keybindings editor. <Desktop8 commands={[{ id, label, group, shortcut: 'Mod+Shift+N' }]} values={overrides} onValuesChange={(overrides) => save(overrides)} />. values holds only what differs from the defaults ('' means removed). Conflicts are found with normalizeShortcut, so Ctrl and Mod count as one key on Windows.",
    whenToUse: ["The Keyboard Shortcuts pane or window of a desktop or power-user web app", "Letting people remap commands that a command palette also runs"],
    whenNotToUse: ["A read-only cheat sheet (use keyboard-shortcuts)", "One global shortcut (use the recorder in desktop-1)"],
    composesWith: ["desktop-1", "keyboard-shortcuts", "command", "app-window"],
    a11y: [
      { keys: "Enter on a shortcut", action: "Starts recording; the next combination is saved, Escape cancels, Delete removes it" },
      { keys: "By keys", action: "Press a combination to find the command using it; Escape returns to search by name" },
      { keys: "Conflicts", action: "Announced as an alert with Cancel and Replace; every change is announced politely" },
    ],
    customization: ["feel: 'macos' | 'windows' (defaults to the page's feel); frame={false} to place it in a settings pane", "Pass the effective shortcuts to your hotkey hook or Tauri's global-shortcut plugin (Mod → CommandOrControl)"],
  },
  version: "1.0.0",
  updated: "2026-10-17",
})
