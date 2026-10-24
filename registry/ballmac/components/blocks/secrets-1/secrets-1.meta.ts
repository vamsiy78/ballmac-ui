import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "secrets-1",
  type: "registry:block",
  title: "Secrets 1: secrets inventory",
  description:
    "An inventory of secrets that never shows a value: name, environment, owner, what reads it, when it was last read and how long since it changed, old ones called out in words, search, filters and Rotate behind a confirmation.",
  category: "blocks",
  blockCategory: "secrets",
  tags: ["secrets", "rotation", "credentials", "api keys", "security", "vault", "environment variables", "compliance"],
  files: [{ path: "components/blocks/secrets-1/secrets-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "alert-dialog", "button", "match-highlight", "skeleton", "state-view", "return-focus"],
  examples: [
    { name: "secrets-1-demo", title: "Default", file: "secrets-1-demo.tsx" },
    { name: "secrets-1-fresh", title: "All recent", file: "secrets-1-fresh.tsx" },
    { name: "secrets-1-loading", title: "Loading", file: "secrets-1-loading.tsx" },
    { name: "secrets-1-empty", title: "No secrets yet", file: "secrets-1-empty.tsx" },
    { name: "secrets-1-error", title: "Could not load", file: "secrets-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "secrets-1-loading", trigger: "state=\"loading\"", note: "Skeleton rows under the real heading, announced as loading." },
    { id: "empty", title: "No secrets yet", example: "secrets-1-empty", trigger: "state=\"empty\"", note: "Says no secrets yet; emptyState sets the copy. A search or filter with no match says so." },
    { id: "error", title: "Could not load", example: "secrets-1-error", trigger: "state=\"error\"", note: "An alert saying nothing was rotated or changed, with Try again (onRetry). A rotation that fails leaves the secret as it was and says why." },
  ],
  ai: {
    summary:
      "A secrets inventory. <Secrets1 secrets={[{ id, name: 'STRIPE_SECRET_KEY', environment: 'production' | 'staging' | 'development', owner, rotatedDays, lastUsed, usedBy? }]} maxAgeDays={90} onRotate={(secret) => Promise} />. It never takes or shows a secret value. A secret not changed for maxAgeDays or more is called out in words; Rotate opens a confirmation that says what happens, then shows the secret as changed today.",
    whenToUse: ["A security or platform page listing every credential and its age", "A rotation checklist for a compliance review"],
    whenNotToUse: ["Editing or revealing values; this is deliberately read-only", "API keys for your own users; use api-key-field"],
    composesWith: ["audit-1", "access-1", "settings-1", "alerts-1"],
    a11y: [
      { keys: "List", action: "Each secret is a list item with its name in code (left to right), environment, owner and age in text" },
      { keys: "Old secrets", action: "Written as 'Not changed for 214 days · due for rotation' with an icon, never colour alone" },
      { keys: "Rotate", action: "A button named for the secret and environment that opens an alert dialog and returns focus when closed" },
      { keys: "Filters", action: "A labelled search and select, and a toggle for the order; the count is a polite announcement" },
    ],
    customization: ["maxAgeDays", "secrets and their owners", "onRotate; reject and the secret stays as it was"],
  },
  version: "1.0.0",
  updated: "2026-10-24",
})
