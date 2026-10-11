import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "hover-card",
  type: "registry:ui",
  title: "Hover Card",
  description:
    "A compact preview of a linked resource that appears on hover or keyboard focus without hiding essential information.",
  category: "data-display",
  tags: ["preview", "link", "radix"],
  files: [{ path: "components/hover-card.tsx" }],
  dependencies: ["radix-ui"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    {
      name: "hover-card-demo",
      title: "Project preview",
      file: "hover-card-demo.tsx",
    },
    {
      name: "hover-card-states",
      title: "People preview",
      file: "hover-card-states.tsx",
    },
  ],
  ai: {
    summary:
      "Adds optional context to a link for pointer and keyboard users; the link remains useful without the preview.",
    whenToUse: [
      "Preview a project or profile without navigating",
      "Show supplementary link metadata",
    ],
    whenNotToUse: [
      "Interactive actions inside a panel; use popover",
      "Information required to complete a task",
    ],
    composesWith: ["avatar", "badge"],
    a11y: [
      {
        keys: "Tab",
        action: "Focuses the linked trigger and opens its preview",
      },
      { keys: "Escape", action: "Dismisses the preview" },
    ],
    customization: ["side and alignment", "open and close delays"],
  },
  version: "1.0.1",
  updated: "2026-10-11",
  changelog: [
    { version: "1.0.1", date: "2026-10-11", note: "Control heights, menu and sidebar row sizes, press dimming and frosted surfaces follow the platform feel tokens (--bm-control-h, --bm-menu-*, --bm-sidebar-*, --bm-material-*). Unchanged without a feel." },
    { version: "1.0.0", date: "2026-09-30", note: "First release." },
  ],
});
