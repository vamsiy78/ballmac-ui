import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "shortcut-hint",
  type: "registry:ui",
  title: "Shortcut Hint",
  description:
    "A compact accessible keycap sequence paired with the action it performs.",
  category: "feedback",
  tags: ["keyboard", "shortcut", "kbd"],
  files: [
    {
      path: "components/shortcut-hint.tsx",
    },
  ],
  dependencies: [],
  registryDependencies: ["shadcn:utils"],
  examples: [
    {
      name: "shortcut-hint-demo",
      title: "Overview",
      file: "shortcut-hint-demo.tsx",
    },
    {
      name: "shortcut-hint-states",
      title: "States and variants",
      file: "shortcut-hint-states.tsx",
    },
  ],
  ai: {
    summary:
      "A compact accessible keycap sequence paired with the action it performs.",
    whenToUse: [
      "Label a command in a menu",
      "Teach an optional keyboard shortcut",
    ],
    whenNotToUse: ["Use kbd for an isolated key"],
    composesWith: ["kbd", "spotlight-search"],
    a11y: [
      {
        keys: "None",
        action: "Full shortcut meaning is in the accessible name",
      },
    ],
    customization: ["Compact keycaps", "Action label and key sequence"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
})
