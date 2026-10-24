import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "model-compare",
  type: "registry:ui",
  title: "Model Compare",
  description:
    "Models side by side, with intelligence, speed and cost as meters that also have a spoken value, context size, a Recommended mark, search, provider filters, and a plain reason when a model is not available.",
  category: "ai",
  tags: ["ai", "model", "picker", "llm", "select", "compare", "providers", "settings"],
  files: [{ path: "components/model-compare.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "model-compare-demo", title: "Models from three providers", file: "model-compare-demo.tsx" },
    { name: "model-compare-short", title: "A short list", file: "model-compare-short.tsx" },
  ],
  ai: {
    summary:
      "models is [{ id, name, provider, description?, intelligence: 1-5, speed: 1-5, cost: 1-5 (1 is cheapest), context?: tokens, recommended?, unavailable?: reason }] (required). value / defaultValue / onValueChange, label, searchable (default: on when there are more than six). Each model is a native radio; one with unavailable is disabled and shows the reason. Search and provider chips filter the list.",
    whenToUse: ["Letting a person choose which model runs their agent or chat", "Comparing models by capability, speed and cost on one screen"],
    whenNotToUse: ["A compact searchable selector inside a composer; use model-picker", "A tiny two-way switch between fast and smart; use segmented-control", "Comparing the outputs of several models; use prompt-playground or parallel-attempts"],
    composesWith: ["model-picker", "context-window", "autonomy-dial", "agent-9"],
    a11y: [
      { keys: "Arrow keys", action: "A native radio group: Up, Down, Left and Right move between available models, Space selects; unavailable models are skipped" },
      { keys: "Meters", action: "Each meter is an image with a spoken value, such as 'Intelligence 4 of 5' and 'Cost 2 of 5, lower is cheaper'" },
      { keys: "Selected", action: "Announced in a polite live region as '<name> by <provider> is selected'" },
      { keys: "Filters", action: "Provider chips are toggle buttons with pressed state; search is a labelled search box" },
      { keys: "Unavailable", action: "The reason is written on the card, not only shown by dimming" },
    ],
    customization: ["models and their numbers", "value and onValueChange", "label and searchable"],
  },
  statesNone: "A presentational picker: the models are passed in, so it has nothing of its own to load. An empty search says nothing matches.",
  version: "1.0.0",
  updated: "2026-10-25",
})
