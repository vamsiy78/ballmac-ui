import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "app-shell-1",
  type: "registry:block",
  title: "App Shell 1: collapsible sidebar with command menu",
  description: "A product frame: workspace switcher, grouped navigation with badges that collapses to an icon rail, top bar with search, notifications and a ⌘K command menu, and a scrolling page slot. A drawer on phones.",
  category: "blocks",
  blockCategory: "app-shell",
  tags: ["app shell", "sidebar", "dashboard layout", "navigation", "command menu", "workspace"],
  files: [{ path: "components/blocks/app-shell-1/app-shell-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "avatar", "button", "command", "dropdown-menu", "kbd", "sheet"],
  examples: [
    { name: "app-shell-1-demo", title: "Default", file: "app-shell-1-demo.tsx" },
    { name: "app-shell-1-collapsed", title: "Collapsed, custom pages", file: "app-shell-1-collapsed.tsx" },
  ],
  ai: {
    summary: "The frame around an app. Pass nav=[{ label?, items: [{ id, label, icon?, badge? }] }], workspace, user and a children render function (page) => node; value / onValueChange control the open page.",
    whenToUse: ["Dashboards, admin tools and any multi-page product", "A realistic frame for demos and screenshots"],
    whenNotToUse: ["Marketing sites (use header-2)", "Single-screen tools"],
    composesWith: ["dashboard-1", "dashboard-2", "settings-1", "billing-1", "mail-1", "kanban-1"],
    a11y: [
      { keys: "Ctrl/⌘ + K", action: "Opens the command menu to jump to any page" },
      { keys: "Ctrl/⌘ + B", action: "Collapses or expands the sidebar" },
      { keys: "Tab", action: "A skip link jumps past the sidebar; the open page is marked aria-current=page" },
    ],
    customization: ["nav groups, workspace, workspaces, user", "children: (page) => node", "defaultCollapsed, height ('100svh' for a full-screen app)"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
