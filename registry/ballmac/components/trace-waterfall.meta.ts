import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "trace-waterfall",
  type: "registry:ui",
  title: "Trace Waterfall",
  description:
    "A trace as a waterfall: spans nested under the span that ran them, each a bar on a shared time axis with its duration, failed spans written out, collapsible branches and the full tree keyboard model.",
  category: "ai",
  tags: ["ai", "agents", "trace", "waterfall", "spans", "observability", "latency", "opentelemetry"],
  files: [{ path: "components/trace-waterfall.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "trace-waterfall-demo", title: "An agent run", file: "trace-waterfall-demo.tsx" },
    { name: "trace-waterfall-failed", title: "A failed tool call", file: "trace-waterfall-failed.tsx" },
  ],
  ai: {
    summary:
      "spans is [{ id, parentId?, name, kind?: model | tool | retrieval | agent | other, start: ms, duration: ms, status?: ok | error, tokens?, detail? }]. total (ms), selected / defaultSelected / onSelectedChange, defaultCollapsed (ids). Spans are nested by parentId; a span whose parent is missing is top level. Exports flatten and formatMs.",
    whenToUse: ["Seeing where an agent run spent its time, with nested model and tool calls", "Debugging latency or a failed step in a trace"],
    whenNotToUse: ["A plain list of steps; use trace", "Who handed work to whom; use agent-lanes", "Cost by step; use run-ledger"],
    composesWith: ["run-replay", "run-ledger", "agent-lanes", "token-meter"],
    a11y: [
      { keys: "Tab", action: "Enters the tree once, on the first span (or the selected one)" },
      { keys: "ArrowDown / ArrowUp", action: "Next or previous visible span; Home and End go to the first and last" },
      { keys: "ArrowRight", action: "Opens a closed span, or moves to its first child" },
      { keys: "ArrowLeft", action: "Closes an open span, or moves to its parent" },
      { keys: "Enter / Space", action: "Selects the span and shows its timing in a polite live region" },
      { keys: "Screen readers", action: "A tree: each item has its level, position and expanded state and reads 'Search repo, tool call, 420 ms, starts at 1.2 s, failed'" },
    ],
    customization: ["total", "defaultCollapsed", "Controlled selection", "kind colours use chart 1 to 5"],
  },
  statesNone: "A presentational trace: the spans are passed in, so it has nothing of its own to load or fail.",
  version: "1.0.0",
  updated: "2026-10-24",
})
