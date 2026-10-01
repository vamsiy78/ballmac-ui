import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "hero-7",
  type: "registry:block",
  title: "Hero 7: product screen that tilts into view",
  description: "Centered hero with a browser frame that leans back and settles flat as you scroll. Ships a sample dashboard drawn with theme tokens; swap in a screenshot or your own UI.",
  category: "blocks",
  blockCategory: "hero",
  tags: ["hero", "product", "screenshot", "scroll", "browser", "dashboard"],
  files: [{ path: "components/blocks/hero-7/hero-7.tsx" }],
  dependencies: ["lucide-react", "motion@^12"],
  registryDependencies: ["shadcn:utils", "badge", "browser-frame", "button"],
  examples: [
    { name: "hero-7-demo", title: "Default", file: "hero-7-demo.tsx" },
    { name: "hero-7-custom", title: "Your own screen", file: "hero-7-custom.tsx" },
  ],
  ai: {
    summary: "A landing hero that lets the product do the talking. Edit eyebrow, title, description and actions; pass `screenshot` ({ src, alt }) or `screen` (any UI laid out 1180px wide) to replace the sample dashboard.",
    whenToUse: ["Products with a strong UI", "Pages where a first-screen screenshot sells the product"],
    whenNotToUse: ["Developer tools led by a command (use hero-2)", "Products with no visual UI"],
    composesWith: ["header-1", "logo-cloud-1", "features-1", "testimonials-1"],
    a11y: [{ keys: "Scroll", action: "The tilt is decorative and is turned off for reduced motion; the sample screen is hidden from assistive technology" }],
    customization: ["tilt: starting lean in degrees (0 for none)", "url: address shown in the browser frame", "screen: any ReactNode, scaled to fit"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
