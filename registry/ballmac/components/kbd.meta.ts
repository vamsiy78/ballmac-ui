import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "kbd",
  type: "registry:ui",
  title: "Kbd",
  description:
    "Keyboard key and shortcut display built on the semantic <kbd> element, in three sizes, with KbdGroup for combinations like ⌘ ⇧ K. Adapts inside tooltips.",
  category: "primitives",
  tags: ["kbd", "keyboard", "shortcut", "hotkey"],
  files: [{ path: "components/kbd.tsx" }],
  dependencies: ["class-variance-authority"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "kbd-demo", title: "Default", file: "kbd-demo.tsx" },
  ],
  ai: {
    summary:
      "Displays a key or shortcut. Use Kbd for each key and KbdGroup for keys pressed together; it restyles itself for the dark tooltip surface automatically.",
    whenToUse: ["Shortcut hints in menus, tooltips and command palettes", "Documentation of keyboard controls", "Search inputs that show a ⌘ K hint"],
    whenNotToUse: ["Inline code or commands (use code)", "Buttons that trigger the shortcut (use button)"],
    composesWith: ["tooltip", "button", "input"],
    a11y: [],
    customization: ["size: sm | default | lg", "Use symbols (⌘ ⇧ ⌥ ⌃ ↵) or words (Ctrl, Enter); add aria-label on KbdGroup if symbols need spelling out"],
  },
  version: "1.0.0",
  updated: "2026-09-28",
})
