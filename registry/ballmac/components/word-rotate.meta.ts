import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "word-rotate",
  type: "registry:ui",
  title: "Word Rotate",
  description:
    "Cycles one word of a sentence with a vertical slide and blur while its width springs to the next word, so the rest of the line reflows smoothly. Screen readers hear one stable sentence.",
  category: "text",
  tags: ["text", "headline", "rotate", "words", "hero", "typewriter", "motion"],
  files: [{ path: "components/word-rotate.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils", "motion-presets"],
  examples: [
    { name: "word-rotate-demo", title: "Hero headline", file: "word-rotate-demo.tsx" },
    { name: "word-rotate-inline", title: "Inline highlight", file: "word-rotate-inline.tsx" },
  ],
  ai: {
    summary:
      "Place <WordRotate words={[\"faster\", \"safer\"]} /> inside a heading or paragraph; it inherits the font. Style the words with wordClassName (gradients, highlights). The accessible text is srText or the words joined with commas; the animated part is aria-hidden and not a live region.",
    whenToUse: [
      "Hero headlines that name several audiences or benefits",
      "Short inline highlights in a tagline",
    ],
    whenNotToUse: [
      "Information people must read in full (rotating text is easy to miss)",
      "Long phrases or more than about five options",
    ],
    composesWith: ["gradient-text", "button"],
    customization: [
      "interval in ms (default 2400), paused to hold the current word",
      "wordClassName for color, gradient (bg-clip-text) or a highlight background",
      "srText to set exactly what screen readers hear",
      "Pauses while off-screen; reduced motion swaps words with a plain fade",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-29",
})
