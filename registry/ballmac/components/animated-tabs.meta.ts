import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "animated-tabs",
  type: "registry:ui",
  title: "Animated Tabs",
  description:
    "Radix Tabs with a pill or underline indicator that slides between triggers on a spring, and panels that fade in. Keeps full keyboard support and ARIA; controlled or uncontrolled.",
  category: "navigation",
  tags: ["tabs", "segmented", "navigation", "indicator", "layout animation", "radix"],
  files: [{ path: "components/animated-tabs.tsx" }],
  dependencies: ["motion@^12", "radix-ui"],
  registryDependencies: ["shadcn:utils", "motion-presets"],
  examples: [
    { name: "animated-tabs-demo", title: "Pill with icons", file: "animated-tabs-demo.tsx" },
    { name: "animated-tabs-underline", title: "Underline", file: "animated-tabs-underline.tsx" },
  ],
  ai: {
    summary:
      "Same API as Radix Tabs: <AnimatedTabs defaultValue variant=\"pill\" | \"underline\"> with AnimatedTabsList, AnimatedTabsTrigger value and AnimatedTabsContent value. The indicator is a Motion layoutId element inside the active trigger.",
    whenToUse: [
      "Switching between views of the same object (overview, activity, settings)",
      "Settings pages with a few sections",
      "Pricing toggles such as monthly and yearly",
    ],
    whenNotToUse: [
      "Page-level navigation between routes (use links)",
      "More than about six options (use a select)",
      "Package-manager command tabs (use install-tabs)",
    ],
    composesWith: ["install-tabs", "code-block"],
    a11y: [
      { keys: "Left / Right", action: "Moves focus between tabs and selects them" },
      { keys: "Home / End", action: "Jumps to the first or last tab" },
      { keys: "Tab", action: "Moves from the tab list into the selected panel" },
    ],
    customization: [
      "variant: pill (default) | underline",
      "value / onValueChange for controlled use, defaultValue otherwise",
      "Icon-only triggers need aria-label",
      "Style parts via [data-slot=animated-tabs-indicator], -list, -trigger, -content",
      "Reduced motion: the indicator jumps and panels appear without a fade",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-29",
})
