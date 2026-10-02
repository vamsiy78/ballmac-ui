import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "thinking-indicator",
  type: "registry:ui",
  title: "Thinking Indicator",
  description:
    "A waiting indicator for assistants with four animations (dots, bars, wave, shimmer), labels that take turns, an optional timer and one calm announcement for screen readers.",
  category: "ai",
  tags: ["ai", "loading", "thinking", "typing", "status"],
  files: [{ path: "components/thinking-indicator.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "thinking-indicator-demo", title: "Cycling labels with a timer", file: "thinking-indicator-demo.tsx" },
    { name: "thinking-indicator-variants", title: "Four animations", file: "thinking-indicator-variants.tsx" },
  ],
  ai: {
    summary:
      "Show it while a reply has not started. variant picks the animation, label takes a string or an array of phrases, showTimer adds a clock. Screen readers hear statusLabel once instead of every phrase.",
    whenToUse: [
      "The gap between sending a message and the first streamed token",
      "A long agent task where the phrase changes with the current step",
    ],
    whenNotToUse: [
      "Showing the model's reasoning text; use reasoning-disclosure",
      "Progress with a known end; use progress or agent-plan",
    ],
    composesWith: ["ai-message", "reasoning-disclosure", "ai-orb"],
    a11y: [
      { keys: "Screen readers", action: "role=status announces statusLabel once; cycling phrases and the timer are visual only" },
      { keys: "Reduced motion", action: "Animations stop, phrases cross-fade in place" },
    ],
    customization: ["variant: dots | bars | wave | shimmer", "label as string or string[] with interval", "showTimer and elapsed", "size: sm | default"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
})
