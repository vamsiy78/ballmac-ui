import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "cost-1",
  type: "registry:block",
  title: "Cost 1: cloud cost explorer",
  description:
    "Where the cloud bill goes: the total against last period and the budget in words, spend by service as a treemap, a waterfall of what changed since last period, and unusual costs with their cause to mark as looked at.",
  category: "blocks",
  blockCategory: "cost",
  tags: ["cloud cost", "finops", "spend", "budget", "treemap", "waterfall", "infrastructure", "anomalies"],
  files: [{ path: "components/blocks/cost-1/cost-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "bullet-chart", "button", "segmented-control", "skeleton", "state-view", "treemap", "waterfall-chart"],
  examples: [
    { name: "cost-1-demo", title: "Default", file: "cost-1-demo.tsx" },
    { name: "cost-1-last", title: "Last month", file: "cost-1-last.tsx" },
    { name: "cost-1-loading", title: "Loading", file: "cost-1-loading.tsx" },
    { name: "cost-1-empty", title: "No cost data yet", file: "cost-1-empty.tsx" },
    { name: "cost-1-error", title: "Could not load", file: "cost-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "cost-1-loading", trigger: "state=\"loading\"", note: "Skeleton for the figures, the treemap and the waterfall under the real heading, announced as loading." },
    { id: "empty", title: "No cost data yet", example: "cost-1-empty", trigger: "state=\"empty\"", note: "Says no cost data yet; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "cost-1-error", trigger: "state=\"error\"", note: "An alert saying nothing was changed, with Try again (onRetry). A failed acknowledgement keeps the cost listed and says why." },
  ],
  ai: {
    summary:
      "A cloud cost explorer. <Cost1 periods={[{ id, label, total, previous, budget?, items: [{ id, label, value, group? }], bridge: [{ id, label, value, kind?: 'total' }], anomalies?: [{ id, service, amount, text }] }]} currency='USD' defaultPeriod='now' onAcknowledge={(anomaly) => Promise} />. The period control switches everything. The comparison and the budget are written in words ('$1,640 more than the period before', '$240 left of $16,000').",
    whenToUse: ["A FinOps or engineering-management view of infrastructure spend", "Explaining why a bill moved"],
    whenNotToUse: ["A customer's invoice; use invoice-1", "Usage against a plan quota; use the usage-meter component"],
    composesWith: ["capacity-1", "slo-1", "dashboard-1", "app-shell-1"],
    a11y: [
      { keys: "Comparison and budget", action: "Always words and an icon next to the number, never colour or an arrow alone" },
      { keys: "Period", action: "A segmented control (radio group) that updates the whole page" },
      { keys: "Treemap and waterfall", action: "Both are keyboard and screen-reader friendly components; the waterfall comes with a table" },
      { keys: "Unusual costs", action: "Each has a button named for the service; the result is a polite announcement and a failure is an alert" },
    ],
    customization: ["periods, currency and defaultPeriod", "budget is optional per period", "onAcknowledge; reject and it stays listed"],
  },
  version: "1.0.0",
  updated: "2026-10-24",
})
