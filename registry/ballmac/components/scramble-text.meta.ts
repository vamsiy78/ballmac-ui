import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "scramble-text",
  type: "registry:ui",
  title: "Scramble Text",
  description:
    "Decodes text in place: each character cycles through random glyphs before settling, left to right. Plays on mount, in view or on hover, keeps its final width, and exposes the final text to screen readers.",
  category: "text",
  tags: ["text", "scramble", "decode", "glitch", "terminal", "hover", "motion"],
  files: [{ path: "components/scramble-text.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "scramble-text-demo", title: "Deploy log", file: "scramble-text-demo.tsx" },
    { name: "scramble-text-hover", title: "On hover", file: "scramble-text-hover.tsx" },
  ],
  ai: {
    summary:
      "<ScrambleText trigger=\"mount\" | \"inView\" | \"hover\">Final text</ScrambleText>. Children must be a string. Frames are written straight to the DOM (no re-renders); an invisible copy of the final text reserves the layout and an sr-only copy is what assistive tech reads.",
    whenToUse: [
      "Terminal, security or developer-tool moments (status lines, keys, hashes)",
      "Short headings that reveal on scroll",
      "Nav links or buttons with a hover flourish (trigger=\"hover\")",
    ],
    whenNotToUse: [
      "Paragraphs or anything longer than a line",
      "Text that updates often (the scramble restarts each time)",
    ],
    composesWith: ["terminal", "word-rotate"],
    customization: [
      "duration (default 900 ms), delay, speed (ms per frame, default 40)",
      "characters: glyph set, e.g. \"01\" or hex digits",
      "mono: monospace so the width never shifts",
      "onComplete fires after the final frame; reduced motion shows the final text at once",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-29",
})
