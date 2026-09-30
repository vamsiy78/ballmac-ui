import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "countdown",
  type: "registry:ui",
  title: "Countdown",
  description:
    "An SSR-safe timer with controlled or local seconds, pause support, and a completion announcement.",
  category: "feedback",
  tags: ["timer", "countdown", "time"],
  files: [
    {
      path: "components/countdown.tsx",
    },
  ],
  dependencies: [],
  registryDependencies: ["shadcn:utils"],
  examples: [
    {
      name: "countdown-demo",
      title: "Overview",
      file: "countdown-demo.tsx",
    },
    {
      name: "countdown-states",
      title: "States and variants",
      file: "countdown-states.tsx",
    },
  ],
  ai: {
    summary:
      "An SSR-safe timer with controlled or local seconds, pause support, and a completion announcement.",
    whenToUse: [
      "Show time until a short event",
      "Display a temporary offer or session limit",
    ],
    whenNotToUse: ["Use progress for work completion"],
    composesWith: ["progress-ring"],
    a11y: [
      {
        keys: "None",
        action: "Timer is labelled; completion is announced",
      },
    ],
    customization: [
      "Controlled or uncontrolled seconds",
      "Pause and completion callback",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-30",
})
