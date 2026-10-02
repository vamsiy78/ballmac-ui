import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "notification-stack",
  type: "registry:ui",
  title: "Notification Stack",
  description:
    "macOS Notification Center cards: collapsed, the newest sits in front with two peeking behind; click or press Enter to spring the stack open. New cards slide in from the top; each can be dismissed.",
  category: "macos",
  featured: true,
  tags: ["notifications", "toast", "stack", "macos", "notification center", "motion", "vibrancy"],
  files: [{ path: "components/notification-stack.tsx" }],
  dependencies: ["motion@^12", "lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [{ name: "notification-stack-demo", title: "Notification Center", file: "notification-stack-demo.tsx" }],
  ai: {
    summary:
      "Render <NotificationStack> with <Notification key icon iconClassName title time onDismiss>body</Notification> children, newest first. Keep items in state; prepend to add (animates in), filter to dismiss. expanded/defaultExpanded/onExpandedChange control the stack; onClearAll adds a clear button.",
    whenToUse: [
      "An activity or notification feed in a dashboard corner",
      "A landing-page hero showing the alerts a product sends (deploys, reviews, payments)",
      "Grouping several recent events so they take the space of one",
    ],
    whenNotToUse: [
      "Transient feedback after a single action (use a toast)",
      "A single live activity that changes over time (use dynamic-island)",
    ],
    composesWith: ["dynamic-island", "mac-window"],
    a11y: [
      { keys: "Tab", action: "Focuses the stack's expand button when collapsed, or each card's dismiss button and Show less when expanded" },
      { keys: "Enter / Space", action: "Expands the collapsed stack (focus moves to Show less) or activates the focused button" },
      { keys: "Escape", action: "Collapses an expanded stack and returns focus to it" },
    ],
    customization: [
      "expanded / defaultExpanded / onExpandedChange: controlled or uncontrolled",
      "label: heading and region name (default Notifications); onClearAll shows clear buttons",
      "Notification: icon + iconClassName (tile background), title, time, children (body, clamped to 2 lines), onDismiss, dismissLabel",
      "Peeking cards are inert and hidden from assistive tech until the stack expands",
    ],
  },
  version: "1.0.1",
  updated: "2026-09-29",
})
