import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "review-center",
  type: "registry:ui",
  title: "Review Center",
  description:
    "A desk for reviewing what agents made: items with the agent's confidence, a summary and the thing itself, Approve or Request changes with a comment, J, K, A and R keys, and decisions undone with the reason if saving fails.",
  category: "ai",
  tags: ["ai", "agents", "review", "approval", "human in the loop", "inbox", "keyboard", "feedback"],
  files: [{ path: "components/review-center.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "review-center-demo", title: "Three drafts to review", file: "review-center-demo.tsx" },
    { name: "review-center-clear", title: "All reviewed", file: "review-center-clear.tsx" },
  ],
  ai: {
    summary:
      "items is [{ id, title, agent?, summary, meta?, confidence?: 0-1, status: pending | approved | changes, feedback?, preview?: ReactNode }] (required); title, selected / defaultSelected / onSelectedChange. onApprove(id) and onRequestChanges(id, comment) may be async: the decision shows at once and is taken back with the reason if it rejects. Keys: J and K or the arrow keys move, A approves, R asks for changes, Home and End jump; after a decision it moves to the next item still waiting. Shortcuts are ignored while typing.",
    whenToUse: ["Reviewing drafts, decisions or changes an agent produced before they go out", "A queue where the reviewer's speed matters"],
    whenNotToUse: ["A single yes or no on one action; use approval-card", "A conversation to take over; use escalation-card", "Comparing alternative runs; use parallel-attempts"],
    composesWith: ["agent-12", "approval-card", "escalation-card", "prompt-diff"],
    a11y: [
      { keys: "List", action: "A listbox; each option starts with its state in words, such as 'To review: …'; the selected option has aria-selected and one option is in the tab order" },
      { keys: "Keyboard", action: "J and K or Up and Down move, Home and End jump, A approves and R asks for changes; the shortcuts are off while typing in the comment box, and Escape closes it" },
      { keys: "Decisions", action: "Announced in a polite live region ('Approved: …'); a failed save is an alert and the decision is taken back" },
      { keys: "Confidence", action: "A meter with a spoken value; below 60% it also says 'worth a close look'" },
      { keys: "Comment", action: "A labelled textarea; an empty one is refused with an alert, and Ctrl or Command with Enter sends" },
    ],
    customization: ["items, title and selected", "preview (anything you can render)", "onApprove and onRequestChanges"],
  },
  statesNone: "A presentational desk: the items are passed in with their own status, so it has nothing of its own to load. With no items it says nothing is to review.",
  version: "1.0.0",
  updated: "2026-10-25",
})
