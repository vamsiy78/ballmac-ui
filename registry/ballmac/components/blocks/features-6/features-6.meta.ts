import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "features-6",
  type: "registry:block",
  title: "Features 6: tabbed showcase",
  description: "Pill tabs with a sliding indicator switch between feature panels: heading, checked points and link beside a product picture. Tabs scroll sideways on phones.",
  category: "blocks",
  blockCategory: "features",
  tags: ["features", "tabs", "showcase", "panels", "product"],
  files: [{ path: "components/blocks/features-6/features-6.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "animated-tabs", "badge", "media"],
  examples: [
    { name: "features-6-demo", title: "Default", file: "features-6-demo.tsx" },
    { name: "features-6-two", title: "Two tabs", file: "features-6-two.tsx" },
  ],
  ai: {
    summary: "A compact way to show several feature areas without a long scroll. Pass tabs=[{ value, label, icon?, title, description, points?, link?, visual }].",
    whenToUse: ["Four to six equal feature areas", "Pages that need to stay short"],
    whenNotToUse: ["A single story told in order (use features-5)"],
    composesWith: ["hero-6", "logo-cloud-1", "pricing-2", "cta-1"],
    a11y: [
      { keys: "Arrow Left / Right", action: "Moves between tabs and shows the panel" },
      { keys: "Tab", action: "Moves from the tab list into the panel" },
    ],
    customization: ["tabs: { value, label, icon?, title, description, points?, link?, visual }[]", "defaultValue: the tab selected first"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
