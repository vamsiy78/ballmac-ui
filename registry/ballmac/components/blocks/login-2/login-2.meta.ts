import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "login-2",
  type: "registry:block",
  title: "Login 2: split screen with testimonial",
  description: "A split-screen sign-in: SSO and passkey buttons, validated email and password with show/hide, remember me and error state on one side, a soft colour mesh with a customer quote on the other.",
  category: "blocks",
  blockCategory: "auth",
  tags: ["login", "sign in", "auth", "split screen", "passkey", "sso"],
  files: [{ path: "components/blocks/login-2/login-2.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "checkbox", "field", "input", "password-input", "media", "use-resource"],
  examples: [{ name: "login-2-demo", title: "Default", file: "login-2-demo.tsx" },
    { name: "login-2-error", title: "Wrong password", file: "login-2-error.tsx" },
    { name: "login-2-submitting", title: "Signing in", file: "login-2-submitting.tsx" },
    { name: "login-2-failed", title: "Wrong password", file: "login-2-failed.tsx" },
  ],
  states: [
    { id: "submitting", title: "Signing in", example: "login-2-submitting", trigger: "state=\"submitting\"", note: "Every field and button is disabled while the request is in flight, the button shows a spinner, and the form is marked busy." },
    { id: "error", title: "Wrong password", example: "login-2-failed", trigger: "state=\"error\"", note: "An alert above the form with the message (errorState.description to change it); the fields stay editable so it can be fixed." },
  ],
  ai: {
    summary: "A full-width sign-in page. Pass onSubmit(values) (throw to show errorMessage), onSso / onPasskey (null hides), quote and author, or visual to replace the right side.",
    whenToUse: ["Product sign-in pages with room for a brand moment", "Apps with SSO and passkeys"],
    whenNotToUse: ["Small centered dialogs (use login-1)"],
    composesWith: ["signup-1", "forgot-password-1", "verify-1"],
    a11y: [
      { keys: "Submit with errors", action: "Each error is announced and linked to its field; a failed sign-in is announced as an alert" },
      { keys: "Show / hide button", action: "Toggles the password with aria-pressed" },
    ],
    customization: ["onSubmit(values) async; throw for the error state", "quote, author or visual (any node)", "onSso / onPasskey: null hides", "state: \"submitting\" | \"success\" | \"error\" (omit it and the form runs by itself); errorState.description sets the failure message. Pair with your own async handler: state={pending ? \"submitting\" : failed ? \"error\" : done ? \"success\" : undefined}"],
  },
  version: "1.1.0",
  updated: "2026-10-11",
  changelog: [
    { version: "1.1.0", date: "2026-10-11", note: "Adds state (submitting, success, error) to drive the form from your own async code, and defaultValues or defaultEmail to prefill. Fields lock while a request is in flight. Unchanged without state." },
    { version: "1.0.0", date: "2026-10-01", note: "First release." },
  ],
})
