import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "bullet-chart",
  type: "registry:ui",
  title: "Bullet Chart",
  description:
    "Stephen Few's bullet chart: a bar for the value, a mark for the target, three shades behind for poor, fair and good, and a sentence saying whether the goal was met. Many measures in a small space, server-rendered.",
  category: "data-display",
  tags: ["bullet chart", "kpi", "target", "progress", "gauge", "chart", "goals", "okr"],
  files: [{ path: "components/bullet-chart.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "bullet-chart-demo", title: "Quarterly targets", file: "bullet-chart-demo.tsx" },
    { name: "bullet-chart-lower", title: "Lower is better", file: "bullet-chart-lower.tsx" },
  ],
  ai: {
    summary:
      "items is [{ id, label, value, target?, max?, ranges?: [poorEnd, fairEnd], note?, lowerIsBetter? }]. format(value). Each item reads as a meter and says Target met, Close to target (within 85%) or Behind target. No client code: it renders on the server.",
    whenToUse: ["Comparing several measures to their goals in a small space", "KPIs, SLAs and budgets where the target matters more than the trend"],
    whenNotToUse: ["A single value with no goal; use progress", "A trend; use sparkline or chart-line", "Proportions of a whole; use treemap or chart-pie"],
    composesWith: ["stat-card", "kpi-row", "slo-1", "chart-frame"],
    a11y: [
      { keys: "Screen readers", action: "Each row is a meter reading '84 against a target of 90. Close to target'" },
      { keys: "Words", action: "The standing is written ('Behind target') with an icon; the shades and the mark are decoration" },
      { keys: "Right-to-left", action: "Bars and marks start from the right edge" },
    ],
    customization: ["ranges for the three shades", "target and max", "lowerIsBetter for times and costs", "format"],
  },
  statesNone: "A presentational chart: you pass the numbers in, so it has nothing of its own to load or fail.",
  version: "1.0.0",
  updated: "2026-10-24",
})
