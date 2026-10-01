import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "mail-1",
  type: "registry:block",
  title: "Mail 1: three-pane inbox",
  description: "A working inbox: folders with an unread count, a searchable message list with stars and keyboard navigation, a reading pane with archive, delete, mark unread and reply, and a compose dialog. One pane at a time on phones.",
  category: "blocks",
  blockCategory: "mail",
  tags: ["mail", "inbox", "email", "three pane", "messages", "compose", "reply"],
  files: [{ path: "components/blocks/mail-1/mail-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "avatar", "button", "dialog", "input", "search-field", "select", "textarea"],
  examples: [
    { name: "mail-1-demo", title: "Default", file: "mail-1-demo.tsx" },
    { name: "mail-1-empty", title: "Empty inbox", file: "mail-1-empty.tsx" },
  ],
  ai: {
    summary: "An email client UI. Pass messages=[{ id, folder, from, subject, body[], time, unread?, starred?, attachments? }], me and onSend(to, subject, body); archive, delete, star, read state, search and reply are handled in state.",
    whenToUse: ["Webmail, support inboxes and notification centres", "A realistic product screenshot"],
    whenNotToUse: ["Chat (use ai-chat-2 or the chat components)"],
    composesWith: ["app-shell-1", "kanban-1", "calendar-1"],
    a11y: [
      { keys: "Arrow Up / Down or J / K", action: "Moves focus between messages; Enter or Space opens one" },
      { keys: "Unread", action: "Unread messages say 'Unread' to screen readers as well as being bold with a dot" },
      { keys: "Actions", action: "Archive, delete and mark-unread results are announced politely" },
    ],
    customization: ["messages, me, height", "onSend(to, subject, body)", "folders are inbox, sent and archive plus Starred"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
