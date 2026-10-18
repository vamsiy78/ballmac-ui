import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "expenses-1",
  type: "registry:block",
  title: "Expenses 1: expense report",
  description:
    "An expense report you can finish: lines with category, amount and receipt, a total by category, rules checked as you go (receipt needed over a threshold, category limits), an add form, and Submit that lists what needs fixing.",
  category: "blocks",
  blockCategory: "expenses",
  tags: ["expenses", "expense report", "receipts", "reimbursement", "travel", "finance", "approval", "spending", "claims"],
  files: [{ path: "components/blocks/expenses-1/expenses-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "input", "select", "skeleton", "state-view"],
  examples: [
    { name: "expenses-1-demo", title: "A report with problems", file: "expenses-1-demo.tsx" },
    { name: "expenses-1-clean", title: "Ready to send", file: "expenses-1-clean.tsx" },
    { name: "expenses-1-loading", title: "Loading", file: "expenses-1-loading.tsx" },
    { name: "expenses-1-empty", title: "No expenses yet", file: "expenses-1-empty.tsx" },
    { name: "expenses-1-error", title: "Could not load", file: "expenses-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "expenses-1-loading", trigger: "state=\"loading\"", note: "A skeleton summary and list under the real heading, announced as loading." },
    { id: "empty", title: "No expenses yet", example: "expenses-1-empty", trigger: "state=\"empty\" (or lines={[]})", note: "Says to add what you paid for; emptyState sets the copy and can add a button." },
    { id: "error", title: "Could not load", example: "expenses-1-error", trigger: "state=\"error\"", note: "An alert saying nothing was changed, with Try again (onRetry). A failed submit says nothing was lost, in place beside the button." },
  ],
  ai: {
    summary:
      "An expense report. <Expenses1 report lines={[{ id, date: '2026-10-13', merchant, category, amount, receipt: 'file.pdf', note }]} categories={[{ id, label, limit }]} currency='EUR' locale='en-GB' receiptOver={25} onChange={(lines) => ...} onSubmit={(lines, total) => Promise} />. The total and the category breakdown are worked out from the lines. A line over receiptOver without a receipt blocks Submit and is named in the message; a line over its category limit shows a warning but does not block. Adding a line validates the merchant and amount. Reject onSubmit to show the reason and stay open.",
    whenToUse: ["Employee expense claims and reimbursements", "Trip or project cost reports"],
    whenNotToUse: ["A customer invoice (use invoice-1)", "Hours worked (use timesheet-1)"],
    composesWith: ["timesheet-1", "invoice-1", "app-shell-1", "upload-1"],
    a11y: [
      { keys: "Tab, Enter", action: "Each line's Attach receipt is a real file input labelled with the merchant; the add form fields all have visible labels" },
      { keys: "Problems", action: "'Needs a receipt: it is over €25.00' and 'Over the €75.00 limit for Meals' are written beside an icon on the line, and Submit names what is missing" },
      { keys: "Breakdown", action: "The category bar has a text equivalent listing each category and its amount" },
    ],
    customization: ["receiptOver and each category's limit are plain numbers in the report's currency", "Currency and dates follow the locale", "Removing a line says which one and its amount to a screen reader"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
