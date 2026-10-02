import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "notification-center",
  type: "registry:ui",
  title: "Notification Center",
  description:
    "A bell with an unread badge that opens grouped notifications with All and Unread views, mark-as-read, dismiss, and an unread count in its accessible name.",
  category: "saas",
  tags: ["notifications", "inbox", "bell", "popover"],
  files: [{ path: "components/notification-center.tsx" }],
  dependencies: ["motion@^12", "lucide-react"],
  registryDependencies: ["shadcn:utils", "motion-presets", "popover", "i18n"],
  examples: [
    { name: "notification-center-demo", title: "Inbox", file: "notification-center-demo.tsx" },
    { name: "notification-center-states", title: "Empty", file: "notification-center-states.tsx" },
  ],
  ai: {
    summary:
      "notifications[] with {id,title,description,time,group,read,icon,href}. Handle onMarkRead, onMarkAllRead, onDismiss and onOpenItem in your own state.",
    whenToUse: ["App headers", "In-app activity and alerts"],
    whenNotToUse: ["Transient confirmations; use toast", "Long-form updates; use changelog-feed"],
    composesWith: ["popover", "avatar", "toast"],
    a11y: [
      { keys: "Enter / Space", action: "Opens the panel; Escape closes and restores focus" },
      { keys: "Screen readers", action: "The button announces the unread count; unread rows include 'Unread'; the list is a polite live region" },
      { keys: "Tab", action: "Row actions appear on hover and on keyboard focus" },
    ],
    customization: ["groups", "onOpenChange and open", "emptyText and label", "row icons"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
});
