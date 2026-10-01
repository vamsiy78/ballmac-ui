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
  registryDependencies: ["shadcn:utils", "button", "field", "input", "password-input"],
  examples: [
    { name: "forgot-password-1-demo", title: "Request a link", file: "forgot-password-1-demo.tsx" },
    { name: "forgot-password-1-reset", title: "Choose a new password", file: "forgot-password-1-reset.tsx" },
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
    customization: ["initialView: 'request' | 'sent' | 'reset' | 'done'", "onRequest / onReset async handlers", "resendAfter: cooldown in seconds"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
