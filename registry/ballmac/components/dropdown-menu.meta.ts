import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "dropdown-menu",
  type: "registry:ui",
  title: "Dropdown Menu",
  description:
    "An action menu on a trigger with checkbox and radio items, submenus, shortcut hints and destructive rows, built on Radix for full keyboard and typeahead support.",
  category: "primitives",
  tags: ["menu", "overlay", "actions", "radix"],
  files: [{ path: "components/dropdown-menu.tsx" }],
  dependencies: ["radix-ui", "lucide-react"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "dropdown-menu-demo", title: "Account menu", file: "dropdown-menu-demo.tsx" },
    { name: "dropdown-menu-states", title: "Radio choices", file: "dropdown-menu-states.tsx" },
  ],
  ai: {
    summary:
      "Opens a menu of actions from a button. Supports groups, labels, checkbox and radio items, nested submenus, shortcuts and a destructive style.",
    whenToUse: ["Account, row and overflow (…) actions", "Sort and view preferences with radio items", "Menus with a submenu or checked options"],
    whenNotToUse: ["Choosing a form value; use select or combobox", "Right-click menus; use context-menu", "A persistent app menu bar; use menubar"],
    composesWith: ["button", "kbd"],
    a11y: [
      { keys: "Enter / Space / ArrowDown", action: "Opens the menu from the trigger" },
      { keys: "ArrowUp / ArrowDown", action: "Moves between items; Home and End jump" },
      { keys: "Type a letter", action: "Jumps to the next item starting with it" },
      { keys: "ArrowRight / ArrowLeft", action: "Opens and closes a submenu" },
      { keys: "Escape", action: "Closes and returns focus to the trigger" },
    ],
    customization: ["destructive item style", "inset alignment for mixed icon rows", "alignment and side offset on the content", "controlled open state"],
  },
  source: {
    name: "shadcn/ui Dropdown Menu",
    url: "https://github.com/shadcn-ui/ui",
    license: "MIT",
    copyright: "Copyright (c) 2023 shadcn",
    modified: true,
  },
  version: "1.0.0",
  updated: "2026-09-30",
});
