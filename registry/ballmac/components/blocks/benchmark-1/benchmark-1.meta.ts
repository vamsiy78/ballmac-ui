import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "benchmark-1",
  type: "registry:block",
  title: "Benchmark 1: before and after",
  description:
    "A before-and-after benchmark for two versions of a model or prompt: a sentence on what got better and worse, quality and speed task by task, what a run costs, and where the time goes.",
  category: "blocks",
  blockCategory: "experiments",
  tags: ["ai", "benchmark", "experiments", "comparison", "quality", "latency", "cost", "dumbbell"],
  files: [{ path: "components/blocks/benchmark-1/benchmark-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "skeleton", "state-view", "dumbbell-chart", "bar-list", "split-bar"],
  examples: [
    { name: "benchmark-1-demo", title: "Default", file: "benchmark-1-demo.tsx" },
    { name: "benchmark-1-quality", title: "Quality only", file: "benchmark-1-quality.tsx" },
    { name: "benchmark-1-loading", title: "Loading", file: "benchmark-1-loading.tsx" },
    { name: "benchmark-1-empty", title: "Nothing to compare yet", file: "benchmark-1-empty.tsx" },
    { name: "benchmark-1-error", title: "Could not load", file: "benchmark-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "benchmark-1-loading", trigger: "state=\"loading\"", note: "Skeleton summary and charts under the real heading, announced as loading." },
    { id: "empty", title: "Nothing to compare yet", example: "benchmark-1-empty", trigger: "state=\"empty\"", note: "Says there is nothing to compare yet; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "benchmark-1-error", trigger: "state=\"error\"", note: "An alert saying nothing was changed, with Try again (onRetry)." },
  ],
  ai: {
    summary:
      "Benchmark. <Benchmark1 title description from to quality={DumbbellRow[]} speed={DumbbellRow[]} cost={SplitSegment[]} slowest={BarListItem[]} />. The sentence at the top is computed from quality and speed (better on N of M, average change, faster on N). Speed is lowerIsBetter. Every chart writes each change in words.",
    whenToUse: ["Deciding whether to ship a new prompt or model", "An experiment results page"],
    whenNotToUse: ["Checking individual cases; use agent-17", "Live monitoring; use reliability-1"],
    composesWith: ["agent-17", "agent-12", "cost-1", "app-shell-1"],
    a11y: [
      { keys: "Summary", action: "One sentence says what changed, so no chart has to be read" },
      { keys: "Charts", action: "Each row says 'up N, better' or 'down N, worse'" },
      { keys: "Legend", action: "Named dots; the cost split is a list of buttons with values" },
    ],
    customization: ["title, description, from, to", "quality, speed, cost, slowest"],
  },
  version: "1.0.0",
  updated: "2026-10-24",
})
