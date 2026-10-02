import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "animated-number-flow",
  type: "registry:ui",
  title: "Animated Number Flow",
  description:
    "A number whose digits roll like an odometer to the new value, with locale and Intl formatting for currency, percent and compact notation, and widths that animate as digits come and go.",
  category: "motion",
  tags: ["number", "odometer", "counter", "currency", "format"],
  files: [{ path: "components/animated-number-flow.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "animated-number-flow-demo", title: "Price with plan toggle", file: "animated-number-flow-demo.tsx" },
    { name: "animated-number-flow-formats", title: "Currency, percent, compact", file: "animated-number-flow-formats.tsx" },
  ],
  ai: {
    summary:
      "<AnimatedNumberFlow value format locale prefix suffix announce fade />. Change value and each digit rolls to its new place. Uses Intl.NumberFormat with a fixed default locale so server and browser agree.",
    whenToUse: ["Prices, balances and stats that change on interaction", "Live metrics"],
    whenNotToUse: ["A one-time count-up on scroll (number-ticker)"],
    composesWith: ["number-ticker", "stat-card", "kpi-row"],
    a11y: [
      { keys: "Screen readers", action: "The formatted number is read as text; announce adds a polite live region" },
      { keys: "Reduced motion", action: "The value changes instantly" },
    ],
    customization: ["format (Intl options)", "locale", "prefix and suffix", "fade", "announce"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
