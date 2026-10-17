import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "settings-4",
  type: "registry:block",
  title: "Settings 4: integrations directory",
  description:
    "An integrations page: search, category filters, connected ones first, Connect with progress and the reason when it fails, Manage, Disconnect after a confirmation, coming-soon entries and a request link.",
  category: "blocks",
  blockCategory: "settings",
  tags: ["settings", "integrations", "apps", "connect", "marketplace", "directory", "oauth"],
  files: [{ path: "components/blocks/settings-4/settings-4.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "alert-dialog", "badge", "button", "skeleton", "state-view"],
  examples: [
    { name: "settings-4-demo", title: "Default", file: "settings-4-demo.tsx" },
    { name: "settings-4-loading", title: "Loading", file: "settings-4-loading.tsx" },
    { name: "settings-4-empty", title: "No integrations", file: "settings-4-empty.tsx" },
    { name: "settings-4-error", title: "Could not load", file: "settings-4-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "settings-4-loading", trigger: "state=\"loading\"", note: "Skeleton cards; search and the category filter are disabled." },
    { id: "empty", title: "No integrations", example: "settings-4-empty", trigger: "state=\"empty\" (or integrations={[]})", note: "A clear message; emptyState can add an action. A search with no matches says so in place." },
    { id: "error", title: "Could not load", example: "settings-4-error", trigger: "state=\"error\"", note: "An alert with Try again (onRetry). A failed Connect shows its reason on that card instead." },
  ],
  ai: {
    summary:
      "An integrations directory. <Settings4 integrations={[{ id, name, description, category, icon, connected, account, comingSoon }]} onConnect={async (id) => accountName} onDisconnect onManage onRequest />. Throw from onConnect to show the reason on the card; categories come from the data.",
    whenToUse: ["The Integrations or Apps page of a SaaS product", "Connecting OAuth apps from settings"],
    whenNotToUse: ["A marketing page that shows logos of integrations (use features-3 or logo-cloud-1)", "API keys and webhooks for developers (use api-key-field and webhook-card)"],
    composesWith: ["app-shell-1", "settings-1", "settings-3"],
    a11y: [
      { keys: "Tab", action: "Category filters are toggle buttons; each card's buttons name their integration" },
      { keys: "Disconnect", action: "An alert dialog confirms first; focus returns to the page" },
      { keys: "Connect", action: "\"Connected\" or the failure reason is announced" },
    ],
    customization: ["title, description", "Integration icons are any node: your brand marks or lucide icons", "Connect usually opens an OAuth popup: resolve when it closes successfully"],
  },
  version: "1.0.0",
  updated: "2026-10-17",
})
