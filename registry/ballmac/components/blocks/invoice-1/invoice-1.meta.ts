import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "invoice-1",
  type: "registry:block",
  title: "Invoice 1: invoice you can pay",
  description:
    "An invoice you can read, print and pay: parties, dates and line items, totals worked out from the lines, a status from the dates (paid, due in N days, overdue by N days) and a Pay now that handles waiting and failure.",
  category: "blocks",
  blockCategory: "invoice",
  tags: ["invoice", "billing", "payment", "receipt", "bill", "line items", "tax", "pay now", "print", "accounting"],
  files: [{ path: "components/blocks/invoice-1/invoice-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "skeleton", "state-view"],
  examples: [
    { name: "invoice-1-demo", title: "Overdue", file: "invoice-1-demo.tsx" },
    { name: "invoice-1-due", title: "Due soon, with tax", file: "invoice-1-due.tsx" },
    { name: "invoice-1-paid", title: "Paid", file: "invoice-1-paid.tsx" },
    { name: "invoice-1-loading", title: "Loading", file: "invoice-1-loading.tsx" },
    { name: "invoice-1-error", title: "Could not load", file: "invoice-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "invoice-1-loading", trigger: "state=\"loading\"", note: "A skeleton sheet announced as loading." },
    { id: "error", title: "Could not load", example: "invoice-1-error", trigger: "state=\"error\"", note: "An alert with Try again (onRetry). A failed payment says you were not charged, in place beside Pay now." },
  ],
  ai: {
    summary:
      "An invoice. <Invoice1 invoice={{ number, issued, due, paidOn, from: { name, lines }, to: { name, lines }, lines: [{ id, description, detail, quantity, unitPrice }], discountPercent, taxPercent, note, paymentDetails: [{ label, value }] }} today='2026-10-18' currency='USD' locale onPay={() => Promise} onDownload />. Subtotal, discount, tax and total are worked out from the lines; status is paid (paidOn set or payment succeeded), overdue by N days, or due in N days, from due and today. Pass today yourself; the block never reads the clock. Reject onPay to show its message.",
    whenToUse: ["A customer-facing invoice page or a payment link", "An invoice detail in a billing area"],
    whenNotToUse: ["A list of invoices (use a data table)", "Changing plans with proration (use billing-2)"],
    composesWith: ["billing-1", "billing-2", "app-shell-1", "settings-5"],
    a11y: [
      { keys: "Status", action: "A live region that says Paid on a date, Due in N days, or Overdue by N days, with an icon, not only color" },
      { keys: "Table", action: "The items are a real table with a caption and column headers; totals are a description list" },
      { keys: "Pay now", action: "The button says the amount and shows Paying while busy; a failure is an alert that says no charge was made" },
    ],
    customization: ["currency and locale format every amount and date", "Print hides the buttons and the card border", "Bank details are shown left to right in right-to-left layouts, like any number"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
