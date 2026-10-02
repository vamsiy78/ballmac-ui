import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "token-meter",
  type: "registry:ui",
  title: "Token Meter",
  description:
    "A context-window meter that stacks system, history and attachments against the limit with a reserved reply area, plus a composer pill that opens the same view in a popover.",
  category: "ai",
  tags: ["ai", "tokens", "context", "meter", "usage", "llm"],
  files: [{ path: "components/token-meter.tsx" }],
  dependencies: ["motion@^12", "lucide-react"],
  registryDependencies: ["shadcn:utils", "popover", "i18n"],
  examples: [
    { name: "token-meter-demo", title: "Breakdown with warning", file: "token-meter-demo.tsx" },
    { name: "token-meter-pill", title: "Composer pill", file: "token-meter-pill.tsx" },
  ],
  ai: {
    summary:
      "segments is [{ label, tokens, reserved? }], limit is the window. The meter warns at warnAt percent (80) and again when full, with words and an icon. <TokenMeterPill> shows a ring and percentage. Exports formatTokens and estimateTokens.",
    whenToUse: ["Showing how full the model's context is", "Nudging people to start a new chat or compact"],
    whenNotToUse: ["Plan quotas and billing limits; use usage-meter", "Generic progress; use progress"],
    composesWith: ["prompt-input", "model-picker", "usage-meter"],
    a11y: [
      { keys: "Screen readers", action: "role=meter with a value such as '142k of 200k tokens used, 71%. 58k left.'" },
      { keys: "Enter / Space", action: "Opens the pill's detail popover" },
      { keys: "Color", action: "Warning and full states add an icon and words" },
    ],
    customization: ["segments and limit", "warnAt", "cost text", "action slot for a Compact button"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
})
