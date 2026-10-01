import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "stats-1",
  type: "registry:block",
  title: "Stats 1: headline metrics with trends",
  description: "Four large numbers in a hairline grid that count up on scroll, each with a change badge, a small trend line and one line of context. Heading and copy sit above.",
  category: "blocks",
  blockCategory: "stats",
  tags: ["stats", "metrics", "numbers", "social proof", "sparkline"],
  files: [{ path: "components/blocks/stats-1/stats-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "number-ticker", "sparkline"],
  examples: [
    { name: "stats-1-demo", title: "Default", file: "stats-1-demo.tsx" },
    { name: "stats-1-simple", title: "Numbers only", file: "stats-1-simple.tsx" },
  ],
  ai: {
    summary: "Social proof as numbers. Pass stats=[{ label, value, prefix?, suffix?, decimals?, delta?, trend?, trendLabel?, note? }].",
    whenToUse: ["Under a hero or logo cloud as proof", "Company and about pages"],
    whenNotToUse: ["Live product dashboards (use stat-card or kpi-row)", "Numbers you cannot back up"],
    composesWith: ["hero-7", "logo-cloud-1", "testimonials-2", "cta-1"],
    customization: ["stats: omit trend and delta for a plain numbers layout", "decimals controls the digits after the point; suffix can be %, k, M+ and so on"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
