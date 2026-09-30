import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "sidebar",
  type: "registry:ui",
  title: "Sidebar",
  description:
    "An app sidebar with icon-rail collapse, floating and inset variants, grouped menus with badges and sub-items, a mobile sheet, tooltips when collapsed and a Cmd/Ctrl+B shortcut.",
  category: "navigation",
  tags: ["navigation", "layout", "app shell", "collapsible"],
  files: [{ path: "components/sidebar.tsx" }],
  dependencies: ["class-variance-authority", "radix-ui", "lucide-react"],
  registryDependencies: ["shadcn:utils", "sheet", "tooltip"],
  examples: [
    { name: "sidebar-demo", title: "Workspace navigation", file: "sidebar-demo.tsx" },
    { name: "sidebar-states", title: "Icon rail", file: "sidebar-states.tsx" },
  ],
  ai: {
    summary:
      "SidebarProvider wraps Sidebar and SidebarInset. Menu entries use SidebarMenuButton with href and isActive. SidebarTrigger toggles it.",
    whenToUse: ["Application navigation with many sections", "Dashboards and admin tools"],
    whenNotToUse: ["Marketing site headers; use navigation-menu", "Two or three links; use tabs"],
    composesWith: ["sheet", "tooltip", "button", "avatar"],
    a11y: [
      { keys: "Cmd/Ctrl+B", action: "Toggles the sidebar" },
      { keys: "Tab", action: "Moves through links; the current page has aria-current" },
      { keys: "Mobile", action: "Opens as a named dialog sheet; Escape closes" },
    ],
    customization: ["side, variant, collapsible", "defaultOpen or controlled open", "SidebarMenuBadge and sub-menus", "width via --sidebar-width"],
  },
  source: {
    name: "shadcn/ui Sidebar",
    url: "https://github.com/shadcn-ui/ui",
    license: "MIT",
    copyright: "Copyright (c) 2023 shadcn",
    modified: true,
  },
  version: "1.0.0",
  updated: "2026-09-30",
});
