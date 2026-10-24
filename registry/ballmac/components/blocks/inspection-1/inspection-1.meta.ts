import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "inspection-1",
  type: "registry:block",
  title: "Inspection 1: checklist inspection",
  description:
    "A field inspection checklist: pass, fail or not applicable on each item with what to look for, a required note when something fails, progress through each section, and a submit that says exactly what is missing.",
  category: "blocks",
  blockCategory: "inspection",
  tags: ["inspection", "checklist", "audit", "safety", "field", "compliance", "facilities", "form"],
  files: [{ path: "components/blocks/inspection-1/inspection-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "skeleton", "state-view"],
  examples: [
    { name: "inspection-1-demo", title: "Default", file: "inspection-1-demo.tsx" },
    { name: "inspection-1-done", title: "Mostly answered", file: "inspection-1-done.tsx" },
    { name: "inspection-1-loading", title: "Loading", file: "inspection-1-loading.tsx" },
    { name: "inspection-1-empty", title: "No inspection assigned", file: "inspection-1-empty.tsx" },
    { name: "inspection-1-error", title: "Could not load", file: "inspection-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "inspection-1-loading", trigger: "state=\"loading\"", note: "Skeleton checklist under the real heading, announced as loading." },
    { id: "empty", title: "No inspection assigned", example: "inspection-1-empty", trigger: "state=\"empty\"", note: "Says no inspection is assigned; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "inspection-1-error", trigger: "state=\"error\"", note: "An alert saying nothing was submitted, with Try again (onRetry). A submit that fails keeps every answer and says why." },
  ],
  ai: {
    summary:
      "Inspection checklist. <Inspection1 inspection={{ title, site, inspector, sections: [{ id, title, items: [{ id, text, hint? }] }] }} defaultResult={{ itemId: { answer: 'pass'|'fail'|'na', note? } }} onSubmit={(result) => Promise} />. A failed item needs a note. Submitting with gaps lists exactly which items are open and moves focus to the first.",
    whenToUse: ["Safety, hygiene or quality inspections on a phone or tablet", "Any pass or fail checklist with evidence"],
    whenNotToUse: ["A survey with free-form questions; use form items", "Onboarding steps; use checklist"],
    composesWith: ["fleet-1", "kitchen-1", "workorder-1"],
    a11y: [
      { keys: "Answer", action: "Each item is a radio group named by the item with Pass, Fail and Not applicable" },
      { keys: "Note", action: "A failed item shows a required, labelled note field" },
      { keys: "Progress", action: "Answered of total is written and announced politely" },
      { keys: "Submit", action: "Missing items are listed in an alert and focus moves to the first" },
    ],
    customization: ["inspection and defaultResult", "onSubmit", "Sections and items are data"],
  },
  version: "1.0.0",
  updated: "2026-10-24",
})
