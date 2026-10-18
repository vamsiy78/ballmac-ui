import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "settings-6",
  type: "registry:block",
  title: "Settings 6: data and privacy",
  description:
    "A data and privacy page: request an export in JSON or CSV and watch it prepare, set how long messages are kept, and delete the account behind a typed confirmation with a grace period you can cancel.",
  category: "blocks",
  blockCategory: "settings",
  tags: ["settings", "privacy", "gdpr", "data export", "delete account", "retention", "compliance", "download my data", "account"],
  files: [{ path: "components/blocks/settings-6/settings-6.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "alert-dialog", "button", "checkbox", "input", "progress", "segmented-control", "select", "skeleton", "state-view", "switch"],
  examples: [
    { name: "settings-6-demo", title: "Default", file: "settings-6-demo.tsx" },
    { name: "settings-6-deleting", title: "Deletion scheduled", file: "settings-6-deleting.tsx" },
    { name: "settings-6-loading", title: "Loading", file: "settings-6-loading.tsx" },
    { name: "settings-6-error", title: "Could not load", file: "settings-6-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "settings-6-loading", trigger: "state=\"loading\"", note: "Skeleton cards under the real heading, announced as loading." },
    { id: "error", title: "Could not load", example: "settings-6-error", trigger: "state=\"error\"", note: "An alert saying nothing was changed, with Try again (onRetry). Failed requests show their message in place." },
  ],
  ai: {
    summary:
      "A data and privacy settings page. <Settings6 email exports={[{ id, requested, contents, format: 'json' | 'csv', status: 'preparing' | 'ready' | 'failed' | 'expired', progress, size, expires }]} onRequestExport={({ scope, format }) => Promise} onDownload retention='30d' | '1y' | 'forever' onRetentionChange analytics onAnalyticsChange deletionDate onDeleteAccount onCancelDeletion />. Reject a promise to show its message in place. Without onRequestExport, a request is simulated so a demo shows the whole path.",
    whenToUse: ["Privacy and data-rights pages (GDPR/CCPA access and erasure)", "The danger zone of any account settings"],
    whenNotToUse: ["Cookie choices on first visit (use cookie-consent)", "Who changed what in the workspace (use settings-5)"],
    composesWith: ["settings-1", "settings-5", "app-shell-1"],
    a11y: [
      { keys: "Tab", action: "Checkboxes, format, request, then each export's download; every control has a visible label" },
      { keys: "Delete", action: "An alert dialog; the confirm button stays disabled until the email is typed exactly, focus returns to Delete account when it closes" },
      { keys: "Progress", action: "Each preparing export has a labelled progress bar and a percentage in text" },
    ],
    customization: ["Requests, deletion and cancelling are all async; reject to show a message", "deletionDate set from the server shows the scheduled state with a way back", "Retention and analytics are controlled with value and onChange props"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
