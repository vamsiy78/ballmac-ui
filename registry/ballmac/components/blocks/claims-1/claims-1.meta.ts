import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "claims-1",
  type: "registry:block",
  title: "Claims 1: claim tracker",
  description:
    "An insurance claim tracker: each claim and its stage in words, a line of five stages that stops at the decision when a claim is declined, and the things still needed from the customer with a place to answer each.",
  category: "blocks",
  blockCategory: "claims",
  tags: ["insurance", "claims", "status", "tracker", "customer portal", "documents", "case", "finance"],
  files: [{ path: "components/blocks/claims-1/claims-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "skeleton", "state-view"],
  examples: [
    { name: "claims-1-demo", title: "Default", file: "claims-1-demo.tsx" },
    { name: "claims-1-clear", title: "Nothing needed", file: "claims-1-clear.tsx" },
    { name: "claims-1-loading", title: "Loading", file: "claims-1-loading.tsx" },
    { name: "claims-1-empty", title: "No claims yet", file: "claims-1-empty.tsx" },
    { name: "claims-1-error", title: "Could not load", file: "claims-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "claims-1-loading", trigger: "state=\"loading\"", note: "Skeleton list and detail under the real heading, announced as loading." },
    { id: "empty", title: "No claims yet", example: "claims-1-empty", trigger: "state=\"empty\"", note: "Says no claims yet; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "claims-1-error", trigger: "state=\"error\"", note: "An alert saying nothing was changed, with Try again (onRetry). An answer that fails to send stays in the box and says why." },
  ],
  ai: {
    summary:
      "Claim tracker. <Claims1 claims={[{ id, number, title, stage: 'Received'|'In review'|'Assessed'|'Decided'|'Paid', declined?, amount, updated, requests?: [{ id, text, answer? }] }]} currency='USD' onAnswer={(claimId, requestId, answer) => Promise} />. A declined claim stops at Decided and later stages are written as not reached.",
    whenToUse: ["A customer portal for insurance, warranty or returns", "Any case with stages and requests for information"],
    whenNotToUse: ["An internal case queue; use tickets-1", "A single order's tracking; use status-1"],
    composesWith: ["tickets-1", "upload-1", "help-1"],
    a11y: [
      { keys: "Claims", action: "A list of buttons with pressed state; things needed are written in each" },
      { keys: "Stages", action: "An ordered list with the current step marked and each stage's state written for screen readers" },
      { keys: "Answer", action: "A labelled text area per request; empty and failed sends are alerts tied to it" },
      { keys: "Declined", action: "Said in words in the list and above the stages" },
    ],
    customization: ["claims and currency", "onAnswer", "Stages are fixed: Received, In review, Assessed, Decided, Paid"],
  },
  version: "1.0.0",
  updated: "2026-10-24",
})
