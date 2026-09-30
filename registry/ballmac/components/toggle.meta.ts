import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "toggle",
  type: "registry:ui",
  title: "Toggle",
  description:
    "A compact two-state action with distinct pressed styling, visible keyboard focus, and outline or filled variants.",
  category: "primitives",
  tags: ["toggle", "pressed", "toolbar", "radix"],
  files: [{ path: "components/toggle.tsx" }],
  dependencies: ["radix-ui"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "toggle-demo", title: "Pin a workspace", file: "toggle-demo.tsx" },
    {
      name: "toggle-states",
      title: "Sizes and states",
      file: "toggle-states.tsx",
    },
  ],
  ai: {
    summary:
      "An on/off action such as pinning or formatting that communicates its pressed state to assistive technology.",
    whenToUse: [
      "A toolbar action with persistent pressed state",
      "Favorite or pin control",
    ],
    whenNotToUse: [
      "Boolean form field; use switch",
      "Multiple related choices; use toggle-group",
    ],
    composesWith: ["button-group"],
    a11y: [
      { keys: "Tab", action: "Focuses the toggle" },
      { keys: "Enter / Space", action: "Changes pressed state" },
    ],
    customization: [
      "variant: default | outline",
      "size: sm | default | lg",
      "controlled or uncontrolled pressed state",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-30",
});
