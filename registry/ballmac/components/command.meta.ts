import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "command",
  type: "registry:ui",
  title: "Command",
  description:
    "A filterable command list on cmdk, inline or in a Cmd/Ctrl+K dialog, with groups, shortcuts, descriptions, loading state and page-safe scrolling.",
  category: "navigation",
  tags: ["command palette", "search", "cmdk", "keyboard"],
  files: [{ path: "components/command.tsx" }],
  dependencies: ["cmdk@^1", "radix-ui", "lucide-react"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "command-demo", title: "Inline menu", file: "command-demo.tsx" },
    { name: "command-dialog", title: "Cmd+K dialog", file: "command-dialog.tsx" },
  ],
  ai: {
    summary:
      "Compose Command, CommandInput, CommandList, CommandGroup and CommandItem. CommandDialog adds the modal and the ⌘K hotkey.",
    whenToUse: ["Command palettes and quick switchers", "Searchable action lists", "The list inside a combobox"],
    whenNotToUse: ["macOS-style launcher visuals; use spotlight-search", "A simple select; use select"],
    composesWith: ["popover", "dialog", "kbd"],
    a11y: [
      { keys: "Type", action: "Filters the list" },
      { keys: "ArrowUp / ArrowDown", action: "Moves the highlighted item" },
      { keys: "Enter", action: "Runs the highlighted item" },
      { keys: "Cmd/Ctrl+K", action: "Toggles CommandDialog" },
      { keys: "Escape", action: "Closes the dialog" },
    ],
    customization: ["hotkey key or false", "filter and shouldFilter from cmdk", "item description and selected check", "CommandLoading for async results"],
  },
  source: {
    name: "shadcn/ui Command",
    url: "https://github.com/shadcn-ui/ui",
    license: "MIT",
    copyright: "Copyright (c) 2023 shadcn",
    modified: true,
  },
  version: "1.0.0",
  updated: "2026-09-30",
});
