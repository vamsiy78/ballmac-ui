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
  registryDependencies: ["shadcn:utils", "button", "checkbox", "field", "input", "password-input", "media"],
  examples: [
    { name: "login-2-demo", title: "Default", file: "login-2-demo.tsx" },
    { name: "login-2-error", title: "Wrong password", file: "login-2-error.tsx" },
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
    customization: ["onSubmit(values) async; throw for the error state", "quote, author or visual (any node)", "onSso / onPasskey: null hides"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
