import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "header-1",
  type: "registry:block",
  title: "Header 1: sticky with mobile menu",
  description:
    "Sticky site header with brand, main links, sign-in and primary action, and an accessible mobile menu that closes on Escape or link tap.",
  category: "blocks",
  blockCategory: "header",
  tags: ["header", "navbar", "navigation", "mobile menu"],
  files: [{ path: "components/blocks/header-1/header-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button"],
  examples: [{ name: "header-1-demo", title: "Default", file: "header-1-demo.tsx" }],
  ai: {
    summary: "The top navigation bar for a marketing site. Pass links and the two actions; it handles the mobile menu.",
    whenToUse: ["Marketing sites and landing pages", "Docs sites with a few top-level sections"],
    whenNotToUse: ["Apps with deep navigation (use a sidebar)"],
    composesWith: ["hero-1", "hero-2", "footer-1"],
    a11y: [
      { keys: "Enter / Space on the menu button", action: "Opens or closes the mobile menu" },
      { keys: "Escape", action: "Closes the mobile menu" },
    ],
    customization: ["brand, brandHref, links, secondaryAction, primaryAction props", "sticky: false for a static header"],
  },
  version: "1.0.0",
  updated: "2026-09-28",
})
