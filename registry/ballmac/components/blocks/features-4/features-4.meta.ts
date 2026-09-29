import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "features-4",
  type: "registry:block",
  title: "Features 4: Mac app bento",
  description: "Bento feature grid for a desktop app: menu bar companion, keyboard shortcuts, privacy, iCloud sync and notifications, each with a small live visual.",
  category: "blocks",
  blockCategory: "features",
  tags: ["features", "bento", "mac app", "desktop"],
  files: [{ path: "components/blocks/features-4/features-4.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "bento-grid", "kbd"],
  examples: [{ name: "features-4-demo", title: "Default", file: "features-4-demo.tsx" }],
  ai: {
    summary: "Feature section for Mac or desktop apps. Edit eyebrow/title/description props; change the five BentoCards and their visuals in the source to match your features.",
    whenToUse: ["Desktop or Mac app landing pages", "Showing five features with visuals instead of icons"],
    whenNotToUse: ["Web SaaS feature lists (use features-1 or features-2)"],
    composesWith: ["hero-5", "pricing-1", "testimonials-1"],
    customization: ["eyebrow, title, description props", "BentoCard title, description, icon and background visual per feature"],
  },
  version: "1.0.0",
  updated: "2026-09-29",
})
