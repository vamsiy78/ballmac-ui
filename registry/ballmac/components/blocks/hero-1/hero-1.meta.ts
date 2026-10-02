import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "hero-1",
  type: "registry:block",
  title: "Hero 1: split with product visual",
  description:
    "Split hero: badge, word-by-word headline, two calls to action and proof points on the left, a live product summary card on the right, over an animated grid.",
  category: "blocks",
  blockCategory: "hero",
  tags: ["hero", "landing", "saas", "split"],
  files: [{ path: "components/blocks/hero-1/hero-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "animated-grid", "badge", "button", "number-ticker", "text-reveal", "media"],
  examples: [{ name: "hero-1-demo", title: "Default", file: "hero-1-demo.tsx" }],
  ai: {
    summary: "The top section of a SaaS or product landing page. Edit the props for copy and swap HeroVisual for your own product screenshot or component.",
    whenToUse: ["Landing pages with a product to show", "Launch pages that need a clear primary action"],
    whenNotToUse: ["Developer tools where the install command is the hero (use hero-2)", "AI products where a live prompt sells best (use hero-3)"],
    composesWith: ["header-1", "features-1", "cta-1"],
    customization: ["eyebrow, title, description, primaryAction, secondaryAction, highlights props", "Replace HeroVisual with an image or live component"],
  },
  version: "1.0.0",
  updated: "2026-09-28",
})
