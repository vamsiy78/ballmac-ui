import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "desktop-4",
  type: "registry:block",
  title: "Desktop 4: licence activation",
  description:
    "Licence activation for a paid desktop app: a trial meter, a key field that cleans up pasted keys, activation that shows why a key failed, the licensed view with deactivate, and a trial-ended mode.",
  category: "blocks",
  blockCategory: "desktop",
  tags: ["desktop", "licence", "license", "activation", "trial", "paywall", "license key", "tauri", "electron", "macos", "windows", "feel"],
  files: [{ path: "components/blocks/desktop-4/desktop-4.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "app-window", "button", "input", "progress", "state-view", "use-resource", "feel-presets"],
  examples: [
    { name: "desktop-4-demo", title: "macOS: in the trial", file: "desktop-4-demo.tsx" },
    { name: "desktop-4-windows", title: "Windows", file: "desktop-4-windows.tsx" },
    { name: "desktop-4-expired", title: "Trial ended", file: "desktop-4-expired.tsx" },
    { name: "desktop-4-activating", title: "Activating", file: "desktop-4-activating.tsx" },
    { name: "desktop-4-activated", title: "Activated", file: "desktop-4-activated.tsx" },
    { name: "desktop-4-error", title: "Key refused", file: "desktop-4-error.tsx" },
  ],
  states: [
    { id: "submitting", title: "Activating", example: "desktop-4-activating", trigger: "state=\"submitting\"", note: "The field goes read-only and Activate shows a spinner and \"Activating…\"; announced politely." },
    { id: "success", title: "Activated", example: "desktop-4-activated", trigger: "state=\"success\" (or pass licence)", note: "Who it is licensed to and on which device, with Done and, when onDeactivate is set, Deactivate." },
    { id: "error", title: "Key refused", example: "desktop-4-error", trigger: "state=\"error\"", note: "The reason under the field, announced as an alert and linked to it; errorState.description sets it. Thrown Error messages from onActivate show the same way." },
  ],
  ai: {
    summary:
      "A licence window. <Desktop4 appName trialDaysLeft trialLength buyUrl onActivate={async (key) => { const r = await validate(key); if (!r.ok) throw new Error(r.reason); return { licensedTo: r.email, plan: 'Pro' } }} onContinueTrial onDeactivate />. trialDaysLeft={0} switches to the trial-ended mode with Quit instead of Continue. Pass licence to open on the licensed view.",
    whenToUse: ["Activating a paid Tauri or Electron app with a licence key (Dodo Payments, Lemon Squeezy, Keygen, Paddle)", "The window shown when a trial ends"],
    whenNotToUse: ["Web subscriptions with sign-in (use billing-1 or pricing blocks)", "Entering a one-time code (use verify-1 or input-otp)"],
    composesWith: ["desktop-1", "desktop-6", "app-window", "feel-auto"],
    a11y: [
      { keys: "Enter in the key field", action: "Activates; the field is labelled and its error is linked with aria-describedby" },
      { keys: "Failure", action: "The reason is announced as an alert and the field is marked invalid" },
      { keys: "Success", action: "The activated heading is announced politely" },
    ],
    customization: [
      "feel: 'macos' | 'windows' (defaults to the page's feel); wording follows it (\"this Mac\", \"this PC\") and macOS uses Title Case buttons",
      "seatsNote: one line under the field, e.g. \"One licence works on up to 3 Macs.\"",
      "Dodo Payments: call /licenses/activate from your backend or Tauri command with the key and a device name, then store the instance id for deactivate",
      "state: \"submitting\" | \"success\" | \"error\" to drive it yourself; leave it out and it runs itself",
    ],
  },
  version: "1.0.0",
  updated: "2026-10-17",
})
