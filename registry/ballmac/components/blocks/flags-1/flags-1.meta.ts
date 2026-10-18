import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "flags-1",
  type: "registry:block",
  title: "Flags 1: feature flags manager",
  description:
    "A feature flags manager: a switch per environment, a production rollout slider, flags fully on for months marked ready to remove, a confirmation before changing production, and failed saves undone with the reason.",
  category: "blocks",
  blockCategory: "flags",
  tags: ["feature flags", "toggles", "rollout", "release", "environments", "launchdarkly", "experiments", "developer", "production"],
  files: [{ path: "components/blocks/flags-1/flags-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "alert-dialog", "button", "match-highlight", "skeleton", "slider", "state-view", "switch", "return-focus"],
  examples: [
    { name: "flags-1-demo", title: "Default", file: "flags-1-demo.tsx" },
    { name: "flags-1-open", title: "A rollout open", file: "flags-1-open.tsx" },
    { name: "flags-1-loading", title: "Loading", file: "flags-1-loading.tsx" },
    { name: "flags-1-empty", title: "No flags yet", file: "flags-1-empty.tsx" },
    { name: "flags-1-error", title: "Could not load", file: "flags-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "flags-1-loading", trigger: "state=\"loading\"", note: "Skeleton rows under the real heading, announced as loading." },
    { id: "empty", title: "No flags yet", example: "flags-1-empty", trigger: "state=\"empty\" (or flags={[]})", note: "Explains what a flag is; emptyState sets the copy and can add a button. A search with no match says so with Clear filters." },
    { id: "error", title: "Could not load", example: "flags-1-error", trigger: "state=\"error\"", note: "An alert saying nothing was changed, with Try again (onRetry). A change that fails to save is undone with its message under the flag." },
  ],
  ai: {
    summary:
      "A feature flags manager. <Flags1 flags={[{ id, key: 'checkout-v2', description, enabled: { dev, staging, production }, rollout: 0..100, rules: 'Staff, and the Beta group', owner, changedDays }]} onChange={(flag) => Promise} />. A flag is 'Ready to remove' when it is on in production at 100% and unchanged for 90 days or more. Changing Production asks first and says who it affects; other environments change at once. Reject onChange and the flag goes back with the message. Rollout moves in steps of 5 and needs Save.",
    whenToUse: ["An internal tool for releasing features gradually", "A settings area of a developer product with flags or toggles per environment"],
    whenNotToUse: ["A user's own preference switches (use settings-1)", "A/B test results (use experiments-1)"],
    composesWith: ["experiments-1", "webhooks-1", "dev-1", "app-shell-1"],
    a11y: [
      { keys: "Tab, Space", action: "Each switch is named for the flag and the environment ('checkout-v2 in Production'); the row's expand button says whether it is open" },
      { keys: "Production changes", action: "An alert dialog says exactly who is affected and returns focus to the switch you used when it closes" },
      { keys: "Rollout", action: "A labelled slider in steps of 5 with the value read aloud; nothing is applied until Save rollout" },
    ],
    customization: ["Keys and descriptions are highlighted when they match the search", "The filter buttons show how many flags each one holds, across all flags", "Keys are shown left to right in right-to-left layouts, like code"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
