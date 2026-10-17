import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "inbox-1",
  type: "registry:block",
  title: "Inbox 1: notifications page",
  description:
    "A notifications page grouped by day: unread marked by an accent, mentions and comments with excerpts, requests answered inline (Approve, Deny, Accept, Decline), keyboard triage and an Undo bar after archiving.",
  category: "blocks",
  blockCategory: "notifications",
  tags: ["notifications", "inbox", "activity", "alerts", "mentions", "unread", "archive", "approvals", "triage", "keyboard"],
  files: [{ path: "components/blocks/inbox-1/inbox-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "blur-fade", "button", "kbd", "segmented-control", "skeleton", "state-view"],
  examples: [
    { name: "inbox-1-demo", title: "Default", file: "inbox-1-demo.tsx" },
    { name: "inbox-1-mentions", title: "Mentions only", file: "inbox-1-mentions.tsx" },
    { name: "inbox-1-empty", title: "All caught up", file: "inbox-1-empty.tsx" },
    { name: "inbox-1-loading", title: "Loading", file: "inbox-1-loading.tsx" },
    { name: "inbox-1-error", title: "Could not load", file: "inbox-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "inbox-1-loading", trigger: "state=\"loading\"", note: "Skeleton notifications under the real heading, announced as loading; the filter and Mark all as read are disabled." },
    { id: "empty", title: "All caught up", example: "inbox-1-empty", trigger: "state=\"empty\" (or nothing in the chosen view)", note: "A friendly message that changes with the view (all, unread, mentions); emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "inbox-1-error", trigger: "state=\"error\"", note: "An alert saying nothing was lost, with Try again (onRetry)." },
  ],
  ai: {
    summary:
      "A notifications page. <Inbox1 items={[{ id, kind: 'mention' | 'comment' | 'approval' | 'invite' | 'system' | 'billing', actor, action, target, preview, day, time, unread, actions: { primary, secondary }, outcome }]} onOpen onMarkRead onArchive onRestore onMarkAllRead onAction onSettings />. Items render as \"<b>actor</b> action <b>target</b>\"; give a system item only an action. Answering an inline request shows its outcome at once.",
    whenToUse: ["The full page behind a notification bell", "Mentions, comments and requests that people answer without opening each one"],
    whenNotToUse: ["A dropdown from a bell (use notification-center)", "Email-style threads (use mail-1)", "Notification preferences (use settings-2)"],
    composesWith: ["app-shell-1", "settings-2", "agent-2", "chat-1"],
    a11y: [
      { keys: "J / K or Down / Up", action: "Moves between notifications; each is one button whose name starts with Unread and its kind" },
      { keys: "E / U on a notification", action: "Archives it (with Undo) / marks it read or unread; every change is announced politely" },
      { keys: "Tab", action: "Inline Approve and Deny sit after the notification; hover actions appear on focus and are always visible on touch screens" },
    ],
    customization: ["title; defaultTab: 'all' | 'unread' | 'mentions'", "day groups items in the order you pass them, so sort newest first", "Wire onAction to your approval or invitation API; the outcome text is Approved, Denied, Accepted or Declined"],
  },
  version: "1.0.0",
  updated: "2026-10-17",
})
