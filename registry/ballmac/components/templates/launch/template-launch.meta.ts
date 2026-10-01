import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "template-launch",
  type: "registry:block",
  title: "Launch page",
  description:
    "A complete product launch page: sticky header, split hero, bento features, two-tier pricing, FAQ, closing call to action and footer, installed as a route.",
  category: "templates",
  templateKind: "marketing",
  templatePages: [{ title: "Home", example: "template-launch-demo", path: "/launch" }],
  tags: ["template", "landing page", "launch", "saas", "marketing"],
  files: [{ path: "components/templates/launch/launch-page.tsx" }, { path: "app/launch/page.tsx" }],
  registryDependencies: ["cta-1", "faq-1", "features-1", "footer-1", "header-1", "hero-1", "pricing-1"],
  examples: [{ name: "template-launch-demo", title: "Launch page", file: "template-launch-demo.tsx" }],
  docs: "The page is at /launch. Edit components/ballmac/templates/launch/launch-page.tsx to change the copy and sections.",
  ai: {
    summary:
      "Installs a working /launch route built from Ballmac blocks. Change copy through each block's props in launch-page.tsx; move the route by moving app/launch/page.tsx.",
    whenToUse: ["A new SaaS or product landing page", "A starting point to customize section by section"],
    whenNotToUse: ["Adding one section to an existing page (install that block instead)"],
    composesWith: ["hero-2", "hero-3", "features-2"],
    customization: ["Reorder or swap blocks in LaunchPage", "Pass props to each block for your copy", "Rename the route folder app/launch"],
  },
  version: "1.0.0",
  updated: "2026-09-28",
})
