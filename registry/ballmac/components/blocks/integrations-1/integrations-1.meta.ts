import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "integrations-1",
  type: "registry:block",
  title: "Integrations 1: directory",
  description:
    "A public integrations directory: search that highlights matches, category filters with counts, cards showing what is connected, and a side sheet with what it does and a Connect button that handles waiting and failure.",
  category: "blocks",
  blockCategory: "integrations",
  tags: ["integrations", "marketplace", "apps", "directory", "connect", "plugins", "partners", "ecosystem"],
  files: [{ path: "components/blocks/integrations-1/integrations-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "badge", "button", "cover-art", "match-highlight", "sheet", "skeleton", "state-view"],
  examples: [
    { name: "integrations-1-demo", title: "Default", file: "integrations-1-demo.tsx" },
    { name: "integrations-1-open", title: "Details open", file: "integrations-1-open.tsx" },
    { name: "integrations-1-loading", title: "Loading", file: "integrations-1-loading.tsx" },
    { name: "integrations-1-empty", title: "No integrations", file: "integrations-1-empty.tsx" },
    { name: "integrations-1-error", title: "Could not load", file: "integrations-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "integrations-1-loading", trigger: "state=\"loading\"", note: "Skeleton cards under the real heading, announced as loading." },
    { id: "empty", title: "No integrations", example: "integrations-1-empty", trigger: "state=\"empty\" (or integrations={[]})", note: "Explains that integrations appear here when added; emptyState sets the copy and can add a button. A search with no match says so with a Clear filters button." },
    { id: "error", title: "Could not load", example: "integrations-1-error", trigger: "state=\"error\"", note: "An alert with Try again (onRetry). A failed connect shows its message in the sheet." },
  ],
  ai: {
    summary:
      "An integrations directory. <Integrations1 integrations={[{ id, name, category, summary, description, features: [], badge: 'Popular' | 'New' | 'Beta', connected, docsHref }]} onConnect={(item) => Promise} onDisconnect defaultOpenId />. Categories come from the data and show counts for the current search. Reject onConnect to show its message in the sheet.",
    whenToUse: ["A marketing page listing what the product connects to", "An in-app integrations settings page"],
    whenNotToUse: ["A row of partner logos (use logo-cloud-1)", "Step-by-step setup of one connection (use a wizard)"],
    composesWith: ["hero-1", "logo-cloud-1", "cta-1", "settings-1", "footer-1"],
    a11y: [
      { keys: "Tab", action: "Search, category buttons (pressed state announced), then each card as one button" },
      { keys: "Enter / Space", action: "Open the details sheet; Escape closes it and focus returns to the card" },
      { keys: "Connected", action: "Shown with a check and the word Connected, not only by color; changes are announced" },
    ],
    customization: ["Pictures are drawn from the name, so no logos are needed to look finished", "Category counts follow the search", "The sheet slides in from the reading end and mirrors in right-to-left"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
