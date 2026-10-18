import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "comments-1",
  type: "registry:block",
  title: "Comments 1: threaded discussion",
  description:
    "A threaded discussion: a composer where @ offers people, replies, emoji reactions that count and toggle, editing and deleting your own, resolving a thread, and a comment that appears at once and stays with Retry if it cannot be saved.",
  category: "blocks",
  blockCategory: "comments",
  tags: ["comments", "discussion", "thread", "replies", "mentions", "reactions", "collaboration", "feedback", "conversation"],
  files: [{ path: "components/blocks/comments-1/comments-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "cover-art", "skeleton", "state-view", "textarea"],
  examples: [
    { name: "comments-1-demo", title: "A live thread", file: "comments-1-demo.tsx" },
    { name: "comments-1-failed", title: "Posting fails", file: "comments-1-failed.tsx" },
    { name: "comments-1-loading", title: "Loading", file: "comments-1-loading.tsx" },
    { name: "comments-1-empty", title: "No comments yet", file: "comments-1-empty.tsx" },
    { name: "comments-1-error", title: "Could not load", file: "comments-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "comments-1-loading", trigger: "state=\"loading\"", note: "A skeleton composer and comments under the real heading, announced as loading." },
    { id: "empty", title: "No comments yet", example: "comments-1-empty", trigger: "state=\"empty\" (or comments={[]})", note: "Invites the first comment and mentions @; the composer stays usable. emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "comments-1-error", trigger: "state=\"error\"", note: "An alert saying nothing was changed, with Try again (onRetry). A comment that fails to post stays with Not posted and Retry." },
  ],
  ai: {
    summary:
      "Threaded comments. <Comments1 comments={[{ id, author, body, at: ISO, reactions: { '👍': ['Priya Shah'] }, edited, resolvedBy, replies: [...] }]} people={[{ id, name }]} me='Sam Okafor' now='2026-10-18T10:00:00Z' onPost={({ body, replyTo }) => Promise} onEdit onDelete onReact={(id, emoji, on) => ...} onResolve={(id, resolved) => ...} />. Typing @ opens a people list (arrows, Enter or Tab pick, Escape closes); only @Name that matches a person is highlighted. Times are 'N min ago' from now; pass now yourself, the block never reads the clock. Only comments whose author equals me can be edited or deleted. Reject onPost to show Not posted with Retry.",
    whenToUse: ["Comments on a document, task, design or post", "A team discussion with mentions and reactions"],
    whenNotToUse: ["Real-time chat (use chat-1)", "A support conversation with private notes (use tickets-1)"],
    composesWith: ["tickets-1", "tasks-1", "editor-1", "app-shell-1"],
    a11y: [
      { keys: "@, Up / Down, Enter or Tab, Escape", action: "The composer is a combobox; the people list is a listbox with the active option announced, and Escape closes it without losing the text" },
      { keys: "Reactions", action: "Each is a toggle button that says its emoji, count and who reacted ('👍 3: Priya Shah, Sam Okafor, Theo Nakamura')" },
      { keys: "Actions", action: "Edit and Delete say which comment they act on; posting, replying, deleting and resolving are announced politely" },
    ],
    customization: ["Replies nest one level deep, drawn with a rule on the reading edge so it mirrors in right-to-left", "A resolved thread collapses to one line with Show, and Reopen brings it back", "Your own comments get Edit and Delete; reactions toggle for you"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
