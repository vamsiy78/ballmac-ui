import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "agent-17",
  type: "registry:block",
  title: "Agent 17: prompt evaluation",
  description:
    "An evaluation lab for a prompt change: the pass rate against the baseline, which cases got worse or were fixed, what the model said against what was expected, and the exact words that changed in the prompt.",
  category: "blocks",
  blockCategory: "agents",
  tags: ["ai", "agent", "evals", "testing", "prompts", "regression", "quality", "scorecard"],
  files: [{ path: "components/blocks/agent-17/agent-17.tsx" }],
  dependencies: [],
  registryDependencies: ["shadcn:utils", "skeleton", "state-view", "eval-scorecard", "prompt-diff"],
  examples: [
    { name: "agent-17-demo", title: "Default", file: "agent-17-demo.tsx" },
    { name: "agent-17-clean", title: "Everything passes", file: "agent-17-clean.tsx" },
    { name: "agent-17-loading", title: "Loading", file: "agent-17-loading.tsx" },
    { name: "agent-17-empty", title: "No cases yet", file: "agent-17-empty.tsx" },
    { name: "agent-17-error", title: "Could not load", file: "agent-17-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "agent-17-loading", trigger: "state=\"loading\"", note: "Skeleton scorecard under the real heading, announced as loading." },
    { id: "empty", title: "No cases yet", example: "agent-17-empty", trigger: "state=\"empty\"", note: "Says there are no cases yet; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "agent-17-error", trigger: "state=\"error\"", note: "An alert saying nothing was run, with Try again (onRetry). A re-run that fails says why." },
  ],
  ai: {
    summary:
      "Prompt evaluation. <Agent17 title description subject cases={EvalCase[]} history={number[]} promptBefore promptAfter onRerun={(ids) => Promise} />. Shows the scorecard (pass rate, change from the baseline, regressions, fixes, trend, filters) and a word-level diff of the prompt. A failed re-run shows its reason.",
    whenToUse: ["Checking a prompt or model change before it ships", "A review page for an AI feature's quality"],
    whenNotToUse: ["Live monitoring; use a dashboard", "Comparing two models on one input; use model-compare"],
    composesWith: ["agent-13", "agent-14", "cost-1", "app-shell-1"],
    a11y: [
      { keys: "Scorecard", action: "Pass rate and change are text; filters are toggle buttons; every case is a disclosure with its status in words" },
      { keys: "Diff", action: "Added and removed words are marked in words for screen readers as well as by color" },
      { keys: "Re-run", action: "Native buttons; results are announced and failures are alerts" },
    ],
    customization: ["title, description, subject", "cases, history", "promptBefore and promptAfter", "onRerun"],
  },
  version: "1.0.0",
  updated: "2026-10-24",
})
