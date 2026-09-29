import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "segmented-control",
  type: "registry:ui",
  title: "Segmented Control",
  description:
    "A macOS segmented control: mutually exclusive options with a selected pill that springs between segments and hairline dividers between unselected ones. A Radix radio group underneath.",
  category: "macos",
  tags: ["segmented control", "toggle group", "radio group", "tabs", "macos", "switcher", "form"],
  files: [{ path: "components/segmented-control.tsx" }],
  dependencies: ["motion@^12", "radix-ui", "class-variance-authority"],
  registryDependencies: ["shadcn:utils"],
  examples: [{ name: "segmented-control-demo", title: "Settings panel", file: "segmented-control-demo.tsx" }],
  ai: {
    summary:
      "<SegmentedControl aria-label value|defaultValue onValueChange size><SegmentedControlItem value>Label</SegmentedControlItem>…</SegmentedControl>. Exactly one segment is always selected. Icon-only items need aria-label; fullWidth stretches segments equally.",
    whenToUse: [
      "Switching a view mode or range (Day / Week / Month, List / Grid)",
      "A short, always-visible choice in settings (Light / Dark / Auto)",
      "Filtering one list by a few exclusive categories",
    ],
    whenNotToUse: [
      "Switching between panels of content with their own semantics (use tabs)",
      "More than about five options or long labels (use select)",
      "Options that can be combined (use checkboxes or a toggle group)",
    ],
    composesWith: ["mac-window"],
    a11y: [
      { keys: "Tab", action: "Focuses the selected segment (one tab stop)" },
      { keys: "ArrowLeft / ArrowRight", action: "Moves to and selects the previous or next segment, wrapping" },
      { keys: "Space", action: "Selects the focused segment" },
    ],
    customization: [
      "size: sm | default | lg",
      "fullWidth: stretch to the container with equal segments",
      "value / defaultValue / onValueChange: controlled or uncontrolled",
      "Parts: [data-slot=segmented-control-indicator] (the sliding pill), [data-slot=segmented-control-divider]",
      "Under reduced motion the pill jumps instead of sliding",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-29",
})
