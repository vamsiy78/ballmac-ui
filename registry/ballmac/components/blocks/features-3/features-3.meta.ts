import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "features-3",
  type: "registry:block",
  title: "Features 3: integrations hub with beams",
  description: "Integrations section: heading, description and checked benefits beside a hub diagram where animated beams flow between your product and six tools.",
  category: "blocks",
  blockCategory: "features",
  tags: ["features", "integrations", "animated beam", "diagram"],
  files: [{ path: "components/blocks/features-3/features-3.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "animated-beam"],
  examples: [{ name: "features-3-demo", title: "Default", file: "features-3-demo.tsx" }],
  ai: {
    summary: "Explains integrations or data flow. Pass up to six `integrations` ({ name, icon }) and set hubIcon/hubLabel for your product.",
    whenToUse: ["Integrations or connectors pages", "Showing that a product sits between many tools (AI agents, automation, sync)"],
    whenNotToUse: ["Listing more than six integrations (use a logo grid)"],
    composesWith: ["hero-4", "features-1", "cta-2"],
    customization: ["eyebrow, title, description, points", "integrations, hubIcon, hubLabel"],
  },
  version: "1.0.0",
  updated: "2026-09-29",
})
