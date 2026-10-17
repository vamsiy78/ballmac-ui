import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "help-1",
  type: "registry:block",
  title: "Help 1: help center home",
  description:
    "A help center home: a hero search that suggests articles as you type with highlighted matches, topic cards that light up under the pointer, popular articles, and ways to reach a person with who is online.",
  category: "blocks",
  blockCategory: "help",
  tags: ["help center", "support", "knowledge base", "docs", "search", "faq", "categories", "contact", "self-serve"],
  files: [{ path: "components/blocks/help-1/help-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "blur-fade", "button", "cover-art", "dot-pattern", "kbd", "match-highlight", "skeleton", "spotlight-card", "state-view"],
  examples: [
    { name: "help-1-demo", title: "Default", file: "help-1-demo.tsx" },
    { name: "help-1-searching", title: "Searching", file: "help-1-searching.tsx" },
    { name: "help-1-no-results", title: "Nothing found", file: "help-1-no-results.tsx" },
    { name: "help-1-loading", title: "Loading", file: "help-1-loading.tsx" },
    { name: "help-1-empty", title: "No guides yet", file: "help-1-empty.tsx" },
    { name: "help-1-error", title: "Could not load", file: "help-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "help-1-loading", trigger: "state=\"loading\"", note: "Skeleton topic cards and article rows under the real heading; search is disabled." },
    { id: "empty", title: "No guides yet", example: "help-1-empty", trigger: "state=\"empty\" (or categories={[]})", note: "Says guides will be listed here; emptyState sets the copy. The contact strip stays." },
    { id: "error", title: "Could not load", example: "help-1-error", trigger: "state=\"error\"", note: "An alert with Try again (onRetry). The hero and the contact strip stay, so people can still reach you." },
  ],
  ai: {
    summary:
      "A help center home. <Help1 categories={[{ id, title, description, icon, count, href }]} articles={[{ id, title, summary, categoryId, minutes, href, popular }]} suggestions={['Reset password']} channels={[{ id, label, description, icon, online, action, href }]} onOpenArticle onOpenCategory onContact onSearch />. Search runs in the browser over title and summary; pass onSearch to log queries or fetch your own results.",
    whenToUse: ["The front page of a help center or knowledge base", "Self-serve support before people contact you"],
    whenNotToUse: ["A short list of questions (use faq-1)", "A documentation site's navigation (use sidebar and command)", "A contact form (use contact-1)"],
    composesWith: ["header-2", "footer-2", "faq-1", "contact-1"],
    a11y: [
      { keys: "/", action: "Jumps to the search from anywhere on the page, unless you are typing in a field" },
      { keys: "Up / Down, Enter, Escape in the search", action: "Chooses a suggestion, opens it, and closes the list (then clears the box); the result count is announced" },
      { keys: "Tab", action: "Each topic card and popular article is one link with a single tab stop" },
    ],
    customization: [
      "title, description, suggestions, channels (set online to show the green dot and \"Online\" for screen readers)",
      "defaultQuery opens the search with a query already typed",
      "Search matches every word in an article's title or summary and lists title matches first; replace it with your own search through onSearch",
    ],
  },
  version: "1.0.0",
  updated: "2026-10-17",
})
