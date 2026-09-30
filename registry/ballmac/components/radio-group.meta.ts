import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "radio-group",
  type: "registry:ui",
  title: "Radio Group",
  description:
    "Single-choice radios with optional full-card labels, descriptions, and large pointer targets around Radix keyboard navigation.",
  category: "forms",
  tags: ["choice", "form", "radio", "radix"],
  files: [{ path: "components/radio-group.tsx" }],
  dependencies: ["radix-ui", "lucide-react"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    {
      name: "radio-group-demo",
      title: "Delivery frequency",
      file: "radio-group-demo.tsx",
    },
    {
      name: "radio-group-states",
      title: "Compact choices",
      file: "radio-group-states.tsx",
    },
  ],
  ai: {
    summary:
      "Choose exactly one option in a form; use descriptive card labels when choices need context.",
    whenToUse: [
      "A few mutually exclusive preferences",
      "Pricing or delivery options with explanations",
    ],
    whenNotToUse: [
      "Many options; use select",
      "Multiple selections; use checkbox or toggle-group",
    ],
    composesWith: ["label"],
    a11y: [
      { keys: "Tab", action: "Enters the radio group" },
      { keys: "Arrow keys", action: "Moves and selects among enabled choices" },
      { keys: "Space", action: "Selects the focused choice" },
    ],
    customization: [
      "controlled or uncontrolled value",
      "card or compact radio labels",
      "disabled options",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-30",
});
