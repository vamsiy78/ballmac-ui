import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "split-view",
  type: "registry:ui",
  title: "Split View",
  description:
    "A master and detail layout with a keyboard-resizable divider. Panes sit side by side in wide containers and stack with a Back button in narrow ones.",
  category: "layout",
  tags: ["master detail", "split", "list", "responsive"],
  files: [{ path: "components/split-view.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "split-view-demo", title: "Mail layout", file: "split-view-demo.tsx" },
    { name: "split-view-states", title: "Stacked on narrow", file: "split-view-states.tsx" },
  ],
  ai: {
    summary:
      "SplitView > SplitViewList, SplitViewDetail and SplitViewBack. Use useSplitView().setDetailOpen(true) when an item is chosen. Responds to its own width, not the screen's.",
    whenToUse: ["Mail, files and settings screens", "Any list that opens a detail"],
    whenNotToUse: ["User-arranged dock panels; use resizable", "Overlay details; use sheet or drawer"],
    composesWith: ["resizable", "scroll-area", "sidebar"],
    a11y: [
      { keys: "ArrowLeft / ArrowRight", action: "Resize the list from the divider; Shift for larger steps; Home and End for the limits" },
      { keys: "Tab", action: "Back button appears only when panes stack" },
      { keys: "Screen readers", action: "Panes are labelled regions; the divider is a separator with value bounds" },
    ],
    customization: ["listWidth, minListWidth, maxListWidth", "controlled detailOpen", "container-query breakpoint"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
});
