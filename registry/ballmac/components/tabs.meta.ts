import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "tabs",
  type: "registry:ui",
  title: "Tabs",
  description:
    "Keyboard-navigable content tabs with quiet pill or underline styling and a clear selected state in both themes.",
  category: "navigation",
  tags: ["tabs", "views", "navigation", "radix"],
  files: [{ path: "components/tabs.tsx" }],
  dependencies: ["radix-ui"],
  registryDependencies: ["shadcn:utils", "direction"],
  examples: [
    { name: "tabs-demo", title: "Workspace dashboard", file: "tabs-demo.tsx" },
    { name: "tabs-states", title: "Underline tabs", file: "tabs-states.tsx" },
  ],
  ai: {
    summary:
      "Switches between a small number of peer views while retaining Radix tablist semantics and roving focus.",
    whenToUse: [
      "Related panels within one page",
      "Compact dashboards and detail views",
    ],
    whenNotToUse: [
      "Steps in a workflow; use progress-steps",
      "Site navigation to separate pages",
    ],
    composesWith: ["card", "badge"],
    a11y: [
      { keys: "Tab", action: "Focuses the active tab" },
      { keys: "Arrow keys / Home / End", action: "Moves among tabs" },
      { keys: "Tab again", action: "Moves into the active panel" },
    ],
    customization: [
      "variant: pills | underline",
      "controlled or uncontrolled value",
      "orientation",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-30",
});
