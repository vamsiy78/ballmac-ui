import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "billing-card",
  type: "registry:ui",
  title: "Billing Card",
  description:
    "A subscription summary with plan and price, status, next charge, payment method, seat usage and recent invoices, including failed-payment and trial states.",
  category: "saas",
  tags: ["billing", "subscription", "invoices", "plan"],
  files: [{ path: "components/billing-card.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "billing-card-demo", title: "Team plan", file: "billing-card-demo.tsx" },
    { name: "billing-card-states", title: "Payment failed and trial", file: "billing-card-states.tsx" },
  ],
  ai: {
    summary:
      "plan {name,price,interval,status,renewsOn,seats}, paymentMethod, invoices[], and onChangePlan / onUpdatePayment / onCancel. Dates are ISO strings formatted in UTC.",
    whenToUse: ["Account billing pages", "Showing subscription state in settings"],
    whenNotToUse: ["Choosing a plan; use plan-selector", "A line-item invoice table; use table"],
    composesWith: ["usage-meter", "plan-selector", "settings-panel"],
    a11y: [
      { keys: "Screen readers", action: "Details are a description list; a failed payment is announced as an alert" },
      { keys: "Tab", action: "Change plan, Update, Cancel and invoice downloads are real buttons and links" },
    ],
    customization: ["currency and locale", "status: active | trialing | past_due | canceled", "seats", "invoices"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
});
