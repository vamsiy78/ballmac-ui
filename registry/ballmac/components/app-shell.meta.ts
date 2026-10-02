import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "app-shell",
  type: "registry:ui",
  title: "App Shell",
  description:
    "The frame of an application page: skip link, sticky header, sidebar that becomes a sheet on small screens, main area, optional aside and footer.",
  category: "layout",
  tags: ["layout", "dashboard", "sidebar", "landmarks"],
  files: [{ path: "components/app-shell.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "sheet", "i18n"],
  examples: [
    { name: "app-shell-demo", title: "Dashboard frame", file: "app-shell-demo.tsx" },
    { name: "app-shell-states", title: "Compact shell", file: "app-shell-states.tsx" },
  ],
  ai: {
    summary:
      "AppShell > AppShellSkipLink, AppShellHeader (with AppShellSidebarTrigger), AppShellSidebar, AppShellMain, AppShellAside, AppShellFooter. Sizes are CSS variables set by props.",
    whenToUse: ["Admin and dashboard pages", "Any page with a sidebar, a main column and optional details"],
    whenNotToUse: ["A collapsible icon-rail sidebar; use sidebar", "Marketing pages; use navbar"],
    composesWith: ["sidebar", "navbar", "sheet"],
    a11y: [
      { keys: "Tab", action: "The first stop is the skip link; it jumps to the main content" },
      { keys: "Screen readers", action: "Header, sidebar, main, aside and footer are landmarks" },
      { keys: "Escape", action: "Closes the mobile sidebar" },
    ],
    customization: ["headerHeight, sidebarWidth, asideWidth", "sticky panels scroll on their own", "hide the aside by leaving it out"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
});
