import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "crm-1",
  type: "registry:block",
  title: "CRM 1: contact and deal record",
  description:
    "A contact record for a sales team: the pipeline stage you can move, deal value, last contact and an overdue follow-up worked out from the day you pass, and a timeline of notes, calls, emails and meetings with a form to log the next.",
  category: "blocks",
  blockCategory: "crm",
  tags: ["crm", "contact", "deal", "pipeline", "sales", "leads", "activity", "follow-up", "customer record", "account"],
  files: [{ path: "components/blocks/crm-1/crm-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "cover-art", "input", "skeleton", "state-view", "textarea"],
  examples: [
    { name: "crm-1-demo", title: "A follow-up overdue", file: "crm-1-demo.tsx" },
    { name: "crm-1-won", title: "A won deal", file: "crm-1-won.tsx" },
    { name: "crm-1-loading", title: "Loading", file: "crm-1-loading.tsx" },
    { name: "crm-1-empty", title: "Contact not found", file: "crm-1-empty.tsx" },
    { name: "crm-1-error", title: "Could not load", file: "crm-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "crm-1-loading", trigger: "state=\"loading\"", note: "A skeleton header, timeline and side panel, announced as loading." },
    { id: "empty", title: "Contact not found", example: "crm-1-empty", trigger: "state=\"empty\"", note: "Says they may have been merged or removed; emptyState sets the copy and can add a link back." },
    { id: "error", title: "Could not load", example: "crm-1-error", trigger: "state=\"error\"", note: "An alert saying nothing was changed, with Try again (onRetry). A logged activity that fails to save stays in the timeline with Not saved and Retry." },
  ],
  ai: {
    summary:
      "A CRM contact record. <Crm1 contact={{ id, name, title, company, email, phone, location, owner, stage: 2, value: 48000, tags, followUp: '2026-10-16', activities: [{ id, kind: 'note' | 'call' | 'email' | 'meeting', date: '2026-10-09', by, summary }] }} stages={['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won']} today='2026-10-18' currency locale onLog={({ kind, summary, date }) => Promise} onStageChange={(index) => ...} onFollowUp={(date) => ...} />. Last contact and the follow-up status (Due in N days, Due today, Overdue by N days) are worked out from today; pass it yourself, the block never reads the clock. A logged item appears at once; reject onLog and it stays with Not saved and Retry.",
    whenToUse: ["A customer or lead record in a CRM or support tool", "An account page for sales and customer success"],
    whenNotToUse: ["A list or board of deals (use kanban-1)", "A support conversation (use tickets-1)"],
    composesWith: ["directory-1", "tickets-1", "invoice-1", "app-shell-1"],
    a11y: [
      { keys: "Tab, Enter / Space", action: "Each pipeline stage is a button that says done, current stage or nothing; the activity type is a radio group and the form fields have labels" },
      { keys: "Follow-up", action: "'Overdue by 2 days' is written in words with the date, and the card is tinted as well as worded" },
      { keys: "Logging", action: "A new activity shows Saving, and a failure is an alert with a Retry button" },
    ],
    customization: ["stages is a plain list of names, so any pipeline works", "Value, dates and relative times follow currency, locale and today", "The timeline line and stages mirror in right-to-left"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
