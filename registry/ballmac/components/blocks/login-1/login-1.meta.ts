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
  registryDependencies: ["shadcn:utils", "button", "checkbox", "input", "label"],
  examples: [{ name: "login-1-demo", title: "Default", file: "login-1-demo.tsx" }],
  ai: {
    summary: "A sign-in screen. Wire onSubmit to your auth (it can be async; the button shows a spinner), pass error to show failures, and onSso/onMagicLink for passwordless options.",
    whenToUse: ["App sign-in pages", "Admin or dashboard login"],
    whenNotToUse: ["Sign-up with many fields (build a form from input, label and checkbox)"],
    composesWith: ["footer-1"],
    customization: ["onSubmit({ email, password, remember })", "error, onSso, onMagicLink, forgotHref, signupHref props", "Pass onSso={null} or onMagicLink={null} to hide that button"],
  },
  version: "1.0.0",
  updated: "2026-09-28",
})
