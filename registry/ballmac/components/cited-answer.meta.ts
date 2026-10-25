import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "cited-answer",
  type: "registry:ui",
  title: "Cited Answer",
  description:
    "An AI answer you can check: numbers in the text are buttons that light up every claim a source supports and open its excerpt, and the source list works the other way round. Says how many sentences are cited.",
  category: "ai",
  tags: ["ai", "chat", "citations", "sources", "rag", "answer", "grounding", "trust"],
  files: [{ path: "components/cited-answer.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n", "citation"],
  examples: [
    { name: "cited-answer-demo", title: "A support answer with three sources", file: "cited-answer-demo.tsx" },
    { name: "cited-answer-single", title: "One source", file: "cited-answer-single.tsx" },
  ],
  ai: {
    summary:
      "paragraphs is string[]; write [1] or [2, 3] after a claim to cite sources by their position in sources ({ title, url, site?, date?, snippet?, favicon? } as in citation). question shows above. showCoverage (default true) adds 'N of M sentences are cited'. Choosing or hovering a number, or a source row, highlights every claim that source supports and opens its snippet; Escape clears. Unknown numbers are ignored.",
    whenToUse: ["A RAG or search answer where people need to see where each claim came from", "Support and research assistants that must be checkable"],
    whenNotToUse: ["A plain chat reply with no sources; use ai-message", "Checking claims against sources automatically; use citation-coverage"],
    composesWith: ["message-actions", "sources-list", "citation", "citation-coverage"],
    a11y: [
      { keys: "Numbers", action: "Buttons named 'Source n: title' with pressed state; they work with Enter and Space and show focus" },
      { keys: "Sources", action: "Each row is a button naming the source and how often it is cited; a separate link opens it" },
      { keys: "Highlight", action: "Announced politely ('Highlighting 2 claims from …'); Escape clears; cited claims are underlined as well as tinted" },
      { keys: "Coverage", action: "The count of cited sentences is text, not only a bar" },
    ],
    customization: ["paragraphs and sources", "question", "showCoverage"],
  },
  statesNone: "A presentational answer: the text and sources are passed in, so it has nothing of its own to load.",
  version: "1.0.0",
  updated: "2026-10-25",
})
