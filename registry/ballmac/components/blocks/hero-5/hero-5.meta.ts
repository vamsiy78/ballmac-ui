import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "hero-5",
  type: "registry:block",
  title: "Hero 5: Mac app with opening laptop",
  description: "Centered hero for a Mac app: shiny highlighted headline, download button and requirements, over a laptop whose lid opens into view on a live app window.",
  category: "blocks",
  blockCategory: "hero",
  tags: ["hero", "mac app", "download", "laptop", "product"],
  files: [{ path: "components/blocks/hero-5/hero-5.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "gradient-text", "laptop-frame", "mac-window"],
  examples: [{ name: "hero-5-demo", title: "Default", file: "hero-5-demo.tsx" }],
  ai: {
    summary: "Top of a desktop-app landing page. Edit title, highlight, description, actions and requirements; pass `screen` (an image or your UI) to replace the sample app window.",
    whenToUse: ["Landing pages for Mac or desktop apps", "Products whose UI is the selling point"],
    whenNotToUse: ["Web SaaS without a desktop app (use hero-1)", "Mobile apps (compose phone-frame instead)"],
    composesWith: ["header-1", "features-4", "pricing-1", "template-ledger"],
    customization: ["title + highlight (shiny gradient)", "screen: any ReactNode laid out at 1280px wide and scaled"],
  },
  version: "1.0.0",
  updated: "2026-09-29",
})
