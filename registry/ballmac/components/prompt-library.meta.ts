import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "prompt-library",
  type: "registry:ui",
  title: "Prompt Library",
  description:
    "A shelf of saved prompts: search, filter by tag, pin favourites, and fill in the {{variables}} with labelled fields while a preview shows the finished text. Insert names anything missing; Copy puts it on the clipboard.",
  category: "ai",
  tags: ["ai", "prompts", "library", "templates", "variables", "snippets", "chat", "composer"],
  files: [{ path: "components/prompt-library.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "prompt-library-demo", title: "A support team's prompts", file: "prompt-library-demo.tsx" },
    { name: "prompt-library-small", title: "A short shelf", file: "prompt-library-small.tsx" },
  ],
  ai: {
    summary:
      "prompts is [{ id, title, body, description?, tags?, favourite? }] (required); put {{variable}} in body where a person fills something in. title. onInsert(text, prompt) gets the finished text and may be async (reject and the card says why); onFavourite(id, favourite) pins or unpins (shown at once, put back with the reason if it rejects). Insert is refused with 'Fill in: …' naming what is missing. Exports extractVariables and fillPrompt.",
    whenToUse: ["A set of reusable prompts a team shares, with blanks to fill in", "The panel next to a chat composer that inserts a prepared prompt"],
    whenNotToUse: ["Recent conversations; use a list of chats", "Comparing two versions of a prompt; use prompt-diff"],
    composesWith: ["message-actions", "prompt-diff", "ai-chat", "writing-assistant"],
    a11y: [
      { keys: "Search and tags", action: "A labelled search box; tags are toggle buttons with pressed state" },
      { keys: "List", action: "A list of buttons with pressed state; pinning is a separate toggle button named 'Pin <title>'" },
      { keys: "Variables", action: "Every variable gets a labelled field (underscores become spaces); an unfilled one is also shown dashed in the preview as {{name}}" },
      { keys: "Insert", action: "Refused with an alert that names what is missing, and the empty fields are marked invalid" },
      { keys: "Results", action: "'Inserted: …' and 'Copied' are announced politely; failures are alerts" },
    ],
    customization: ["prompts and title", "onInsert", "onFavourite"],
  },
  statesNone: "A presentational library: the prompts are passed in, so it has nothing of its own to load. A search with no match says so.",
  version: "1.0.0",
  updated: "2026-10-25",
})
