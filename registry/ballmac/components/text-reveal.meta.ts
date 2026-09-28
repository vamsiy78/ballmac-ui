import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "text-reveal",
  type: "registry:ui",
  title: "Text Reveal",
  description:
    "Reveals a headline or paragraph word by word or character by character with a soft blur and rise, when it scrolls into view or on mount.",
  category: "motion",
  tags: ["animation", "text", "headline", "scroll", "motion"],
  files: [{ path: "components/text-reveal.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils", "motion-presets"],
  examples: [
    { name: "text-reveal-demo", title: "Headline", file: "text-reveal-demo.tsx" },
    { name: "text-reveal-chars", title: "By character", file: "text-reveal-chars.tsx" },
  ],
  ai: {
    summary:
      "Wrap a plain string: <TextReveal as=\"h1\">Ship the interface</TextReveal>. Screen readers get the full text once from a visually hidden copy; the animated pieces are aria-hidden. Under reduced motion it renders plain text.",
    whenToUse: [
      "Hero headlines and section titles on marketing pages",
      "A short tagline that should land after the page loads (trigger=\"mount\")",
      "Pull quotes or statements revealed as the reader scrolls",
    ],
    whenNotToUse: [
      "Body copy, UI labels or anything users need to read immediately",
      "Rich text with links or inline elements (children must be a plain string)",
      "Streaming AI output (render tokens as they arrive instead)",
    ],
    composesWith: ["shimmer-text", "animated-grid", "number-ticker"],
    customization: [
      "by: word | char (char staggers faster and keeps each word on one line)",
      "as: h1 | h2 | h3 | h4 | p | span | div",
      "trigger: inView | mount; once (default true) replays on re-entry when false",
      "delay and step in seconds; style with className like any text element",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-28",
})
