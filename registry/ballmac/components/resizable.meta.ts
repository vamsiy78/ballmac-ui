import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "resizable",
  type: "registry:ui",
  title: "Resizable",
  description:
    "Draggable split panels with keyboard resizing, nested horizontal and vertical groups, collapsible panels, and a grip that appears on hover and focus.",
  category: "layout",
  tags: ["panels", "split", "layout", "resize"],
  files: [{ path: "components/resizable.tsx" }],
  dependencies: ["react-resizable-panels@^3", "lucide-react"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "resizable-demo", title: "Editor layout", file: "resizable-demo.tsx" },
    { name: "resizable-states", title: "Collapsible panel", file: "resizable-states.tsx" },
  ],
  ai: {
    summary:
      "ResizablePanelGroup with ResizablePanel children separated by ResizableHandle. Sizes are percentages. Give each handle a label.",
    whenToUse: ["IDE, email and file-manager layouts", "User-adjustable sidebars and consoles"],
    whenNotToUse: ["Fixed layouts; use plain CSS grid", "App navigation; use sidebar"],
    composesWith: ["scroll-area", "separator"],
    a11y: [
      { keys: "ArrowLeft / ArrowRight (ArrowUp / ArrowDown)", action: "Resize by 10% steps from the focused handle" },
      { keys: "Home / End", action: "Move to minimum or maximum" },
      { keys: "Enter", action: "Collapse or expand a collapsible neighbor" },
    ],
    customization: ["direction", "defaultSize, minSize, maxSize", "collapsible panels", "autoSaveId to remember sizes", "withHandle grip"],
  },
  source: {
    name: "shadcn/ui Resizable",
    url: "https://github.com/shadcn-ui/ui",
    license: "MIT",
    copyright: "Copyright (c) 2023 shadcn",
    modified: true,
  },
  version: "1.0.0",
  updated: "2026-09-30",
});
