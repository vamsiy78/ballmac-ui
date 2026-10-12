import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "signup-1",
  type: "registry:block",
  title: "Signup 1: form with benefits column",
  description: "A signup page: validated name, work email and password with a live strength guide, terms checkbox, SSO option and a check-your-inbox confirmation, beside a benefits list with social proof.",
  category: "blocks",
  blockCategory: "auth",
  tags: ["signup", "register", "auth", "password strength", "form", "sso"],
  files: [{ path: "components/blocks/signup-1/signup-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "checkbox", "field", "input", "password-input", "media", "use-resource"],
  examples: [{ name: "signup-1-demo", title: "Default", file: "signup-1-demo.tsx" },
    { name: "signup-1-simple", title: "No SSO, no pitch", file: "signup-1-simple.tsx" },
    { name: "signup-1-submitting", title: "Creating account", file: "signup-1-submitting.tsx" },
    { name: "signup-1-success", title: "Check your inbox", file: "signup-1-success.tsx" },
    { name: "signup-1-error", title: "Could not create", file: "signup-1-error.tsx" },
  ],
  states: [
    { id: "submitting", title: "Creating account", example: "signup-1-submitting", trigger: "state=\"submitting\"", note: "Every field and button is disabled while the request is in flight, the button shows a spinner, and the form is marked busy." },
    { id: "success", title: "Check your inbox", example: "signup-1-success", trigger: "state=\"success\"", note: "The confirmation screen the flow ends on." },
    { id: "error", title: "Could not create", example: "signup-1-error", trigger: "state=\"error\"", note: "An alert above the form with the message (errorState.description to change it); the fields stay editable so it can be fixed." },
  ],
  ai: {
    summary: "A registration page. Pass onSubmit(values) (throw to show an error), onSso (null hides), and benefits / pitch / proof for the left column.",
    whenToUse: ["Self-serve SaaS signup", "Pages that should sell while they collect details"],
    whenNotToUse: ["Invitation acceptance (use invite-1)", "Multi-step setup (use onboarding-1)"],
    composesWith: ["login-2", "verify-1", "onboarding-1", "header-2"],
    a11y: [
      { keys: "Submit with errors", action: "Each error is announced and linked to its field" },
      { keys: "Password field", action: "The strength guide is announced politely as you type" },
    ],
    customization: ["onSubmit(values) async; throw for the error state", "benefits, pitch, proof", "onSso: null hides the SSO button", "state: \"submitting\" | \"success\" | \"error\" (omit it and the form runs by itself); errorState.description sets the failure message. Pair with your own async handler: state={pending ? \"submitting\" : failed ? \"error\" : done ? \"success\" : undefined}"],
  },
  version: "1.1.0",
  updated: "2026-10-11",
  changelog: [
    { version: "1.1.0", date: "2026-10-11", note: "Adds state (submitting, success, error) to drive the form from your own async code, and defaultValues or defaultEmail to prefill. Fields lock while a request is in flight. Unchanged without state." },
    { version: "1.0.0", date: "2026-10-01", note: "First release." },
  ],
})
