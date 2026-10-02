import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "citation",
  type: "registry:ui",
  title: "Citation",
  description:
    "An inline source marker for AI answers, as a numbered chip or a site pill. Hover or focus opens a preview card with title, excerpt and link, and a pager when one claim has several sources.",
  category: "ai",
  tags: ["ai", "citation", "source", "reference", "hover"],
  files: [{ path: "components/citation.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "hover-card", "i18n"],
  examples: [
    { name: "citation-demo", title: "Numbered markers in an answer", file: "citation-demo.tsx" },
    { name: "citation-pill", title: "Site pills with several sources", file: "citation-pill.tsx" },
  ],
  ai: {
    summary:
      "Place <Citation index={1} sources={{ title, url, snippet }} /> right after the claim. Pass an array for several sources. variant is number | pill. The marker is a real link, so touch users open the page directly. Also exports SourceFavicon and hostOf.",
    whenToUse: ["Answers grounded in web or document sources", "Footnotes that should not pull the reader away from the text"],
    whenNotToUse: ["A full list of references; use sources-list", "Tooltips with no link; use tooltip"],
    composesWith: ["sources-list", "ai-message", "hover-card"],
    a11y: [
      { keys: "Tab", action: "Focuses the marker and opens its card" },
      { keys: "Enter", action: "Opens the source in a new tab" },
      { keys: "Screen readers", action: "Named 'Source 1: Title', with 'and 2 more' for grouped sources" },
    ],
    customization: ["variant", "index", "sources as one or many", "favicon url (monogram by default, nothing is fetched)"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
})
