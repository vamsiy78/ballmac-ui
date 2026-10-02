import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "navbar",
  type: "registry:ui",
  title: "Navbar",
  description:
    "A responsive site header that gains a border and shadow on scroll, can hide while scrolling down, and turns its links into a sheet menu on small screens.",
  category: "navigation",
  tags: ["header", "navigation", "sticky", "responsive"],
  files: [{ path: "components/navbar.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "sheet", "scroll", "i18n"],
  examples: [
    { name: "navbar-demo", title: "Marketing header", file: "navbar-demo.tsx" },
    { name: "navbar-states", title: "Hide on scroll", file: "navbar-states.tsx" },
  ],
  ai: {
    summary:
      "Compose Navbar with NavbarBrand, NavbarLinks/NavbarLink (active sets aria-current), NavbarActions and NavbarMobileMenu with NavbarMobileLink.",
    whenToUse: ["Marketing and docs site headers", "Headers that should get out of the way on long pages"],
    whenNotToUse: ["Application chrome with a sidebar; use app-shell", "Wide dropdown panels; add mega-menu"],
    composesWith: ["mega-menu", "button", "sheet"],
    a11y: [
      { keys: "Tab", action: "Moves through brand, links, actions and the menu button" },
      { keys: "Enter / Space", action: "Opens the mobile menu; Escape closes it and returns focus" },
      { keys: "Screen readers", action: "Links are in a labelled navigation landmark; the current page has aria-current" },
    ],
    customization: ["sticky and hideOnScroll", "border: scrolled | always | never", "scrollContainer for headers inside panels", "mobile menu label"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
});
