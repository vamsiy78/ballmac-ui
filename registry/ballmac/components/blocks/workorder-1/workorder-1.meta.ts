import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "workorder-1",
  type: "registry:block",
  title: "Work order 1: repair job",
  description:
    "A repair work order: customer, item and reported fault, five steps with one button to advance, parts and labour with subtotal, tax and total, a line form, one-click customer messages, and the history so far.",
  category: "blocks",
  blockCategory: "workorder",
  tags: ["work order", "repair", "service", "workshop", "field service", "parts", "labour", "job card"],
  files: [{ path: "components/blocks/workorder-1/workorder-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "skeleton", "state-view"],
  examples: [
    { name: "workorder-1-demo", title: "Default", file: "workorder-1-demo.tsx" },
    { name: "workorder-1-loading", title: "Loading", file: "workorder-1-loading.tsx" },
    { name: "workorder-1-empty", title: "No work order selected", file: "workorder-1-empty.tsx" },
    { name: "workorder-1-error", title: "Could not load", file: "workorder-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "workorder-1-loading", trigger: "state=\"loading\"", note: "Skeleton for the header, steps and totals under the page, announced as loading." },
    { id: "empty", title: "No work order selected", example: "workorder-1-empty", trigger: "state=\"empty\"", note: "Says no work order is selected; pass order={null} and emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "workorder-1-error", trigger: "state=\"error\"", note: "An alert saying nothing was changed, with Try again (onRetry). A failed advance, line or message says why." },
  ],
  ai: {
    summary:
      "A repair work order. <Workorder1 order={{ id, customer, item, issue, status: 'received' | 'diagnosing' | 'waiting-parts' | 'repairing' | 'ready', lines: [{ id, kind: 'part' | 'labour', description, qty, unit }], history: [{ id, time, text }] }} currency='USD' taxRate={0.2} messages={[{ id, label, text }]} onAdvance={(status) => Promise} onAddLine={(line) => Promise} onMessage={({ id, text }) => Promise} />. Totals are computed from the lines. Advancing, adding a line and messaging each update the screen and the history.",
    whenToUse: ["A repair shop, workshop or service desk's job page", "Any job with steps, billable lines and customer updates"],
    whenNotToUse: ["A support ticket thread; use tickets-1", "An invoice for sending; use invoice-1"],
    composesWith: ["dispatch-1", "invoice-1", "tickets-1", "inventory-1"],
    a11y: [
      { keys: "Progress", action: "An ordered list where the current step has aria-current='step' and every step says done, current or not started in words" },
      { keys: "Totals", action: "A real table with a caption, a subtotal, tax and total; every number is text" },
      { keys: "Add a line", action: "A labelled form; an incomplete line is simply not added" },
      { keys: "Advance and messages", action: "Real buttons; the result is a polite announcement and a failure is an alert" },
    ],
    customization: ["currency and taxRate", "messages you can send in one click", "onAdvance, onAddLine and onMessage"],
  },
  version: "1.0.0",
  updated: "2026-10-24",
})
