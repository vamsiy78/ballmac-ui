import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "context-menu",
  type: "registry:ui",
  title: "Context Menu",
  description:
    "A right-click, long-press and Shift+F10 menu with submenus, checkbox and radio items, shortcut hints and a destructive style, built on Radix.",
  category: "primitives",
  tags: ["menu", "right-click", "overlay", "radix"],
  files: [{ path: "components/context-menu.tsx" }],
  dependencies: ["radix-ui", "lucide-react"],
  registryDependencies: ["shadcn:utils", "direction"],
  examples: [
    { name: "context-menu-demo", title: "File actions", file: "context-menu-demo.tsx" },
    { name: "context-menu-states", title: "View options", file: "context-menu-states.tsx" },
  ],
  ai: {
    summary:
      "Shows actions at the pointer on right-click or long-press. Keyboard users open it with Shift+F10 or the Menu key on a focusable trigger.",
    whenToUse: ["File, card and canvas actions", "Secondary actions that also exist elsewhere", "Desktop-style apps"],
    whenNotToUse: ["The only way to reach an action; menus must be discoverable, so also offer a dropdown-menu button", "Touch-first layouts without a visible trigger"],
    composesWith: ["dropdown-menu", "card"],
    a11y: [
      { keys: "Right-click / long-press", action: "Opens the menu at the pointer" },
      { keys: "Shift+F10 / Menu key", action: "Opens it from a focused trigger" },
      { keys: "ArrowUp / ArrowDown", action: "Moves between items" },
      { keys: "ArrowRight / ArrowLeft", action: "Opens and closes a submenu" },
      { keys: "Escape", action: "Closes the menu" },
    ],
    customization: ["destructive item style", "give the trigger tabIndex 0 and a label so it is keyboard reachable", "checkbox and radio items"],
  },
  source: {
    name: "shadcn/ui Context Menu",
    url: "https://github.com/shadcn-ui/ui",
    license: "MIT",
    copyright: "Copyright (c) 2023 shadcn",
    modified: true,
  },
  version: "1.0.0",
  updated: "2026-09-30",
});
