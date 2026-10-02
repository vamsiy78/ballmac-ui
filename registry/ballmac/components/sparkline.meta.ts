import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "sparkline",
  type: "registry:ui",
  title: "Sparkline",
  description:
    "A lightweight accessible SVG trend line with a marked latest value and no chart dependency.",
  category: "data-display",
  tags: ["chart", "trend", "data"],
  files: [{ path: "components/sparkline.tsx" }],
  dependencies: [],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "sparkline-demo", title: "Overview", file: "sparkline-demo.tsx" },
    {
      name: "sparkline-states",
      title: "States and variants",
      file: "sparkline-states.tsx",
    },
  ],
  ai: {
    summary:
      "A lightweight accessible SVG trend line with a marked latest value and no chart dependency.",
    whenToUse: ["Show a small trend beside a metric"],
    whenNotToUse: ["Use a full chart for axes and detailed inspection"],
    composesWith: ["stat-card"],
    a11y: [
      {
        keys: "None",
        action: "Trend description is announced as an image",
      },
    ],
    customization: ["Content, layout, and token-based className styling"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
})
