import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "hero-6",
  type: "registry:block",
  title: "Hero 6: gradient mesh with floating cards",
  description: "Centered hero over a slowly drifting colour mesh, with gradient headline words and product cards that bob and follow the pointer. Cards stack below the buttons on phones.",
  category: "blocks",
  blockCategory: "hero",
  tags: ["hero", "gradient", "mesh", "parallax", "floating cards", "saas"],
  files: [{ path: "components/blocks/hero-6/hero-6.tsx" }],
  dependencies: ["lucide-react", "motion@^12"],
  registryDependencies: ["shadcn:utils", "badge", "button", "gradient-text", "sparkline"],
  examples: [
    { name: "hero-6-demo", title: "Default", file: "hero-6-demo.tsx" },
    { name: "hero-6-custom", title: "Custom cards", file: "hero-6-custom.tsx" },
  ],
  ai: {
    summary: "A bold, friendly landing hero. Edit eyebrow, title, highlight (the gradient words), description, actions and highlights; pass `cards` to replace the floating cards.",
    whenToUse: ["Consumer and prosumer SaaS landing pages", "Launches that want a memorable first screen"],
    whenNotToUse: ["Dense developer tools (use hero-2)", "Pages that must stay completely static"],
    composesWith: ["header-1", "logo-cloud-1", "features-2", "pricing-1"],
    a11y: [{ keys: "Pointer only", action: "The parallax and bobbing are decorative; they stop for reduced motion and on touch" }],
    customization: ["cards: wrap each card in <Hero6Float depth bob delay className=positions> to place it", "The mesh uses --chart-1, --chart-3 and --chart-5, so it follows your theme"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
