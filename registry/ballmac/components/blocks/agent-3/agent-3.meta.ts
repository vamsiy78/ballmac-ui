import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "agent-3",
  type: "registry:block",
  title: "Agent 3: runs and traces",
  description:
    "AI agent runs with status, time, tokens and cost, filtered and searched, and a trace waterfall for the selected run: model calls, tool calls and retrieval, each span with input, output and error.",
  category: "blocks",
  blockCategory: "agents",
  tags: ["ai", "agent", "observability", "trace", "waterfall", "spans", "runs", "llm", "tokens", "cost", "debugging"],
  files: [{ path: "components/blocks/agent-3/agent-3.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "json-viewer", "segmented-control", "skeleton", "state-view"],
  examples: [
    { name: "agent-3-demo", title: "Default", file: "agent-3-demo.tsx" },
    { name: "agent-3-failed", title: "A failed run", file: "agent-3-failed.tsx" },
    { name: "agent-3-loading", title: "Loading", file: "agent-3-loading.tsx" },
    { name: "agent-3-empty", title: "No runs yet", file: "agent-3-empty.tsx" },
    { name: "agent-3-error", title: "Could not load", file: "agent-3-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "agent-3-loading", trigger: "state=\"loading\"", note: "A skeleton table and trace; search and the status filter are disabled." },
    { id: "empty", title: "No runs yet", example: "agent-3-empty", trigger: "state=\"empty\" (or runs={[]})", note: "Explains that runs and traces appear once agents work; a filter with no matches says so inside the table instead." },
    { id: "error", title: "Could not load", example: "agent-3-error", trigger: "state=\"error\"", note: "An alert with Try again (onRetry)." },
  ],
  ai: {
    summary:
      "Agent observability. <Agent3 runs={[{ id, agent, task, status: 'success' | 'error' | 'running', started, duration (ms), tokens, cost, spans: [{ id, name, kind: 'llm' | 'tool' | 'retrieval' | 'step', start (ms from run start), duration (ms), depth, status, tokens, input, output, error }] }]} />. Map OpenTelemetry GenAI spans, Langfuse or AI SDK telemetry onto spans; a failed span is selected first.",
    whenToUse: ["Debugging what an agent did and where time and tokens went", "An admin page of recent agent runs"],
    whenNotToUse: ["Watching one run live (use agent-1)", "General request tracing for web services (use log-stream or a data-table)"],
    composesWith: ["agent-1", "agent-2", "app-shell-1"],
    a11y: [
      { keys: "Tab", action: "Each run's task is a toggle button; each span is a button that opens its details" },
      { keys: "Screen readers", action: "Each span names its kind, start, duration and whether it failed, since the bars are visual only" },
      { keys: "Arrow keys in the table region", action: "Scroll it sideways on narrow screens" },
    ],
    customization: ["title, defaultRunId, locale", "Bars use insetInlineStart, so the waterfall mirrors in right-to-left"],
  },
  version: "1.0.0",
  updated: "2026-10-17",
})
