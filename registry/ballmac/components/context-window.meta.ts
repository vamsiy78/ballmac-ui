import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "context-window",
  type: "registry:ui",
  title: "Context Window",
  description:
    "How full an agent's context is and what fills it: a stacked bar by part with tokens and share in a legend, room kept for the answer, a plain warning when nearly full or over, and a Compact button that says why when it cannot.",
  category: "ai",
  tags: ["ai", "context", "tokens", "window", "memory", "usage", "meter", "llm"],
  files: [{ path: "components/context-window.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "context-window-demo", title: "Half full, with Compact", file: "context-window-demo.tsx" },
    { name: "context-window-nearly", title: "Nearly full", file: "context-window-nearly.tsx" },
    { name: "context-window-over", title: "Over the limit", file: "context-window-over.tsx" },
  ],
  ai: {
    summary:
      "segments is [{ id, label, tokens }] (required) and limit is the window in tokens (required). reserved keeps room for the answer (drawn hatched), warnAt (default 0.8) is where it warns, title, fullNote (what happens when it is full), onCompact (adds the Compact button; reject and the card says why). The bar is a meter with a spoken value; Nearly full and Over the limit are words, not just colour.",
    whenToUse: ["Showing a person how much of the model's memory a conversation or run is using", "Warning before an agent starts forgetting the start of a task"],
    whenNotToUse: ["Spend in money; use run-ledger or usage-meter", "A single progress value; use progress"],
    composesWith: ["model-picker", "agent-steering", "plan-tracker", "ai-chat"],
    a11y: [
      { keys: "Meter", action: "The bar is role=meter named by the heading, with aria-valuenow, aria-valuemax and a spoken value such as '142K of 200K tokens, 71% used'" },
      { keys: "Warning", action: "Nearly full and Over the limit are written in a pill with an icon, not only coloured" },
      { keys: "Legend", action: "A list of parts with tokens and share, so the bar is never the only way to read it" },
      { keys: "Compact", action: "A native button that shows busy; a failure is an alert" },
    ],
    customization: ["segments and limit", "reserved and warnAt", "fullNote", "onCompact"],
  },
  statesNone: "A presentational meter: the segments are passed in, so it has nothing of its own to load.",
  version: "1.0.0",
  updated: "2026-10-25",
})
