import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "trace",
  type: "registry:ui",
  title: "Trace",
  description:
    "The one row behind reasoning, tool calls, sources and plans: an icon, a title and optional detail, with running, error and pending states, rows that expand, link or open a dialog, and shadcn's Trace API.",
  category: "ai",
  tags: ["trace", "agent", "reasoning", "tool call", "chain of thought", "steps", "shadcn"],
  files: [{ path: "components/trace.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "shimmer-text"],
  examples: [
    { name: "trace-demo", title: "An agent's steps", file: "trace-demo.tsx" },
    { name: "trace-status", title: "Running, error and pending", file: "trace-status.tsx" },
    { name: "trace-collapsible", title: "Opens while it streams", file: "trace-collapsible.tsx" },
    { name: "trace-steps", title: "Chain of thought", file: "trace-steps.tsx" },
    { name: "trace-sources", title: "Sources", file: "trace-sources.tsx" },
    { name: "trace-dialog", title: "Opens a dialog", file: "trace-dialog.tsx" },
    { name: "trace-agent-turn", title: "An agent turn with a question", file: "trace-agent-turn.tsx" },
  ],
  statesNone: "A row shows the state of work reported to it (running, error, pending); it loads and fetches nothing itself.",
  ai: {
    summary:
      "<Trace> holds rows. A row is <TraceLine status><TraceIcon/><TraceTitle/><TraceDescription/></TraceLine>. Wrap it in <TraceCollapsibleTrigger> inside a <TraceCollapsible> to expand, or in a link, or a dialog's trigger. The parts and props match shadcn's Trace.",
    whenToUse: [
      "Showing what an AI agent did: reasoning, tool calls, searches, file edits",
      "Plans, task lists and sources where every row should look the same",
      "Rows that expand, link out or open a dialog or sheet",
    ],
    whenNotToUse: [
      "The agent's reply text; use message or ai-message",
      "A single tool call with its full input and output; use tool-call-card",
      "A general disclosure; use collapsible or accordion",
    ],
    composesWith: ["code-block", "questionnaire", "dialog", "shimmer-text", "ai-message"],
    a11y: [
      { keys: "Enter / Space", action: "On a TraceCollapsibleTrigger, opens or closes the row (aria-expanded and aria-controls are set)" },
      { keys: "Tab", action: "A TraceLine on its own is text and not a tab stop; the trigger, link or dialog trigger around it is" },
      { keys: "Screen readers", action: "Icons are hidden, so the title is the name: write a sentence (Edited trace.tsx) and put the state in it (Running pnpm build). Closed content is inert" },
      { keys: "Reduced motion", action: "The shimmer and the chevron turn stop; the title still says what is happening" },
    ],
    customization: [
      "status on TraceLine: running | error | pending",
      "open, defaultOpen, onOpenChange, disabled on TraceCollapsible",
      "className on every part",
    ],
  },
  source: {
    name: "shadcn/ui Trace",
    url: "https://github.com/shadcn-ui/ui",
    license: "MIT",
    copyright: "Copyright (c) 2023 shadcn",
    modified: true,
  },
  version: "1.0.0",
  updated: "2026-10-19",
});
