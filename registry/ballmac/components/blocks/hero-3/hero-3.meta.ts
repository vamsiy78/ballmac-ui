import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "hero-3",
  type: "registry:block",
  title: "Hero 3: AI product with live prompt",
  description:
    "Hero for AI products: a real prompt input on the left, and on the right a mock answer with a reasoning panel, a tool call and a streaming reply.",
  category: "blocks",
  blockCategory: "hero",
  tags: ["hero", "ai", "assistant", "prompt", "agent"],
  files: [{ path: "components/blocks/hero-3/hero-3.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "badge", "prompt-input", "reasoning-disclosure", "streaming-text", "tool-call-card"],
  examples: [{ name: "hero-3-demo", title: "Default", file: "hero-3-demo.tsx" }],
  ai: {
    summary: "Top section for an AI assistant or agent product. The prompt is real: handle onSubmit (e.g. send visitors to sign-up with their question).",
    whenToUse: ["AI assistants, copilots and agents", "Products whose value is best shown as a question and answer"],
    whenNotToUse: ["Products without a conversational interface (use hero-1)"],
    composesWith: ["ai-chat-1", "features-1", "pricing-1"],
    customization: ["eyebrow, title, description, placeholder props", "onSubmit(value) to capture the visitor's question", "Change the demo answer, reasoning and tool call to match your product"],
  },
  version: "1.0.0",
  updated: "2026-09-28",
})
