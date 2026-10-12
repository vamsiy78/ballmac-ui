import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "login-1",
  type: "registry:block",
  title: "Login 1: card with SSO and magic link",
  description:
    "Centered sign-in card: SSO and email-link buttons, an email and password form with remember me, a loading submit and an inline error.",
  category: "blocks",
  blockCategory: "auth",
  tags: ["login", "sign in", "auth", "form", "sso"],
  files: [{ path: "components/blocks/login-1/login-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "checkbox", "input", "label", "use-resource"],
  examples: [{ name: "login-1-demo", title: "Default", file: "login-1-demo.tsx" },
    { name: "login-1-submitting", title: "Signing in", file: "login-1-submitting.tsx" },
    { name: "login-1-error", title: "Wrong password", file: "login-1-error.tsx" },
  ],
  states: [
    { id: "submitting", title: "Signing in", example: "login-1-submitting", trigger: "state=\"submitting\"", note: "Every field and button is disabled while the request is in flight, the button shows a spinner, and the form is marked busy." },
    { id: "error", title: "Wrong password", example: "login-1-error", trigger: "state=\"error\"", note: "An alert above the form with the message (errorState.description to change it); the fields stay editable so it can be fixed." },
  ],
  ai: {
    summary: "A sign-in screen. Wire onSubmit to your auth (it can be async; the button shows a spinner), pass error to show failures, and onSso/onMagicLink for passwordless options.",
    whenToUse: ["App sign-in pages", "Admin or dashboard login"],
    whenNotToUse: ["Sign-up with many fields (build a form from input, label and checkbox)"],
    composesWith: ["footer-1"],
    customization: ["onSubmit({ email, password, remember })", "error, onSso, onMagicLink, forgotHref, signupHref props", "Pass onSso={null} or onMagicLink={null} to hide that button", "state: \"submitting\" | \"success\" | \"error\" (omit it and the form runs by itself); errorState.description sets the failure message. Pair with your own async handler: state={pending ? \"submitting\" : failed ? \"error\" : done ? \"success\" : undefined}"],
  },
  version: "1.1.0",
  updated: "2026-10-11",
  changelog: [
    { version: "1.1.0", date: "2026-10-11", note: "Adds state (submitting, success, error) to drive the form from your own async code, and defaultValues or defaultEmail to prefill. Fields lock while a request is in flight. Unchanged without state." },
    { version: "1.0.0", date: "2026-09-28", note: "First release." },
  ],
})
