import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "donations-1",
  type: "registry:block",
  title: "Donations 1: donation page",
  description:
    "A donation page for a charity: what each amount does, once or every month, which cause, an optional card-fee cover, anonymous giving, a progress bar to the goal, and a thank you that says exactly what was given.",
  category: "blocks",
  blockCategory: "donations",
  tags: ["donations", "charity", "nonprofit", "fundraising", "giving", "checkout", "monthly", "impact"],
  files: [{ path: "components/blocks/donations-1/donations-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "skeleton", "state-view"],
  examples: [
    { name: "donations-1-demo", title: "Default", file: "donations-1-demo.tsx" },
    { name: "donations-1-monthly", title: "Almost at goal", file: "donations-1-monthly.tsx" },
    { name: "donations-1-loading", title: "Loading", file: "donations-1-loading.tsx" },
    { name: "donations-1-empty", title: "Giving is not open yet", file: "donations-1-empty.tsx" },
    { name: "donations-1-error", title: "Could not load", file: "donations-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "donations-1-loading", trigger: "state=\"loading\"", note: "Skeleton progress and form under the real heading, announced as loading." },
    { id: "empty", title: "Giving is not open yet", example: "donations-1-empty", trigger: "state=\"empty\"", note: "Says giving is not open yet; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "donations-1-error", trigger: "state=\"error\"", note: "An alert saying you were not charged, with Try again (onRetry). A gift that fails keeps the form filled and says why." },
  ],
  ai: {
    summary:
      "Donation page. <Donations1 presets={[{ amount, impact }]} causes={[{ id, name, detail }]} raised goal donors currency='USD' feeRate={0.03} onDonate={({ amount, cause, monthly, coverFees, name, email, anonymous }) => Promise} />. The total, including the fee cover, is always shown before the button. Giving anonymously removes the name requirement and sends no name.",
    whenToUse: ["A charity or open source project asking for gifts", "Any pay-what-you-choose page with a clear impact"],
    whenNotToUse: ["A store checkout; use billing-1", "A fixed plan subscription; use pricing-1"],
    composesWith: ["billing-1", "trust-1", "testimonials-1"],
    a11y: [
      { keys: "Amount", action: "Radio group of presets plus Other; the custom amount is a labelled field with its error as an alert" },
      { keys: "Impact", action: "What the amount does is a polite live region" },
      { keys: "Progress", action: "A progressbar with the percentage written as text" },
      { keys: "Total", action: "Written before the button, including the fee cover and a monthly marker" },
    ],
    customization: ["presets, causes, goal and raised", "feeRate", "onDonate"],
  },
  version: "1.0.0",
  updated: "2026-10-24",
})
