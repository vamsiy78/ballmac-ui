import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "drawer",
  type: "registry:ui",
  title: "Drawer",
  description:
    "A swipe-to-dismiss panel from any edge on Vaul, with grab handle, header, scrollable body and footer, drag-safe inner content and reduced-motion handling.",
  category: "primitives",
  tags: ["overlay", "mobile", "bottom sheet", "vaul"],
  files: [{ path: "components/drawer.tsx" }],
  dependencies: ["vaul@^1"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "drawer-demo", title: "Order review", file: "drawer-demo.tsx" },
    { name: "drawer-states", title: "Four directions", file: "drawer-states.tsx" },
  ],
  ai: {
    summary:
      "Bottom drawers suit mobile actions; use direction left or right for side panels. Compose DrawerHeader, DrawerBody and DrawerFooter.",
    whenToUse: ["Mobile-first confirmations and pickers", "Panels users may want to flick away"],
    whenNotToUse: ["Desktop settings panels; use sheet", "Critical confirmations; use alert-dialog"],
    composesWith: ["button", "sheet"],
    a11y: [
      { keys: "Tab / Shift+Tab", action: "Cycles focus inside the drawer" },
      { keys: "Escape", action: "Closes and returns focus to the trigger" },
      { keys: "Drag / swipe", action: "Dismisses by gesture" },
    ],
    customization: ["direction", "snapPoints", "dismissible", "handle visibility"],
  },
  source: {
    name: "shadcn/ui Drawer",
    url: "https://github.com/shadcn-ui/ui",
    license: "MIT",
    copyright: "Copyright (c) 2023 shadcn",
    modified: true,
  },
  version: "1.0.0",
  updated: "2026-09-30",
});
