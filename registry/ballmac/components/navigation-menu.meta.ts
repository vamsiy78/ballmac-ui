import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "navigation-menu",
  type: "registry:ui",
  title: "Navigation Menu",
  description:
    "A site navigation bar with flyout panels sharing one animated viewport that resizes to its content, with keyboard and pointer intent handling, built on Radix.",
  category: "navigation",
  tags: ["navigation", "header", "mega menu", "radix"],
  files: [{ path: "components/navigation-menu.tsx" }],
  dependencies: ["radix-ui", "lucide-react", "class-variance-authority"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "navigation-menu-demo", title: "Product menu", file: "navigation-menu-demo.tsx" },
    { name: "navigation-menu-states", title: "Without viewport", file: "navigation-menu-states.tsx" },
  ],
  ai: {
    summary:
      "Top-level triggers open content panels of links. Use navigationMenuTriggerStyle for plain top-level links.",
    whenToUse: ["Marketing site headers", "Docs navigation with grouped links"],
    whenNotToUse: ["An application command menu; use menubar", "A small overflow list; use dropdown-menu"],
    composesWith: ["button", "separator"],
    a11y: [
      { keys: "Enter / Space / ArrowDown", action: "Opens the focused panel" },
      { keys: "Tab", action: "Moves into the panel links" },
      { keys: "ArrowLeft / ArrowRight", action: "Moves between top-level items" },
      { keys: "Escape", action: "Closes the panel" },
    ],
    customization: ["viewport: shared or per-item", "indicator arrow", "content width per panel"],
  },
  source: {
    name: "shadcn/ui Navigation Menu",
    url: "https://github.com/shadcn-ui/ui",
    license: "MIT",
    copyright: "Copyright (c) 2023 shadcn",
    modified: true,
  },
  version: "1.0.0",
  updated: "2026-09-30",
});
