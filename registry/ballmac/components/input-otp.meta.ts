import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "input-otp",
  type: "registry:ui",
  title: "Input OTP",
  description:
    "A one-time-code field with grouped slots, separator, caret, paste and autofill support, invalid state and reduced-motion-safe animation, on a single real input.",
  category: "forms",
  tags: ["otp", "code", "verification", "input"],
  files: [{ path: "components/input-otp.tsx" }],
  dependencies: ["input-otp@^1", "lucide-react"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "input-otp-demo", title: "Verification code", file: "input-otp-demo.tsx" },
    { name: "input-otp-states", title: "PIN, invalid, disabled", file: "input-otp-states.tsx" },
  ],
  ai: {
    summary:
      "<InputOTP maxLength={6}> with InputOTPGroup, InputOTPSlot index and InputOTPSeparator. onComplete fires when every slot is filled.",
    whenToUse: ["Two-step sign-in and email verification", "PIN entry"],
    whenNotToUse: ["Free-form text codes; use input", "Long passwords; use password-input"],
    composesWith: ["field", "label"],
    a11y: [
      { keys: "Type / paste", action: "Fills slots; autofill works with one-time-code" },
      { keys: "Backspace / arrows", action: "Edit like a normal text field" },
      { keys: "Screen readers", action: "One text input is announced, not six boxes" },
    ],
    customization: ["maxLength and pattern", "groups and separators", "aria-invalid", "onComplete"],
  },
  source: {
    name: "shadcn/ui Input OTP",
    url: "https://github.com/shadcn-ui/ui",
    license: "MIT",
    copyright: "Copyright (c) 2023 shadcn",
    modified: true,
  },
  version: "1.0.0",
  updated: "2026-09-30",
});
