import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "hyper-text",
  type: "registry:ui",
  title: "Hyper Text",
  description:
    "Characters flip through random letters like a split-flap board and settle left to right, as plain text or on tiles, on load, on scroll or on hover and focus.",
  category: "text",
  tags: ["text", "flip", "split-flap", "hover", "headline"],
  files: [{ path: "components/hyper-text.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "hyper-text-demo", title: "Split-flap tiles", file: "hyper-text-demo.tsx" },
    { name: "hyper-text-hover", title: "Replay on hover", file: "hyper-text-hover.tsx" },
  ],
  ai: {
    summary:
      "<HyperText trigger='mount|inView|hover' variant='plain|tiles' speed spread>TEXT</HyperText>. Text is uppercased. The hover trigger is focusable and replays on focus.",
    whenToUse: ["Brand words, status boards, dates and counters", "Playful hover headings"],
    whenNotToUse: ["Anything that must stay readable mid-animation", "Long sentences"],
    composesWith: ["scramble-text", "number-ticker"],
    a11y: [
      { keys: "Tab", action: "Reaches the text when trigger is hover; focus replays the animation" },
      { keys: "Screen readers", action: "The real text is read once; the flipping characters are hidden" },
      { keys: "Reduced motion", action: "Characters appear settled" },
    ],
    customization: ["variant", "trigger", "speed and spread", "onComplete"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
