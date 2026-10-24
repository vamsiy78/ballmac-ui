import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "citation-coverage",
  type: "registry:ui",
  title: "Citation Coverage",
  description:
    "An AI answer shown claim by claim: a coverage meter, claims with no source underlined and marked in words, numbered source markers, selecting a claim to light up its sources and quote, and a switch to see only the gaps.",
  category: "ai",
  tags: ["ai", "citations", "sources", "rag", "grounding", "trust", "verification"],
  files: [{ path: "components/citation-coverage.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "citation-coverage-demo", title: "An answer with gaps", file: "citation-coverage-demo.tsx" },
    { name: "citation-coverage-full", title: "Fully sourced", file: "citation-coverage-full.tsx" },
  ],
  ai: {
    summary:
      "claims is [{ id, text, sources: number[] }] in reading order (empty sources means unsupported); sources is [{ id, title, url?, quote? }]. selected / defaultSelected / onSelectedChange pick a claim. Computes the coverage percentage itself.",
    whenToUse: ["Showing people how much of an AI answer is grounded in sources", "A review screen where unsupported claims need checking"],
    whenNotToUse: ["Plain inline citations in a chat message; use citation and sources-list", "A list of documents only; use sources-list"],
    composesWith: ["citation", "sources-list", "ai-message", "streaming-text"],
    a11y: [
      { keys: "Tab, Enter / Space", action: "Each claim is a toggle button; selecting it shows its sources and quote" },
      { keys: "Screen readers", action: "An unsupported claim reads '(no source)'; source markers read 'source 2'; the summary and the filtered answer are polite live regions" },
      { keys: "Colour", action: "Gaps are marked by a wavy underline and words, never colour alone" },
    ],
    customization: ["claims and sources", "Controlled selection", "The coverage meter and the gaps filter are built in"],
  },
  statesNone: "A presentational review: the claims and sources are passed in, so it has nothing of its own to load or fail.",
  version: "1.0.0",
  updated: "2026-10-24",
})
