import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "button-group",
  type: "registry:ui",
  title: "Button Group",
  description:
    "Join adjacent actions into one compact control surface while retaining each button's visible keyboard focus and accessible name.",
  category: "primitives",
  tags: ["buttons", "actions", "toolbar"],
  files: [{ path: "components/button-group.tsx" }],
  dependencies: [],
  registryDependencies: ["shadcn:utils"],
  examples: [
    {
      name: "button-group-demo",
      title: "Document actions",
      file: "button-group-demo.tsx",
    },
    {
      name: "button-group-states",
      title: "Orientations",
      file: "button-group-states.tsx",
    },
  ],
  ai: {
    summary:
      "Groups closely related actions without turning them into a selection widget.",
    whenToUse: [
      "Adjacent document or editor actions",
      "Compact controls with one shared boundary",
    ],
    whenNotToUse: [
      "Mutually exclusive options; use toggle-group",
      "Unrelated actions",
    ],
    composesWith: ["button"],
    a11y: [
      { keys: "Tab", action: "Moves between each button in document order" },
      { keys: "Enter / Space", action: "Activates the focused button" },
    ],
    customization: [
      "orientation: horizontal | vertical",
      "button and text parts",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-30",
});
