import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "suggestion-chips",
  type: "registry:ui",
  title: "Suggestion Chips",
  description:
    "Starter prompts for an empty chat or follow-ups after a reply, as wrapping pills, a swipeable row with faded edges, or cards with descriptions, plus loading and refresh states.",
  category: "ai",
  tags: ["ai", "chat", "prompts", "suggestions", "chips"],
  files: [{ path: "components/suggestion-chips.tsx" }],
  dependencies: ["motion@^12", "lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "suggestion-chips-demo", title: "Follow-up pills with refresh", file: "suggestion-chips-demo.tsx" },
    { name: "suggestion-chips-cards", title: "Starter cards", file: "suggestion-chips-cards.tsx" },
  ],
  ai: {
    summary:
      "suggestions is an array of { label, prompt?, description?, icon? }. onSelect receives the prompt text. variant is pills | scroll | cards. loading shows placeholders and onRefresh adds a shuffle button.",
    whenToUse: ["Empty state of a chat with example questions", "Follow-up questions under an answer"],
    whenNotToUse: ["Filtering a list (use filter-chips or tabs)", "Free-form input; use prompt-input"],
    composesWith: ["prompt-input", "ai-chat", "ai-message"],
    a11y: [
      { keys: "Tab / Shift+Tab", action: "Moves between chips" },
      { keys: "Enter / Space", action: "Sends the chosen prompt" },
      { keys: "Reduced motion", action: "Chips fade in without sliding" },
    ],
    customization: ["variant: pills | scroll | cards", "loading", "disabled", "onRefresh and refreshLabel"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
})
