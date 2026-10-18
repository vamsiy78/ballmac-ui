import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "dev-1",
  type: "registry:block",
  title: "Dev 1: developers page",
  description:
    "A developers page: a 14-day request chart with errors stacked, success rate and median time, API keys shown in full once and revoked behind a confirmation, and a request log with filter, responses and copy as curl.",
  category: "blocks",
  blockCategory: "developer",
  tags: ["developer", "api", "api keys", "request log", "usage", "test mode", "live mode", "curl", "logs", "dashboard", "platform"],
  files: [{ path: "components/blocks/dev-1/dev-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "alert-dialog", "badge", "blur-fade", "button", "copy-button", "json-viewer", "number-ticker", "segmented-control", "skeleton", "state-view", "return-focus"],
  examples: [
    { name: "dev-1-demo", title: "Default (test mode)", file: "dev-1-demo.tsx" },
    { name: "dev-1-live", title: "Live mode, a failed request open", file: "dev-1-live.tsx" },
    { name: "dev-1-empty", title: "No requests yet", file: "dev-1-empty.tsx" },
    { name: "dev-1-loading", title: "Loading", file: "dev-1-loading.tsx" },
    { name: "dev-1-error", title: "Could not load", file: "dev-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "dev-1-loading", trigger: "state=\"loading\"", note: "A skeleton of the usage chart, the keys and the request log under the real heading." },
    { id: "empty", title: "No requests yet", example: "dev-1-empty", trigger: "state=\"empty\" (or requests={[]})", note: "Explains that requests appear within seconds and gives a ready curl command to make the first one, with a copy button." },
    { id: "error", title: "Could not load", example: "dev-1-error", trigger: "state=\"error\"", note: "An alert saying keys are safe and nothing changed, with Try again (onRetry)." },
  ],
  ai: {
    summary:
      "A developer dashboard page. <Dev1 keys={[{ id, name, scope: 'read' | 'write' | 'admin', last4, created, lastUsed }]} usage={{ days: [{ label, ok, errors }], p50 }} requests={[{ id, method, path, status, ms, time, ip, keyName, response }]} baseUrl onCreateKey={async ({ name, scope, env }) => ({ id, secret })} onRevokeKey onEnvChange defaultEnv />. The secret returned by onCreateKey is shown once in a copy banner and only its last four characters are kept in the list.",
    whenToUse: ["The developer or API section of a platform product", "Letting customers manage keys and debug requests themselves"],
    whenNotToUse: ["Showing one secret in a settings form (use api-key-field)", "Webhook endpoints and deliveries (use webhook-card)", "Server logs for operators (use log-stream)"],
    composesWith: ["settings-4", "settings-5", "app-shell-1", "agent-3"],
    a11y: [
      { keys: "Chart", action: "An image with a text summary, plus a hidden table with the numbers for each day; bars never carry meaning by color alone" },
      { keys: "Create key", action: "The new key is announced and shown in an alert with a Copy button; Revoke asks first in an alert dialog" },
      { keys: "Enter / Space on a request", action: "Opens its response (aria-expanded); status is an icon, the number and words, not color alone" },
    ],
    customization: ["baseUrl for the curl commands; defaultEnv: 'test' | 'live' (live shows a warning and sk_live_ prefixes)", "onCreateKey must call your backend: the secret must never be derivable on the client", "defaultOpenRequest opens a request at first"],
  },
  version: "1.0.0",
  updated: "2026-10-17",
})
