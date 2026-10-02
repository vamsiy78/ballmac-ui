import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "toggle-group",
  type: "registry:ui",
  title: "Toggle Group",
  description:
    "A compact roving-focus selection group for one or several pressed options, with clear states and mobile-friendly sizing.",
  category: "primitives",
  tags: ["toggle", "selection", "toolbar", "radix"],
  files: [{ path: "components/toggle-group.tsx" }],
  dependencies: ["radix-ui"],
  registryDependencies: ["shadcn:utils", "direction"],
  examples: [
    {
      name: "toggle-group-demo",
      title: "View density",
      file: "toggle-group-demo.tsx",
    },
    {
      name: "toggle-group-states",
      title: "Multiple filters",
      file: "toggle-group-states.tsx",
    },
  ],
  ai: {
    summary:
      "Lets users choose one or multiple options from a short row while Radix handles roving focus.",
    whenToUse: [
      "View mode or density selector",
      "Formatting options that can coexist",
    ],
    whenNotToUse: [
      "Unrelated actions; use button-group",
      "A long list of options; use select",
    ],
    composesWith: ["button-group"],
    a11y: [
      { keys: "Tab", action: "Enters or exits the group" },
      { keys: "Arrow keys", action: "Moves focus between items" },
      { keys: "Enter / Space", action: "Selects the focused item" },
    ],
    customization: [
      "type: single | multiple",
      "variant: default | outline",
      "size: sm | default | lg",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-30",
});
