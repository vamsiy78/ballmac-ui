import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "launchpad",
  type: "registry:ui",
  title: "Launchpad",
  description:
    "The macOS Launchpad: a frosted full-area overlay with search, pages of app icons sized to fit, page dots, wheel and key paging, arrow-key focus across pages and Escape to close.",
  category: "macos",
  tags: ["launchpad", "apps", "grid", "overlay", "macos"],
  files: [{ path: "components/launchpad.tsx" }],
  dependencies: ["motion@^12", "lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n", "direction"],
  examples: [
    { name: "launchpad-demo", title: "Open launcher", file: "launchpad-demo.tsx" },
    { name: "launchpad-many", title: "Many apps and paging", file: "launchpad-many.tsx" },
  ],
  ai: {
    summary:
      "<Launchpad apps={[{ id, name, icon }]} open onClose onLaunch />. It fills its positioned parent. Pages, rows and columns are computed from the available size.",
    whenToUse: ["Mac desktop demos", "App launchers in dashboards"],
    whenNotToUse: ["Command palettes (command)", "Navigation menus"],
    composesWith: ["dock", "mac-icons", "spotlight-search"],
    a11y: [
      { keys: "Arrow keys", action: "Move between apps across pages" },
      { keys: "PageUp / PageDown", action: "Turn pages" },
      { keys: "Enter in search", action: "Launches the first match" },
      { keys: "Escape", action: "Closes" },
      { keys: "Reduced motion", action: "No zoom or blur on open" },
    ],
    customization: ["cellWidth and cellHeight", "label", "open / onClose"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
