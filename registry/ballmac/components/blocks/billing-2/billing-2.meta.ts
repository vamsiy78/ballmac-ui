import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "billing-2",
  type: "registry:block",
  title: "Billing 2: change plan with proration",
  description: "A change-plan flow: billing interval, plan cards as radios, a seat stepper that respects the current team, and a sticky summary that works out the prorated charge, the credit and what is due today.",
  category: "blocks",
  blockCategory: "billing",
  tags: ["billing", "upgrade", "downgrade", "proration", "seats", "plans", "checkout"],
  files: [{ path: "components/blocks/billing-2/billing-2.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "badge", "button", "segmented-control", "i18n"],
  examples: [
    { name: "billing-2-demo", title: "Default", file: "billing-2-demo.tsx" },
    { name: "billing-2-yearly", title: "Yearly account", file: "billing-2-yearly.tsx" },
  ],
  ai: {
    summary: "Upgrade and downgrade flow. Pass plans=[{ id, name, monthly, yearly, description, features }], currentPlan, currentSeats, today and renewsOn (ISO dates, so server and browser agree) and onConfirm({ plan, seats, interval }) (throw to show an error).",
    whenToUse: ["In-app plan changes", "Seat-based products with prorated billing"],
    whenNotToUse: ["Public pricing pages (use pricing-2 or pricing-3)"],
    composesWith: ["billing-1", "app-shell-1", "settings-3"],
    a11y: [
      { keys: "Arrow keys on plans", action: "Move between plan radios; the chosen plan is marked and named 'Current' when it is the active one" },
      { keys: "Seat buttons", action: "Named 'Add a seat' and 'Remove a seat'; the count is announced politely and can't go below the team size" },
      { keys: "Summary", action: "A labelled complementary region; every line is plain text" },
    ],
    customization: ["plans, currentPlan, currentSeats, currentInterval, minSeats", "today and renewsOn drive the proration", "onConfirm(change) async"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
