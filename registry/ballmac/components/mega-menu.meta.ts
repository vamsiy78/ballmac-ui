import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "mega-menu",
  type: "registry:ui",
  title: "Mega Menu",
  description:
    "A data-driven header menu with wide panels of grouped, described links, an optional featured card, and an accordion list for small screens.",
  category: "navigation",
  tags: ["navigation", "dropdown", "header", "radix"],
  files: [{ path: "components/mega-menu.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "navigation-menu"],
  examples: [
    { name: "mega-menu-demo", title: "Product menu", file: "mega-menu-demo.tsx" },
    { name: "mega-menu-states", title: "Mobile list", file: "mega-menu-states.tsx" },
  ],
  ai: {
    summary:
      "Pass items: a plain link ({label, href}) or a panel ({label, columns, featured}). MegaMenuMobileList renders the same data for the mobile menu.",
    whenToUse: ["Sites with many products or solutions", "Headers that need descriptions beside links"],
    whenNotToUse: ["A handful of plain links; use navbar", "Application commands; use menubar"],
    composesWith: ["navbar", "navigation-menu"],
    a11y: [
      { keys: "Enter / Space / ArrowDown", action: "Opens the focused panel" },
      { keys: "ArrowLeft / ArrowRight", action: "Moves between top-level items" },
      { keys: "Tab", action: "Enters the panel links" },
      { keys: "Escape", action: "Closes the panel" },
    ],
    customization: ["columns with titles", "featured card with media and cta", "badge on links", "viewportAlign start | center"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
});
