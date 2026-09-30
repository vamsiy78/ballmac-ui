import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "scroll-area",
  type: "registry:ui",
  title: "Scroll Area",
  description:
    "A focusable, named scroll region with theme-aware custom thumb and native scrolling behavior for long lists and documents.",
  category: "layout",
  tags: ["scroll", "overflow", "region", "radix"],
  files: [{ path: "components/scroll-area.tsx" }],
  dependencies: ["radix-ui"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    {
      name: "scroll-area-demo",
      title: "Recent activity",
      file: "scroll-area-demo.tsx",
    },
    {
      name: "scroll-area-states",
      title: "Horizontal gallery",
      file: "scroll-area-states.tsx",
    },
  ],
  ai: {
    summary:
      "Constrains long content in an accessible keyboard-scrollable region without changing native scroll behavior.",
    whenToUse: ["Activity feeds and long lists", "Constrained side panels"],
    whenNotToUse: [
      "Short content that can fit naturally",
      "The main page scroll",
    ],
    composesWith: ["activity-feed"],
    a11y: [
      { keys: "Tab", action: "Focuses the named scroll region" },
      {
        keys: "Arrow keys / Page Up / Page Down",
        action: "Scrolls the focused region",
      },
    ],
    customization: [
      "vertical and horizontal scrollbar",
      "accessible label",
      "viewport height",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-30",
});
