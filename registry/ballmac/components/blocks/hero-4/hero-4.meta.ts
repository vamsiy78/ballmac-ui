import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "hero-4",
  type: "registry:block",
  title: "Hero 4: split with interactive globe",
  description: "Split hero with a live pill, headline, two actions and headline stats beside a large draggable WebGL globe marking your regions.",
  category: "blocks",
  blockCategory: "hero",
  tags: ["hero", "globe", "infrastructure", "landing", "3d"],
  files: [{ path: "components/blocks/hero-4/hero-4.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "globe", "media"],
  examples: [{ name: "hero-4-demo", title: "Default", file: "hero-4-demo.tsx" }],
  ai: {
    summary: "Top-of-page hero for global or infrastructure products. Edit announcement, title, description, actions, stats and globe markers ([lat, long]).",
    whenToUse: ["Infrastructure, hosting, edge or global-reach products", "Companies with offices or users worldwide"],
    whenNotToUse: ["Products where geography doesn't matter (use hero-1 or hero-2)"],
    composesWith: ["header-1", "logo-cloud-1", "features-3"],
    customization: ["markers: [{ location: [lat, long], size }]", "stats: up to three { value, label }"],
  },
  version: "1.0.0",
  updated: "2026-09-29",
})
