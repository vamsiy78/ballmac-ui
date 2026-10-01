import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "typing-text",
  type: "registry:ui",
  title: "Typing Text",
  description:
    "A typewriter that types and erases one or several strings with natural timing and a blinking caret, starting on scroll if you like, with the whole text available to screen readers.",
  category: "text",
  tags: ["typewriter", "typing", "text", "caret", "hero"],
  files: [{ path: "components/typing-text.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "typing-text-demo", title: "Cycling headline", file: "typing-text-demo.tsx" },
    { name: "typing-text-once", title: "Type once with a caret", file: "typing-text-once.tsx" },
  ],
  ai: {
    summary:
      "<TypingText text={['one','two']} typingSpeed deleteSpeed pause loop cursor startOnView onComplete />. A single string types once unless loop is set.",
    whenToUse: ["Hero lines that cycle through use cases", "Terminal-style intros"],
    whenNotToUse: ["Streaming AI output (streaming-text)", "Long copy"],
    composesWith: ["word-rotate", "terminal", "text-animate"],
    a11y: [
      { keys: "Screen readers", action: "All strings are available as hidden text; the typing itself is aria-hidden" },
      { keys: "Reduced motion", action: "The first string (or the last, when not looping) is shown whole with no caret blink" },
    ],
    customization: ["typingSpeed, deleteSpeed, pause", "loop", "cursor", "startOnView", "onComplete"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
