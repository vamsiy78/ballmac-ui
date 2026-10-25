import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "eval-scorecard",
  type: "registry:ui",
  title: "Eval Scorecard",
  description:
    "The result of testing a model or prompt against a set of cases: pass rate and change from the baseline in words, a trend, what got worse or was fixed, and every case opened to show the question, a good answer and the model's.",
  category: "ai",
  tags: ["ai", "evals", "testing", "quality", "regression", "scorecard", "llm", "prompts"],
  files: [{ path: "components/eval-scorecard.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "eval-scorecard-demo", title: "A support prompt, six cases", file: "eval-scorecard-demo.tsx" },
    { name: "eval-scorecard-clean", title: "Everything passes", file: "eval-scorecard-clean.tsx" },
  ],
  ai: {
    summary:
      "cases is [{ id, name, input, expected, actual, status 'pass'|'fail'|'error', previous?, ms?, cost?, tags?, note? }]. previous is the status on the baseline run: a fail that was a pass is 'Got worse', a pass that was a fail is 'Fixed'. history is earlier pass rates (0-1) for the trend; baseline defaults to the last of them. onRerun(ids) adds 'Run the N failed again' and a per-case button; reject and the reason shows. Filters: All, Failed, Got worse.",
    whenToUse: ["Reviewing a prompt or model change before shipping it", "A regression dashboard for an AI feature"],
    whenNotToUse: ["Live traffic quality; use a monitoring dashboard", "Comparing two outputs side by side; use model-compare or prompt-diff"],
    composesWith: ["prompt-diff", "model-compare", "run-ledger", "trace-waterfall"],
    a11y: [
      { keys: "Result", action: "Pass rate and change are text; the ring and trend are decoration with a spoken equivalent" },
      { keys: "Filter", action: "A labelled group of toggle buttons with pressed state and counts" },
      { keys: "Cases", action: "Each case is a heading with a button and aria-expanded; status is a word and an icon" },
      { keys: "Re-run", action: "Native buttons; the result is announced and failures are alerts" },
    ],
    customization: ["title and subject", "cases, history, baseline", "onRerun"],
  },
  statesNone: "A presentational scorecard: the results are passed in, so it has nothing of its own to load. A filter with no match says so.",
  version: "1.0.0",
  updated: "2026-10-25",
})
