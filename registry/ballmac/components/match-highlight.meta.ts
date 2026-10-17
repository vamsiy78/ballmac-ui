import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "match-highlight",
  type: "registry:ui",
  title: "Match Highlight",
  description:
    "Text with the words of a search marked, as search results show them: real mark elements in a theme tint that stays readable in light and dark, plus helpers that split a query and test whether text matches it.",
  category: "text",
  tags: ["search", "highlight", "mark", "results", "query", "autocomplete", "snippet"],
  files: [{ path: "components/match-highlight.tsx" }],
  dependencies: [],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "match-highlight-demo", title: "Marked matches", file: "match-highlight-demo.tsx" },
    { name: "match-highlight-live", title: "Type to search", file: "match-highlight-live.tsx" },
  ],
  statesNone: "A display of text: nothing to load, submit or fail.",
  ai: {
    summary:
      "<MatchHighlight text={result.title} query={query} /> marks every occurrence of every word of the query, ignoring case. queryTokens(query) gives the words, matchesAll(text, query) tests that all of them occur, countMatches(text, query) counts occurrences for ranking. No \"use client\": it works in server components.",
    whenToUse: ["Search results, suggestions and autocomplete rows", "Showing why an item matched a filter"],
    whenNotToUse: ["Syntax highlighting of code (use code-block)", "A hand-drawn emphasis mark on a phrase (use highlighter)"],
    composesWith: ["search-field", "command", "help-1", "search-1"],
    a11y: [{ keys: "None", action: "Uses <mark>, which assistive technology can announce; the tint is chosen so the text keeps its contrast." }],
    customization: ["className sets the look of the wrapper; to change the tint, copy the file and edit the mark's classes", "query can be a string or a list of words, so you can pass your own tokens"],
  },
  version: "1.0.0",
  updated: "2026-10-17",
})
