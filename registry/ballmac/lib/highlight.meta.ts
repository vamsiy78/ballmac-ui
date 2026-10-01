import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "highlight",
  type: "registry:lib",
  title: "Highlight",
  description:
    "A small dependency-free tokenizer for the snippets developer UIs show: JSON, shell and curl, JavaScript and TypeScript, Python, Go, HTTP and .env, with theme-aware token colors.",
  category: "foundation",
  tags: ["syntax highlighting", "tokenizer", "code", "snippet"],
  files: [{ path: "lib/highlight.ts" }],
  ai: {
    summary:
      "Import highlightLines(code, language) from @/lib/ballmac/highlight to get tokens grouped by line, and map each token to tokenClass[token.type]. languageFromName('app.ts') picks a language from a file name or label. Not a full grammar: use Shiki for exact highlighting of large files.",
    whenToUse: ["Showing short request examples, logs and config without shipping a highlighter", "Server or client rendering with no async loading"],
    whenNotToUse: ["Editors or long source files that need exact grammar (use Shiki)", "Languages outside the list"],
    customization: ["tokenClass: change the Tailwind classes per token type", "language: json | bash | javascript | typescript | python | go | http | env | text"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
