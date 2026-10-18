import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "experiments-1",
  type: "registry:block",
  title: "Experiments 1: A/B test results",
  description:
    "A/B test results with the statistics done: each variant's rate with its 95% confidence interval on one shared axis, lift, chance to beat the control, and a plain verdict: a winner, no clear difference, or more traffic needed.",
  category: "blocks",
  blockCategory: "experiments",
  tags: ["experiments", "ab test", "a/b testing", "conversion", "statistics", "significance", "confidence interval", "growth", "optimization"],
  files: [{ path: "components/blocks/experiments-1/experiments-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "skeleton", "state-view"],
  examples: [
    { name: "experiments-1-demo", title: "A winner", file: "experiments-1-demo.tsx" },
    { name: "experiments-1-early", title: "Too early to tell", file: "experiments-1-early.tsx" },
    { name: "experiments-1-flat", title: "No difference", file: "experiments-1-flat.tsx" },
    { name: "experiments-1-loading", title: "Loading", file: "experiments-1-loading.tsx" },
    { name: "experiments-1-empty", title: "No results yet", file: "experiments-1-empty.tsx" },
    { name: "experiments-1-error", title: "Could not load", file: "experiments-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "experiments-1-loading", trigger: "state=\"loading\"", note: "A skeleton verdict and variant rows under the real heading, announced as loading." },
    { id: "empty", title: "No results yet", example: "experiments-1-empty", trigger: "state=\"empty\" (or variants={[]})", note: "Says results appear once visitors have seen the versions; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "experiments-1-error", trigger: "state=\"error\"", note: "An alert saying nothing was changed, with Try again (onRetry)." },
  ],
  ai: {
    summary:
      "A/B test results. <Experiments1 title hypothesis metric status variants={[{ id, name, visitors, conversions, control?: true }]} confidence={0.95} onShip={(variant) => ...} />. Pass raw counts: rates, Wilson 95% intervals, relative lift, chance to beat the control (normal approximation), a two-sided p-value and the verdict are worked out. The verdict is a winner (p below 1 minus confidence), a loser, 'not enough data' with the visitors still needed at 80% power, or 'no clear difference'.",
    whenToUse: ["An experimentation or growth tool showing test results", "A landing-page testing report"],
    whenNotToUse: ["Plain KPI cards (use stats-1 or a dashboard block)", "Many metrics over time (use a chart)"],
    composesWith: ["app-shell-1", "funnel-1", "settings-5"],
    a11y: [
      { keys: "Tab", action: "Each Ship button; the verdict is a live region so a change in the data is announced" },
      { keys: "Intervals", action: "Every drawn interval has a text equivalent: the rate and the range it likely lies in" },
      { keys: "Winning", action: "Marked with a word and an icon as well as color; losses are written as lift in words, such as -4.2% vs control" },
    ],
    customization: ["confidence: 0.8 to 0.99 sets how sure to be before calling a winner", "The interval axis runs left to right in every language, like a chart", "All statistics are deterministic, so server and client agree"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
