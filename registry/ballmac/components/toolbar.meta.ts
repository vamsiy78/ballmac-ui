import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "toolbar",
  type: "registry:ui",
  title: "Toolbar",
  description:
    "A frosted macOS toolbar with a title block, icon and labeled buttons, segmented view switches, an expanding search field, separators and spacers, built on Radix Toolbar so the whole bar is one tab stop.",
  category: "macos",
  tags: ["toolbar", "macos", "segmented", "buttons", "search"],
  files: [{ path: "components/toolbar.tsx" }],
  dependencies: ["radix-ui", "lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "toolbar-demo", title: "Document toolbar", file: "toolbar-demo.tsx" },
    { name: "toolbar-labeled", title: "Labeled buttons", file: "toolbar-labeled.tsx" },
  ],
  ai: {
    summary:
      "<Toolbar label title subtitle> with ToolbarButton (icon, labeled, pressed), ToolbarGroup, ToolbarSegmented + ToolbarSegment (single choice), ToolbarSeparator, ToolbarSpacer and ToolbarSearch. Arrow keys move between buttons.",
    whenToUse: ["Document and file-manager windows", "Editors with many commands"],
    whenNotToUse: ["Page navigation (navbar)", "One or two buttons (button-group)"],
    composesWith: ["mac-window", "finder-window", "button-group"],
    a11y: [
      { keys: "Tab", action: "Enters and leaves the toolbar as a single stop" },
      { keys: "ArrowLeft / ArrowRight", action: "Moves between buttons; Home and End jump to the ends" },
      { keys: "Screen readers", action: "Named by its label; pressed buttons use aria-pressed" },
    ],
    customization: ["labeled buttons", "segmented groups", "ToolbarSearch widths"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
