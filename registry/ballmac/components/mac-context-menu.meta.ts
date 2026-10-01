import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "mac-context-menu",
  type: "registry:ui",
  title: "Mac Context Menu",
  description:
    "A right-click menu styled like macOS: frosted panel, accent-color highlight, key equivalents, checkmarks, submenus and a red destructive item, on Radix for full keyboard support.",
  category: "macos",
  tags: ["context menu", "macos", "right click", "menu", "shortcuts"],
  files: [{ path: "components/mac-context-menu.tsx" }],
  dependencies: ["radix-ui", "lucide-react"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "mac-context-menu-demo", title: "File menu with submenu", file: "mac-context-menu-demo.tsx" },
    { name: "mac-context-menu-view", title: "Checkmarks and radio items", file: "mac-context-menu-view.tsx" },
  ],
  ai: {
    summary:
      "Compose <MacContextMenu><MacContextMenuTrigger/><MacContextMenuContent> with MacContextMenuItem (icon, shortcut, destructive), CheckboxItem, RadioGroup/RadioItem, Label, Separator and Sub parts. Shift+F10 and long-press also open it.",
    whenToUse: ["Desktop-like apps and file managers", "Anywhere you want the macOS look"],
    whenNotToUse: ["Standard product UI (context-menu)", "Click-opened menus (dropdown-menu)"],
    composesWith: ["finder-window", "desktop-icons", "context-menu"],
    a11y: [
      { keys: "Shift+F10 / ContextMenu key", action: "Opens the menu on the focused trigger" },
      { keys: "ArrowUp / ArrowDown", action: "Moves through items; ArrowRight opens a submenu" },
      { keys: "Escape", action: "Closes" },
    ],
    customization: ["shortcut and icon per item", "destructive", "accent via --mac-accent"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
