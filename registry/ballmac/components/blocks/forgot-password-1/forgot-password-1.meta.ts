import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "forgot-password-1",
  type: "registry:block",
  title: "Forgot Password 1: request, resend and reset",
  description: "The whole password-recovery flow in one card: request a link, check-your-email with a resend countdown, choose a new password with confirmation and strength, and a success screen. Focus moves to each new heading.",
  category: "blocks",
  blockCategory: "auth",
  tags: ["forgot password", "reset password", "auth", "recovery", "email", "countdown"],
  files: [{ path: "components/blocks/forgot-password-1/forgot-password-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "field", "input", "password-input", "use-resource"],
  examples: [{ name: "forgot-password-1-demo", title: "Request a link", file: "forgot-password-1-demo.tsx" },
    { name: "forgot-password-1-reset", title: "Choose a new password", file: "forgot-password-1-reset.tsx" },
    { name: "forgot-password-1-submitting", title: "Sending the link", file: "forgot-password-1-submitting.tsx" },
    { name: "forgot-password-1-success", title: "Check your email", file: "forgot-password-1-success.tsx" },
    { name: "forgot-password-1-error", title: "Could not send", file: "forgot-password-1-error.tsx" },
  ],
  states: [
    { id: "submitting", title: "Sending the link", example: "forgot-password-1-submitting", trigger: "state=\"submitting\"", note: "Every field and button is disabled while the request is in flight, the button shows a spinner, and the form is marked busy." },
    { id: "success", title: "Check your email", example: "forgot-password-1-success", trigger: "state=\"success\"", note: "The confirmation screen the flow ends on." },
    { id: "error", title: "Could not send", example: "forgot-password-1-error", trigger: "state=\"error\"", note: "An alert above the form with the message (errorState.description to change it); the fields stay editable so it can be fixed." },
  ],
  ai: {
    summary: "Use it on /forgot-password (initialView 'request') and on the page the emailed link opens (initialView 'reset'). Pass onRequest(email) and onReset(password); throw to show an error.",
    whenToUse: ["Any app with passwords", "The page an emailed reset link opens"],
    whenNotToUse: ["Passwordless-only products"],
    composesWith: ["login-2", "login-1", "verify-1"],
    a11y: [
      { keys: "Screen changes", action: "Focus moves to the new heading so the change is announced" },
      { keys: "Resend", action: "The countdown is announced politely; the button is disabled until it ends" },
    ],
    customization: ["initialView: 'request' | 'sent' | 'reset' | 'done'", "onRequest / onReset async handlers", "resendAfter: cooldown in seconds", "state: \"submitting\" | \"success\" | \"error\" (omit it and the form runs by itself); errorState.description sets the failure message. Pair with your own async handler: state={pending ? \"submitting\" : failed ? \"error\" : done ? \"success\" : undefined}"],
  },
  version: "1.1.0",
  updated: "2026-10-11",
  changelog: [
    { version: "1.1.0", date: "2026-10-11", note: "Adds state (submitting, success, error) to drive the form from your own async code, and defaultValues or defaultEmail to prefill. Fields lock while a request is in flight. Unchanged without state." },
    { version: "1.0.0", date: "2026-10-01", note: "First release." },
  ],
})
