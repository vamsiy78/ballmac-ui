import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "menu-bar",
  type: "registry:ui",
  title: "Menu Bar",
  description:
    "A translucent macOS menu bar on Radix Menubar: a bold app menu, menus with key equivalents, submenus and checkmarks, a status area with icon buttons and a hydration-safe live clock.",
  category: "macos",
  tags: ["menubar", "menu", "macos", "navigation", "keyboard shortcuts", "clock", "status bar"],
  files: [{ path: "components/menu-bar.tsx" }],
  dependencies: ["radix-ui", "lucide-react"],
  registryDependencies: ["shadcn:utils"],
  examples: [{ name: "menu-bar-demo", title: "Desktop menu bar", file: "menu-bar-demo.tsx" }],
  ai: {
    summary:
      "<MenuBar> holds <MenuBarMenu value><MenuBarTrigger/><MenuBarContent>items</MenuBarContent></MenuBarMenu> (Radix Menubar parts with Mac styling) followed by <MenuBarStatus> with <MenuBarStatusItem aria-label> icon buttons and <MenuBarClock />. Use variant=\"app\" on the app-name trigger and <MenuBarShortcut> for key equivalents.",
    whenToUse: [
      "A Mac desktop mockup or product hero where the app's menus should really open",
      "A web app that wants desktop-style menus with keyboard navigation (File, Edit, View)",
      "Status bars that pair a few icon buttons with a clock",
    ],
    whenNotToUse: [
      "Site navigation for a marketing page (use a header with links)",
      "A single action menu on a button (use a dropdown menu)",
    ],
    composesWith: ["mac-window", "dock", "dynamic-island"],
    a11y: [
      { keys: "Tab", action: "Focuses the menu bar (one stop), then the status buttons" },
      { keys: "ArrowLeft / ArrowRight", action: "Moves between menus, also while one is open" },
      { keys: "Enter / Space / ArrowDown", action: "Opens the focused menu" },
      { keys: "ArrowUp / ArrowDown, typeahead", action: "Moves between items" },
      { keys: "Escape", action: "Closes the menu and returns focus to its trigger" },
    ],
    customization: [
      "MenuBarTrigger variant: default | app (bold)",
      "MenuBarContent / MenuBarSubContent portal: false keeps menus inside a mockup container",
      "MenuBarItem inset and variant=\"destructive\"; highlighted items use the --ring color like the macOS accent",
      "MenuBarClock: locale (default en-US), format (Intl options), value for a fixed time",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-29",
})
