import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "sources-list",
  type: "registry:ui",
  title: "Sources List",
  description:
    "The 'Used N sources' footer of an AI answer: a stack of site icons that opens a numbered list or card grid, with show-all, a highlighted row for hover sync and stable row ids.",
  category: "ai",
  tags: ["ai", "sources", "references", "citations", "disclosure"],
  files: [{ path: "components/sources-list.tsx" }],
  dependencies: ["motion@^12", "lucide-react", "radix-ui"],
  registryDependencies: ["shadcn:utils", "citation"],
  examples: [
    { name: "sources-list-demo", title: "Collapsible list", file: "sources-list-demo.tsx" },
    { name: "sources-list-cards", title: "Always-open cards", file: "sources-list-cards.tsx" },
  ],
  ai: {
    summary:
      "sources is the array used by citations, in order. variant is list | cards. collapsible={false} keeps it open. highlight={n} emphasizes row n, and each row has id `${idPrefix}-${n}` so a citation can link to it.",
    whenToUse: ["The end of a grounded answer", "A side panel of everything the assistant read"],
    whenNotToUse: ["Inline markers; use citation", "Generic link lists"],
    composesWith: ["citation", "ai-message", "collapsible"],
    a11y: [
      { keys: "Enter / Space", action: "Opens or closes the list from its header" },
      { keys: "Tab", action: "Moves through the source links" },
      { keys: "Screen readers", action: "An ordered list named Sources; each link reads 'Source 2: Title'" },
    ],
    customization: ["variant", "visibleCount", "highlight", "idPrefix", "open / defaultOpen / onOpenChange"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
})
