import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "thinking-loader",
  type: "registry:ui",
  title: "Thinking Loader",
  description:
    "A small working pill for AI replies: an eight-ray spinner and a shimmering label that rolls through what the assistant is doing, then settles on a check. Heard once by screen readers; still with reduced motion.",
  category: "ai",
  tags: ["ai", "loader", "thinking", "spinner", "streaming", "assistant", "status"],
  files: [{ path: "components/thinking-loader.tsx" }],
  dependencies: ["lucide-react", "motion"],
  registryDependencies: ["shadcn:utils", "i18n", "motion-presets"],
  examples: [
    { name: "thinking-loader-demo", title: "In a reply", file: "thinking-loader-demo.tsx" },
    { name: "thinking-loader-done", title: "Finished", file: "thinking-loader-done.tsx" },
  ],
  ai: {
    summary:
      "phases is string[] (what the assistant is doing, in order; defaults to four general ones), interval in ms (default 1800), done turns it into a check plus doneLabel. role=status announces Working once and the finished text when done, not each phase; the spinner and shimmer stop with reduced motion or when the theme turns loops off.",
    whenToUse: ["The wait before and during an AI reply", "Showing which step an agent is on without a progress bar"],
    whenNotToUse: ["A real, measurable progress bar; use progress", "A page or block that is loading; use skeleton or state-view"],
    composesWith: ["ai-chat", "streaming-text", "agent-lanes", "run-replay"],
    a11y: [
      { keys: "Screen reader", action: "A polite status says Working once, and the finished text when done; the rolling phases are hidden from assistive technology" },
      { keys: "Reduced motion", action: "The spinner and the shimmer hold still; the label still changes" },
    ],
    customization: ["phases and interval", "done and doneLabel", "className on the pill"],
  },
  version: "1.0.1",
  updated: "2026-10-25",
  changelog: [
    { version: "1.0.1", date: "2026-10-25", note: "A new phase fades in from a soft grey instead of from nothing, so the label never disappears between phases." },
    { version: "1.0.0", date: "2026-10-25", note: "First release." },
  ],
})
