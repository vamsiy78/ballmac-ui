import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "sheet",
  type: "registry:ui",
  title: "Sheet",
  description:
    "A modal panel that slides from any edge, with header, scrollable body and footer parts, a grab handle on bottom sheets, and safe-area padding.",
  category: "primitives",
  tags: ["overlay", "panel", "drawer", "dialog", "radix"],
  files: [{ path: "components/sheet.tsx" }],
  dependencies: ["radix-ui", "lucide-react", "class-variance-authority"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "sheet-demo", title: "Edit project", file: "sheet-demo.tsx" },
    { name: "sheet-states", title: "Four edges", file: "sheet-states.tsx" },
  ],
  ai: {
    summary:
      "A dialog attached to a screen edge. Use side right for settings panels, bottom for mobile actions, left for navigation.",
    whenToUse: ["Edit forms that keep page context visible", "Filters and settings panels", "Mobile navigation drawers"],
    whenNotToUse: ["Short confirmations; use alert-dialog", "Small anchored panels; use popover"],
    composesWith: ["button", "input", "label"],
    a11y: [
      { keys: "Enter / Space", action: "Opens from the trigger" },
      { keys: "Tab / Shift+Tab", action: "Cycles focus inside the sheet" },
      { keys: "Escape", action: "Closes and returns focus to the trigger" },
    ],
    customization: ["side: right | left | top | bottom", "showCloseButton", "SheetBody scrolls long content"],
  },
  source: {
    name: "shadcn/ui Sheet",
    url: "https://github.com/shadcn-ui/ui",
    license: "MIT",
    copyright: "Copyright (c) 2023 shadcn",
    modified: true,
  },
  version: "1.0.0",
  updated: "2026-09-30",
});
