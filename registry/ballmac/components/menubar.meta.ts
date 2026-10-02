import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "menubar",
  type: "registry:ui",
  title: "Menubar",
  description:
    "A horizontal application menu bar with roving focus across menus, submenus, shortcuts, checkbox and radio items, built on Radix.",
  category: "navigation",
  tags: ["menu", "application", "desktop", "radix"],
  files: [{ path: "components/menubar.tsx" }],
  dependencies: ["radix-ui", "lucide-react"],
  registryDependencies: ["shadcn:utils", "direction"],
  examples: [
    { name: "menubar-demo", title: "Editor menu", file: "menubar-demo.tsx" },
    { name: "menubar-states", title: "Preferences", file: "menubar-states.tsx" },
  ],
  ai: {
    summary:
      "A File / Edit / View style bar. Left and Right move between menus, Down opens one, and hovering across open menus switches them.",
    whenToUse: ["Editors, dashboards and tools with many commands", "Desktop-style web apps"],
    whenNotToUse: ["Website navigation with links; use navigation-menu", "The macOS system menu bar mockup; use menu-bar"],
    composesWith: ["kbd", "dropdown-menu"],
    a11y: [
      { keys: "ArrowLeft / ArrowRight", action: "Moves focus between menu triggers" },
      { keys: "ArrowDown / Enter / Space", action: "Opens the focused menu" },
      { keys: "ArrowUp / ArrowDown", action: "Moves within a menu" },
      { keys: "Escape", action: "Closes the menu and returns to the bar" },
    ],
    customization: ["value on each menu for a default open menu", "shortcut hints", "checkbox and radio items"],
  },
  source: {
    name: "shadcn/ui Menubar",
    url: "https://github.com/shadcn-ui/ui",
    license: "MIT",
    copyright: "Copyright (c) 2023 shadcn",
    modified: true,
  },
  version: "1.0.0",
  updated: "2026-09-30",
});
