import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "item",
  type: "registry:ui",
  title: "Item",
  description:
    "A flexible list row with media, title, description and actions, in outline, muted and plain variants, that can also render as a link.",
  category: "data-display",
  tags: ["list", "row", "media", "layout"],
  files: [{ path: "components/item.tsx" }],
  dependencies: ["radix-ui", "class-variance-authority"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "item-demo", title: "Settings rows", file: "item-demo.tsx" },
    { name: "item-states", title: "Files and footer", file: "item-states.tsx" },
  ],
  ai: {
    summary:
      "Compose rows from ItemMedia, ItemContent, ItemTitle, ItemDescription and ItemActions. asChild styles a link or button as a whole-row target.",
    whenToUse: ["Settings, connected accounts and file lists", "Rows with an icon or avatar, text and an action"],
    whenNotToUse: ["Tabular data with columns; use table", "Long card layouts; use card"],
    composesWith: ["badge", "avatar", "button"],
    a11y: [
      { keys: "Tab / Enter", action: "When rendered as a link or button, behaves as one" },
    ],
    customization: ["variant: default | outline | muted", "size: default | sm", "ItemMedia variant: default | icon | image"],
  },
  source: {
    name: "shadcn/ui Item",
    url: "https://github.com/shadcn-ui/ui",
    license: "MIT",
    copyright: "Copyright (c) 2023 shadcn",
    modified: true,
  },
  version: "1.0.0",
  updated: "2026-09-30",
});
