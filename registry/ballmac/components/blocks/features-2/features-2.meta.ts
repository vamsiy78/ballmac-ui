import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "features-2",
  type: "registry:block",
  title: "Features 2: numbered icon grid",
  description: "Six features in a hairline grid of numbered cells with an icon, title and one sentence each. Pass your own features array.",
  category: "blocks",
  blockCategory: "features",
  tags: ["features", "grid", "icons", "landing"],
  files: [{ path: "components/blocks/features-2/features-2.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils"],
  examples: [{ name: "features-2-demo", title: "Default", file: "features-2-demo.tsx" }],
  ai: {
    summary: "A calm, scannable grid for 3–9 features. Pass features=[{ icon, title, body }] with lucide icons.",
    whenToUse: ["Listing several product benefits evenly", "Developer tools and libraries"],
    whenNotToUse: ["Two or three features that need visuals (use features-1)"],
    composesWith: ["hero-2", "cta-1"],
    customization: ["features: { icon, title, body }[]", "eyebrow and title props"],
  },
  version: "1.0.0",
  updated: "2026-09-28",
})
