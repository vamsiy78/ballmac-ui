import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "agent-4",
  type: "registry:block",
  title: "Agent 4: prompt playground with model compare",
  description:
    "A prompt playground that runs one prompt on two models side by side: system prompt, {{variables}} that become fields, Run with ⌘Enter, each answer with time, tokens and cost, ratings and Pick this one.",
  category: "blocks",
  blockCategory: "agents",
  tags: ["ai", "llm", "prompt", "playground", "compare", "models", "evaluation", "a/b", "variables", "prompt engineering"],
  files: [{ path: "components/blocks/agent-4/agent-4.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "kbd", "model-picker", "textarea", "state-view", "use-resource"],
  examples: [
    { name: "agent-4-demo", title: "Two answers compared", file: "agent-4-demo.tsx" },
    { name: "agent-4-fresh", title: "Before the first run", file: "agent-4-fresh.tsx" },
    { name: "agent-4-running", title: "Running", file: "agent-4-running.tsx" },
    { name: "agent-4-error", title: "A model did not answer", file: "agent-4-error.tsx" },
  ],
  states: [
    { id: "submitting", title: "Running", example: "agent-4-running", trigger: "state=\"submitting\"", note: "Both sides show Running…, are marked busy, and Run and the model pickers are disabled." },
    { id: "error", title: "A model did not answer", example: "agent-4-error", trigger: "state=\"error\" (or onRun throws)", note: "The side shows an alert with the reason; errorState sets the copy. A thrown Error's message is shown on that side only." },
  ],
  ai: {
    summary:
      "A side-by-side prompt playground. <Agent4 models={ModelOption[]} defaultModels={['a', 'b']} defaultSystem defaultPrompt=\"… {{customer}} …\" defaultVariables={{ customer: 'Jordan' }} onRun={async ({ model, system, prompt, variables }) => ({ text, latencyMs, tokens: { input, output }, cost })} onRate onPick />. Variables are detected from {{name}} in the prompt and must be filled before running.",
    whenToUse: ["Choosing a model or prompt for a feature by comparing real answers", "An internal tool for prompt iteration with ratings saved for evaluation"],
    whenNotToUse: ["A chat with one model (use ai-chat-1)", "Watching an agent run (use agent-1)"],
    composesWith: ["agent-3", "app-shell-1"],
    a11y: [
      { keys: "⌘Enter or Ctrl+Enter in any field", action: "Runs both sides" },
      { keys: "Answers", action: "Each side is a live region and is marked busy while running; errors are alerts" },
      { keys: "Tab", action: "Rating buttons are toggles named for their side" },
    ],
    customization: [
      "AI SDK: onRun={async ({ model, system, prompt }) => { const t = performance.now(); const r = await generateText({ model, system, prompt }); return { text: r.text, latencyMs: performance.now() - t, tokens: { input: r.usage.inputTokens, output: r.usage.outputTokens } } }}",
      "defaultResults shows a saved comparison before the first run",
      "onRate and onPick receive the full request, so ratings can be stored as eval data",
    ],
  },
  version: "1.0.0",
  updated: "2026-10-17",
})
