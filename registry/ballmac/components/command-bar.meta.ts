import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "command-bar",
  type: "registry:ui",
  title: "Command Bar",
  description:
    "A command palette with pages: a search-field style trigger, grouped commands, drill-in pages with a breadcrumb, Backspace to go back and a footer of key hints.",
  category: "navigation",
  tags: ["command palette", "search", "pages", "keyboard"],
  files: [{ path: "components/command-bar.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "command", "kbd"],
  examples: [
    { name: "command-bar-demo", title: "Global commands", file: "command-bar-demo.tsx" },
    { name: "command-bar-states", title: "Own trigger", file: "command-bar-states.tsx" },
  ],
  ai: {
    summary:
      "groups: {heading, items:[{id,label,icon,shortcut,keywords,onSelect,pages}]}. An item with pages opens a second page. hotkey toggles with Cmd/Ctrl; trigger={false} hides the button.",
    whenToUse: ["Global quick actions and navigation", "Apps with many commands and sub-choices"],
    whenNotToUse: ["A macOS-style launcher; use spotlight-search", "Choosing one value in a form; use combobox"],
    composesWith: ["command", "kbd", "dialog"],
    a11y: [
      { keys: "Cmd/Ctrl+K", action: "Toggles the bar" },
      { keys: "Type", action: "Filters commands" },
      { keys: "ArrowUp / ArrowDown / Enter", action: "Moves and runs" },
      { keys: "Backspace on an empty field", action: "Goes back one page" },
      { keys: "Escape", action: "Closes" },
    ],
    customization: ["hotkey", "trigger text or false", "pages for nested choices", "controlled open"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
});
