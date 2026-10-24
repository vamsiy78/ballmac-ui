import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "tool-call-card",
  type: "registry:ui",
  title: "Tool Call Card",
  description:
    "Shows one agent tool call: the tool name, a pending, running, success or error status with icon and text, duration, and collapsible pretty-printed input and result.",
  category: "ai",
  tags: ["ai", "agent", "tool", "function-calling", "json", "status", "llm"],
  files: [{ path: "components/tool-call-card.tsx" }],
  dependencies: ["lucide-react", "motion", "radix-ui"],
  registryDependencies: ["shadcn:utils", "i18n", "motion-presets"],
  examples: [
    { name: "tool-call-card-demo", title: "Default", file: "tool-call-card-demo.tsx" },
    { name: "tool-call-card-states", title: "All states", file: "tool-call-card-states.tsx" },
    { name: "tool-call-card-failed", title: "A failed call with Retry", file: "tool-call-card-failed.tsx" },
  ],
  ai: {
    summary:
      "Render each tool invocation of an agent: <ToolCallCard name status duration input result />. status is pending | running | success | error | denied; server (a tag after the name), icon (a tile), onRetry (adds Retry to a failed call; reject and it says why). An input object with only plain values is listed as keys and values; each block has a Copy button. Objects are shown as indented JSON, strings as-is; the details panel is a disclosure (collapsed by default).",
    whenToUse: [
      "Showing function/tool calls inside an assistant message",
      "Agent run logs where each step calls a tool and returns data",
      "Debug views for MCP tool calls",
    ],
    whenNotToUse: [
      "Generic key/value data (use a table or description list)",
      "Long source files (use code-block)",
    ],
    composesWith: ["ai-message", "ai-chat", "reasoning-disclosure"],
    a11y: [
      { keys: "Enter / Space", action: "On the tool name, opens or closes the input and result (aria-expanded)" },
      { keys: "Tab", action: "Focuses the scrollable input and result blocks so long JSON can be scrolled with the keyboard" },
      { keys: "—", action: "Status changes are announced politely; status is always icon plus text" },
    ],
    customization: [
      "status: pending | running | success (chart-2 token) | error (destructive token)",
      "duration in milliseconds, formatted as 340ms / 1.2s / 1m 12s",
      "open/defaultOpen/onOpenChange control the details panel",
      "children render inside the details panel after input and result (e.g. a preview of the data)",
      "AI SDK: map a tool part's state ('input-streaming' | 'input-available' → running, 'output-available' → success, 'output-error' → error) and pass part.input / part.output",
    ],
  },
  version: "1.1.0",
  updated: "2026-10-25",
  changelog: [
    { version: "1.1.0", date: "2026-10-25", note: "A status strip, an icon tile and a server tag; flat inputs listed as keys and values; Copy on input and result; a moving line while running; a Denied status; and Retry on a failed call. New props: server, icon, onRetry." },
    { version: "1.0.0", date: "2026-09-28", note: "First release." },
  ],
})
