import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "billing-1",
  type: "registry:block",
  title: "Billing 1: plan, usage and invoices",
  description: "A billing page: current plan and monthly cost, usage meters that turn amber near the limit, the card on file with an update dialog (formatted, validated), the billing contact and an invoice list with status and downloads.",
  category: "blocks",
  blockCategory: "billing",
  tags: ["billing", "subscription", "usage", "invoices", "payment method", "plan"],
  files: [{ path: "components/blocks/billing-1/billing-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "badge", "button", "dialog", "field", "input", "i18n"],
  examples: [
    { name: "billing-1-demo", title: "Default", file: "billing-1-demo.tsx" },
    { name: "billing-1-starter", title: "Free plan", file: "billing-1-starter.tsx" },
  ],
  ai: {
    summary: "The billing screen. Pass plan, usage=[{ label, used, limit?, unit? }], card, contact, invoices, currency and handlers onChangePlan / onUpdateCard (throw to show an error). Real card numbers must go to your payment provider's hosted fields, not through this form.",
    whenToUse: ["Subscription management pages", "Usage-based or seat-based products"],
    whenNotToUse: ["Choosing between plans (use billing-2 or pricing-2)"],
    composesWith: ["app-shell-1", "billing-2", "settings-1", "settings-3"],
    a11y: [
      { keys: "Usage meters", action: "Each is an image with a text alternative ('Storage: 64 percent used') and the warning is written out, not only coloured" },
      { keys: "Update card", action: "A dialog with labelled fields, inline errors and focus returned to the button on close" },
      { keys: "Download", action: "Each icon link is named 'Download invoice INV-…'" },
    ],
    customization: ["plan, usage, card, contact, invoices", "currency, locale", "onChangePlan, onUpdateCard"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
