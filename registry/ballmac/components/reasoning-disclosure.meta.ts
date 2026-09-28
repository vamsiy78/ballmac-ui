import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "reasoning-disclosure",
  type: "registry:ui",
  title: "Reasoning Disclosure",
  description:
    "A collapsible 'thinking' panel for model reasoning: shows a shimmering 'Thinking…' while streaming, opens automatically, then collapses to 'Thought for 12s' when done.",
  category: "ai",
  tags: ["ai", "reasoning", "thinking", "collapsible", "llm", "chain-of-thought"],
  files: [{ path: "components/reasoning-disclosure.tsx" }],
  dependencies: ["lucide-react", "motion@^12", "radix-ui"],
  registryDependencies: ["shadcn:utils"],
  examples: [{ name: "reasoning-disclosure-demo", title: "Default", file: "reasoning-disclosure-demo.tsx" }],
  ai: {
    summary:
      "Wrap a model's reasoning text: <ReasoningDisclosure streaming={isReasoning} duration={seconds}>{text}</ReasoningDisclosure>. It opens while streaming and collapses when streaming ends unless you control open.",
    whenToUse: [
      "Showing reasoning or 'thinking' tokens from reasoning models above the final answer",
      "Any secondary, verbose content that should be visible while it is produced and tucked away afterwards",
    ],
    whenNotToUse: [
      "FAQ-style expanders (use an accordion)",
      "Tool call details (use tool-call-card)",
    ],
    composesWith: ["ai-message", "streaming-text", "tool-call-card"],
    a11y: [
      { keys: "Enter / Space", action: "Opens or closes the reasoning (aria-expanded, aria-controls)" },
      { keys: "—", action: "The shimmer is decorative and stops under reduced motion" },
    ],
    customization: [
      "streaming: boolean; duration in seconds renders 'Thought for 12s' / 'Thought for 1m 5s'",
      "open/onOpenChange (controlled: streaming no longer toggles it) or defaultOpen",
      "autoCollapse={false} keeps it open after streaming ends",
      "label replaces the header text; contentClassName styles the panel",
      "AI SDK: render parts with type 'reasoning' as children; streaming while the message is streaming and no text part has started",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-28",
})
