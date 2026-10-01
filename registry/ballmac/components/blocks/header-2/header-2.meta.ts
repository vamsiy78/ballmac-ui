import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "header-2",
  type: "registry:block",
  title: "Header 2: mega menu with mobile sheet",
  description: "Sticky header with brand, a mega menu of grouped links and a featured card, sign-in and primary actions. On phones the same links open in a slide-in sheet with accordions.",
  category: "blocks",
  blockCategory: "header",
  tags: ["header", "navbar", "mega menu", "navigation", "sheet", "mobile"],
  files: [{ path: "components/blocks/header-2/header-2.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "mega-menu", "sheet"],
  examples: [
    { name: "header-2-demo", title: "Default", file: "header-2-demo.tsx" },
    { name: "header-2-simple", title: "Simple links", file: "header-2-simple.tsx" },
  ],
  ai: {
    summary: "A navigation header for products with many pages. Pass items (the same shape as mega-menu), brand, logo, secondaryAction and primaryAction.",
    whenToUse: ["Sites with several product areas", "Anything that outgrew four top-level links"],
    whenNotToUse: ["Simple sites with a few links (use header-1)"],
    composesWith: ["hero-6", "hero-7", "footer-2", "template-launch"],
    a11y: [
      { keys: "Arrow Left / Right", action: "Moves between menu triggers" },
      { keys: "Arrow Down / Enter", action: "Opens a panel" },
      { keys: "Escape", action: "Closes a panel or the mobile sheet and returns focus" },
    ],
    customization: ["items: MegaMenuItem[] (links, or panels with columns and a featured card)", "logo, brand, brandHref", "sticky: false for a static header"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
