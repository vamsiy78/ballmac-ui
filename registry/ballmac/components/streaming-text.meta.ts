import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "streaming-text",
  type: "registry:ui",
  title: "Streaming Text",
  description:
    "Text that arrives progressively, with a blinking caret while streaming, preserved whitespace, aria-busy for screen readers and an optional typewriter reveal for demos.",
  category: "ai",
  tags: ["ai", "streaming", "typewriter", "caret", "llm", "text"],
  files: [{ path: "components/streaming-text.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils"],
  examples: [{ name: "streaming-text-demo", title: "Default", file: "streaming-text-demo.tsx" }],
  ai: {
    summary:
      "Pass the accumulated text and streaming={true} while chunks arrive; it shows a caret and sets aria-busy until you set streaming={false}. Use animate + speed to type out text you already have.",
    whenToUse: [
      "Assistant replies that arrive token by token from a model",
      "Replaying a saved answer with a typewriter effect in a demo or onboarding",
      "Any plain-text live output where a caret shows that more is coming",
    ],
    whenNotToUse: [
      "Rendered markdown (render your markdown in ai-message's MessageContent and show StreamingCaret at the end)",
      "Headline text effects (use text-reveal)",
    ],
    composesWith: ["ai-message", "ai-chat"],
    a11y: [
      { keys: "—", action: "aria-live=polite region; aria-busy is true while streaming so screen readers read the finished text instead of every chunk" },
    ],
    customization: [
      "streaming: boolean (caret + aria-busy)",
      "animate + speed (characters per second, default 80) reveal existing text; skipped under reduced motion",
      "caret={false} hides the caret; StreamingCaret is exported for use at the end of custom markup",
      "Whitespace and newlines are preserved (whitespace-pre-wrap)",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-28",
})
