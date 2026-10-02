import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "loading-dots",
  type: "registry:ui",
  title: "Loading Dots",
  description:
    "A compact loading status with staggered token-colored dots that stop for reduced motion.",
  category: "feedback",
  tags: ["loading", "status", "animation"],
  files: [
    {
      path: "components/loading-dots.tsx",
    },
  ],
  dependencies: [],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    {
      name: "loading-dots-demo",
      title: "Overview",
      file: "loading-dots-demo.tsx",
    },
    {
      name: "loading-dots-states",
      title: "States and variants",
      file: "loading-dots-states.tsx",
    },
  ],
  ai: {
    summary:
      "A compact loading status with staggered token-colored dots that stop for reduced motion.",
    whenToUse: [
      "Indicate short pending work",
      "Pair a compact loader with a button label",
    ],
    whenNotToUse: ["Use skeleton for a full content placeholder"],
    composesWith: ["spinner", "button"],
    a11y: [
      {
        keys: "None",
        action: "Accessible status label",
      },
    ],
    customization: ["size: sm | default | lg", "Status label"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
})
