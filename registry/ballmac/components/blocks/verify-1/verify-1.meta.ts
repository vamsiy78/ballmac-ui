import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "verify-1",
  type: "registry:block",
  title: "Verify 1: one-time code with resend",
  description: "A code-entry screen: masked email, six slots that accept typing and pasting, automatic submit on the last digit, shake and alert on a wrong code, a resend countdown and an animated success state.",
  category: "blocks",
  blockCategory: "auth",
  tags: ["verify", "otp", "code", "two-factor", "email", "resend"],
  files: [{ path: "components/blocks/verify-1/verify-1.tsx" }],
  dependencies: ["lucide-react", "motion@^12"],
  registryDependencies: ["shadcn:utils", "button", "input-otp"],
  examples: [
    { name: "verify-1-demo", title: "Default", file: "verify-1-demo.tsx" },
    { name: "verify-1-four", title: "Four digits", file: "verify-1-four.tsx" },
  ],
  ai: {
    summary: "Email or SMS code verification. Pass email, length, onVerify(code) (throw for a wrong code) and onResend. Without onVerify any code except all zeros succeeds, so you can try every state.",
    whenToUse: ["Email confirmation after signup", "Two-factor sign-in and sensitive actions"],
    whenNotToUse: ["Magic links that need no typing"],
    composesWith: ["signup-1", "login-2", "forgot-password-1", "onboarding-1"],
    a11y: [
      { keys: "Typing or pasting", action: "Fills the slots; the last digit submits automatically" },
      { keys: "Wrong code", action: "Announced as an alert, the field is marked invalid and focus returns to it" },
      { keys: "Resend", action: "The countdown is shown as text; the button is disabled until it ends" },
    ],
    customization: ["length: digits in the code", "onVerify, onResend, onChangeEmail (null hides)", "resendAfter: seconds"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
