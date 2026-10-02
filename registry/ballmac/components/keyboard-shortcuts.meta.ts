import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "keyboard-shortcuts",
  type: "registry:ui",
  title: "Keyboard Shortcuts",
  description:
    "A searchable shortcut cheat sheet, inline or in a dialog opened by pressing ?, with Command or Ctrl keys chosen for the viewer's platform and spoken key names.",
  category: "developer",
  tags: ["keyboard", "shortcuts", "hotkeys", "help", "dialog"],
  files: [{ path: "components/keyboard-shortcuts.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "dialog", "kbd", "i18n"],
  examples: [
    { name: "keyboard-shortcuts-demo", title: "Searchable cheat sheet", file: "keyboard-shortcuts-demo.tsx" },
    { name: "keyboard-shortcuts-dialog", title: "Dialog opened with ?", file: "keyboard-shortcuts-dialog.tsx" },
  ],
  ai: {
    summary:
      "groups is [{ title, shortcuts: [{ label, keys, sequence?, description? }] }]. Use 'Mod' for Cmd on Mac and Ctrl elsewhere. <KeyboardShortcutsDialog hotkey='?'> opens from anywhere outside a text field. platform='auto' corrects after hydration.",
    whenToUse: ["A help overlay for apps with many shortcuts", "Docs pages that list hotkeys"],
    whenNotToUse: ["A single hint beside a button (shortcut-hint)", "Binding the shortcuts themselves; this only displays them"],
    composesWith: ["kbd", "shortcut-hint", "command-bar", "dialog"],
    a11y: [
      { keys: "?", action: "Opens the dialog when focus is not in a text field" },
      { keys: "Escape", action: "Closes the dialog" },
      { keys: "Screen readers", action: "Keys read as 'Command plus K', sequences as 'G then I'; the filtered count is announced" },
    ],
    customization: ["platform", "columns", "searchable", "hotkey (or null)", "sequence shortcuts"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
