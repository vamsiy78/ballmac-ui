import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "agent-5",
  type: "registry:block",
  title: "Agent 5: eval results",
  description:
    "Evaluation results for a prompt or model change: a verdict that calls out regressions, each metric against the baseline with which way is better, cases filtered to regressions or improvements, and both answers side by side or as a diff.",
  category: "blocks",
  blockCategory: "agents",
  tags: ["ai", "llm", "evals", "evaluation", "regression", "testing", "prompt", "model", "quality", "comparison"],
  files: [{ path: "components/blocks/agent-5/agent-5.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "diff-viewer", "segmented-control", "skeleton", "state-view"],
  examples: [
    { name: "agent-5-demo", title: "With a regression", file: "agent-5-demo.tsx" },
    { name: "agent-5-loading", title: "Loading", file: "agent-5-loading.tsx" },
    { name: "agent-5-empty", title: "No results yet", file: "agent-5-empty.tsx" },
    { name: "agent-5-error", title: "Could not load", file: "agent-5-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "agent-5-loading", trigger: "state=\"loading\"", note: "Skeleton metric cards and a case list under the real heading." },
    { id: "empty", title: "No results yet", example: "agent-5-empty", trigger: "state=\"empty\" (or cases={[]})", note: "Asks to run the suite; emptyState can add a Run button." },
    { id: "error", title: "Could not load", example: "agent-5-error", trigger: "state=\"error\"", note: "An alert with Try again (onRetry)." },
  ],
  ai: {
    summary:
      "An evals comparison page. <Agent5 title baselineLabel candidateLabel metrics={[{ id, label, baseline, candidate, format: 'percent' | 'ms' | 'currency' | 'number', higherIsBetter }]} cases={[{ id, input, expected, baseline: { output, pass, score }, candidate: { output, pass, score }, tags }]} onShip onKeepBaseline />. A regression is a case that passed on the baseline and fails on the candidate; the first one is selected.",
    whenToUse: ["Deciding whether a prompt or model change can ship", "Reviewing an eval suite's results in an internal AI tool"],
    whenNotToUse: ["Trying prompts by hand (use agent-4)", "Tracing one run (use agent-3)"],
    composesWith: ["agent-3", "agent-4", "app-shell-1"],
    a11y: [
      { keys: "Verdict", action: "A status region, so the number of regressions is read out" },
      { keys: "Metrics", action: "Each says Better or Worse in words next to its arrow, since lower is better for time and cost" },
      { keys: "Tab", action: "Cases are toggle buttons; pass and fail are words with an icon, each naming baseline or candidate" },
    ],
    customization: ["locale formats percentages and currency", "Feed it from Promptfoo, Braintrust, LangSmith or your own runner"],
  },
  version: "1.0.0",
  updated: "2026-10-17",
})
