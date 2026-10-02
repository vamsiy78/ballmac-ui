import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "number-ticker",
  type: "registry:ui",
  title: "Number Ticker",
  description:
    "Counts up to a number when it scrolls into view, with locale-aware formatting for currency, percentages and decimals.",
  category: "motion",
  tags: ["animation", "counter", "stats", "motion"],
  files: [{ path: "components/number-ticker.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils", "motion-presets", "i18n"],
  examples: [
    { name: "number-ticker-demo", title: "Default", file: "number-ticker-demo.tsx" },
    { name: "number-ticker-currency", title: "Currency", file: "number-ticker-currency.tsx" },
  ],
  ai: {
    summary: "Animated number for stats and KPIs. Respects reduced motion by showing the final value immediately.",
    whenToUse: ["Stat sections on landing pages", "Dashboard KPIs that load in"],
    whenNotToUse: ["Numbers that update every second (animate a live value instead)", "Prices users need to read instantly"],
    composesWith: ["text-reveal", "badge"],
    customization: ["format accepts any Intl.NumberFormat options", "locale defaults to en-US so server and browser render identical text; pass your locale explicitly", "duration and delay in seconds"],
  },
  version: "1.0.1",
  updated: "2026-09-28",
})
