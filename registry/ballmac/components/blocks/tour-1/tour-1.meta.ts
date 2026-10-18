import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "tour-1",
  type: "registry:block",
  title: "Tour 1: guided product tour",
  description:
    "A guided product tour: a spotlight lifts one part of your interface out of a dimmed page while a card says what it is for, with Next, Back, arrow keys, Escape, a progress bar, focus that follows the step, and a restart.",
  category: "blocks",
  blockCategory: "tour",
  tags: ["product tour", "onboarding", "walkthrough", "tooltips", "coachmarks", "spotlight", "guide", "tutorial", "first run"],
  files: [{ path: "components/blocks/tour-1/tour-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button"],
  examples: [
    { name: "tour-1-demo", title: "Ready to start", file: "tour-1-demo.tsx" },
    { name: "tour-1-running", title: "Midway through", file: "tour-1-running.tsx" },
  ],
  statesNone: "A guided overlay with no data of its own: nothing to load, submit or fail.",
  ai: {
    summary:
      "A product tour. <Tour1 steps={[{ target: 'search', title, body }]} defaultStep={null | 0} onFinish={({ completed, step }) => ...}>{your interface}</Tour1>. Mark the elements to point at with data-tour='search' inside the children; leave children out to tour a built-in sample app. The page behind is inert while the tour runs; the spotlight and card follow each target and the card stays inside the stage, above or below the target.",
    whenToUse: ["First-run onboarding that points at real parts of the interface", "Introducing a redesign or a new feature"],
    whenNotToUse: ["A setup checklist (use onboarding-1)", "One-off hints (use tooltip or popover)"],
    composesWith: ["onboarding-1", "app-shell-1", "dashboard-1"],
    a11y: [
      { keys: "Left / Right, Escape", action: "Move between steps and end the tour; Next, Back and Skip are real buttons and the card is a dialog named by its title" },
      { keys: "Focus", action: "Moves to the card's Next button at every step, and back to Start the tour when it ends; the page behind is inert, so focus cannot wander into it" },
      { keys: "Progress", action: "'Step 2 of 4' in text, a labelled progress bar, and each step announced politely" },
    ],
    customization: ["Targets are found by data-tour attributes, so any interface can be toured", "The spotlight and card animate between steps and jump with reduced motion", "The card is placed below the target when there is room, otherwise above, and clamped inside the stage"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
