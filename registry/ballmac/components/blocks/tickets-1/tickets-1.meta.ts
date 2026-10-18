import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "tickets-1",
  type: "registry:block",
  title: "Tickets 1: support ticket",
  description:
    "One support ticket as an agent sees it: replies and private notes, a reply timer, a composer that switches between Reply and Internal note with canned replies, and a side panel for the customer, assignee, status and priority.",
  category: "blocks",
  blockCategory: "tickets",
  tags: ["tickets", "support", "helpdesk", "customer service", "conversation", "sla", "internal notes", "canned replies", "inbox"],
  files: [{ path: "components/blocks/tickets-1/tickets-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "cover-art", "select", "skeleton", "state-view", "textarea"],
  examples: [
    { name: "tickets-1-demo", title: "A reply is due", file: "tickets-1-demo.tsx" },
    { name: "tickets-1-late", title: "Reply is late", file: "tickets-1-late.tsx" },
    { name: "tickets-1-failed", title: "A message that failed", file: "tickets-1-failed.tsx" },
    { name: "tickets-1-loading", title: "Loading", file: "tickets-1-loading.tsx" },
    { name: "tickets-1-empty", title: "Ticket not found", file: "tickets-1-empty.tsx" },
    { name: "tickets-1-error", title: "Could not load", file: "tickets-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "tickets-1-loading", trigger: "state=\"loading\"", note: "A skeleton conversation and side panel, announced as loading." },
    { id: "empty", title: "Ticket not found", example: "tickets-1-empty", trigger: "state=\"empty\"", note: "Says the ticket may have been merged or deleted; emptyState sets the copy and can add a link back." },
    { id: "error", title: "Could not load", example: "tickets-1-error", trigger: "state=\"error\"", note: "An alert saying nothing was changed, with Try again (onRetry). A message that fails to send stays in the thread with Not sent and Retry." },
  ],
  ai: {
    summary:
      "A support ticket. <Tickets1 ticket={{ id, number, subject, status: 'open' | 'pending' | 'solved', priority: 'low' | 'normal' | 'high' | 'urgent', assignee, tags, replyDueAt: ISO, requester: { name, email, plan, location, since }, messages: [{ id, from: 'customer' | 'agent' | 'note', author, time, body }] }} agents cannedReplies now='2026-10-18T10:42:00Z' me onSend={({ kind: 'reply' | 'note', body }) => Promise} onStatusChange onPriorityChange onAssign />. The reply timer shows only while the last message is from the customer; it says time left, or how late. A sent reply sets the status to Waiting on customer. Reject onSend and the message stays with Retry. Pass now yourself; the block never reads the clock.",
    whenToUse: ["A helpdesk or support tool's ticket view", "An internal request or approval thread with private notes"],
    whenNotToUse: ["A live chat widget (use chat-1)", "A public help center (use help-1)"],
    composesWith: ["inbox-1", "app-shell-1", "help-1", "directory-1"],
    a11y: [
      { keys: "Tab, Ctrl or Command + Enter", action: "Reply and Internal note are tabs; the composer sends with the button or the shortcut, and the field is named for what it will do" },
      { keys: "Notes", action: "Private notes are dashed, tinted and say 'Internal note, only your team sees this' in words, so they are never mistaken for a reply" },
      { keys: "Timer", action: "'Reply due in 48 min' or 'Reply is 35 min late' is a live region with an icon, not only a color" },
    ],
    customization: ["Messages you send appear at once with Sending, then settle; a failure shows Not sent and Retry in place", "Canned replies insert into the draft without replacing it", "Your messages sit on the reading end and mirror in right-to-left"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
