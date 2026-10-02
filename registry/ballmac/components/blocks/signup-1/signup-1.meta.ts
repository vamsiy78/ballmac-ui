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
  registryDependencies: ["shadcn:utils", "button", "checkbox", "field", "input", "password-input", "media"],
  examples: [
    { name: "signup-1-demo", title: "Default", file: "signup-1-demo.tsx" },
    { name: "signup-1-simple", title: "No SSO, no pitch", file: "signup-1-simple.tsx" },
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
    customization: ["onSubmit(values) async; throw for the error state", "benefits, pitch, proof", "onSso: null hides the SSO button"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
