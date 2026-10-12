import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "onboarding-1",
  type: "registry:block",
  title: "Onboarding 1: workspace setup wizard",
  description: "A four-step setup wizard with a progress rail: name and address a workspace (auto-filled), pick goals as cards, invite teammates as removable chips, review, then a finish screen. Slides between steps.",
  category: "blocks",
  blockCategory: "onboarding",
  tags: ["onboarding", "wizard", "setup", "workspace", "steps", "invite"],
  files: [{ path: "components/blocks/onboarding-1/onboarding-1.tsx" }],
  dependencies: ["lucide-react", "motion@^12"],
  registryDependencies: ["shadcn:utils", "button", "field", "input", "use-resource"],
  examples: [{ name: "onboarding-1-demo", title: "Default", file: "onboarding-1-demo.tsx" },
    { name: "onboarding-1-custom", title: "Custom goals", file: "onboarding-1-custom.tsx" },
    { name: "onboarding-1-creating", title: "Creating the workspace", file: "onboarding-1-creating.tsx" },
    { name: "onboarding-1-ready", title: "Workspace ready", file: "onboarding-1-ready.tsx" },
    { name: "onboarding-1-error", title: "Could not create", file: "onboarding-1-error.tsx" },
  ],
  states: [
    { id: "submitting", title: "Creating the workspace", example: "onboarding-1-creating", trigger: "state=\"submitting\"", note: "The review step with its button spinning and the steps locked." },
    { id: "success", title: "Workspace ready", example: "onboarding-1-ready", trigger: "state=\"success\"", note: "The confirmation screen the flow ends on." },
    { id: "error", title: "Could not create", example: "onboarding-1-error", trigger: "state=\"error\"", note: "An alert above the form with the message (errorState.description to change it); the fields stay editable so it can be fixed." },
  ],
  ai: {
    summary: "First-run setup after signup. Pass product, domain, goals=[{ id, title, description }] and onComplete(values) with { name, slug, color, goals, invites } (throw to show an error).",
    whenToUse: ["The first screen after signup or verification", "Products where a workspace or team has to be created"],
    whenNotToUse: ["A checklist that lives inside the app (use onboarding-checklist)"],
    composesWith: ["signup-1", "verify-1", "invite-1", "app-shell"],
    a11y: [
      { keys: "Continue / Back", action: "Focus moves to the new step's heading so the change is announced" },
      { keys: "Arrow keys on colors", action: "Move between color radios; goals are checkboxes toggled with Space" },
      { keys: "Enter in the email field", action: "Adds the address as a removable chip" },
    ],
    customization: ["goals: { id, title, description }[]", "product, domain, continueHref", "onComplete(values) async", "state: \"submitting\" | \"success\" | \"error\" (omit it and the form runs by itself); errorState.description sets the failure message. Pair with your own async handler: state={pending ? \"submitting\" : failed ? \"error\" : done ? \"success\" : undefined}"],
  },
  version: "1.1.0",
  updated: "2026-10-11",
  changelog: [
    { version: "1.1.0", date: "2026-10-11", note: "Adds state (submitting, success, error) to drive the form from your own async code, and defaultValues or defaultEmail to prefill. Fields lock while a request is in flight. Unchanged without state." },
    { version: "1.0.0", date: "2026-10-01", note: "First release." },
  ],
})
