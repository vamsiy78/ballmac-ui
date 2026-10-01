import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "highlighter",
  type: "registry:ui",
  title: "Highlighter",
  description:
    "Hand-drawn marks around inline text: highlight, underline, box, circle, strike-through and brackets, drawn in when the phrase scrolls into view.",
  category: "text",
  tags: ["highlight", "underline", "annotation", "marker", "text"],
  files: [{ path: "components/highlighter.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "highlighter-demo", title: "Marks in a paragraph", file: "highlighter-demo.tsx" },
    { name: "highlighter-actions", title: "All six marks", file: "highlighter-actions.tsx" },
  ],
  ai: {
    summary:
      "<Highlighter action='highlight|underline|box|circle|strike|bracket' tone padding duration delay>phrase</Highlighter>. Short phrases only: the mark is drawn around one box.",
    whenToUse: ["Drawing attention to a key phrase in copy", "Editorial and tutorial text"],
    whenNotToUse: ["Multi-line passages", "Search-result highlighting (use a plain mark element)"],
    composesWith: ["text-animate", "callout"],
    a11y: [
      { keys: "Screen readers", action: "The mark is decorative (aria-hidden); the text is unchanged" },
      { keys: "Contrast", action: "Text keeps the foreground color on a translucent highlight" },
      { keys: "Reduced motion", action: "Marks are drawn instantly" },
    ],
    customization: ["action", "tone", "strokeWidth and padding", "duration and delay", "inView"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
