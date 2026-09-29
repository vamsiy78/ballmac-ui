import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "dock",
  type: "registry:ui",
  title: "Dock",
  description:
    "A macOS-style dock whose icons grow with spring physics as the pointer approaches and push their neighbors apart. Labels, running dots, a launch bounce and arrow-key navigation included.",
  category: "macos",
  featured: true,
  tags: ["dock", "macos", "magnification", "toolbar", "navigation", "motion", "app launcher"],
  files: [{ path: "components/dock.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "dock-demo", title: "App dock", file: "dock-demo.tsx" },
    { name: "dock-vertical", title: "Vertical", file: "dock-vertical.tsx" },
  ],
  ai: {
    summary:
      "<Dock> is a role=toolbar row (or column with orientation=\"vertical\") of <DockItem label icon /> buttons with cursor-proximity magnification; <DockSeparator /> draws the divider. Style each tile through DockItem's className (gradients, colors); icons are sized to about half the tile.",
    whenToUse: [
      "An app-launcher or quick-links bar on a Mac-flavored landing page or product hero",
      "A floating navigation bar for a portfolio or dashboard with a handful of destinations",
      "Showing off the apps or integrations a product ships with",
    ],
    whenNotToUse: [
      "Primary navigation with many text links (use a header or sidebar)",
      "More than about 12 items, or anywhere it would need to scroll horizontally",
    ],
    composesWith: ["mac-window", "menu-bar", "dynamic-island"],
    a11y: [
      { keys: "Tab", action: "Moves focus into the dock (one tab stop) and out again" },
      { keys: "ArrowLeft / ArrowRight (ArrowUp / ArrowDown when vertical)", action: "Moves between items; the focused item magnifies and shows its label" },
      { keys: "Home / End", action: "Jumps to the first or last item" },
      { keys: "Enter / Space", action: "Activates the focused item" },
    ],
    customization: [
      "size: resting item size in px (default 48); magnification: size under the pointer (default 76); distance: reach in px (default 150)",
      "orientation: horizontal | vertical",
      "DockItem: label, icon, active (running dot, also announced), bounce (launch bounce on click), className for the tile, containerClassName for the wrapper (e.g. max-sm:hidden)",
      "Under reduced motion the dock does not magnify or bounce; items brighten on hover and focus instead",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-29",
})
