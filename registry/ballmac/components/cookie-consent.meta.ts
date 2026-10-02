import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "cookie-consent",
  type: "registry:ui",
  title: "Cookie Consent",
  description:
    "A privacy banner with equal-weight Accept all and Reject non-essential, plus a preferences view with a switch per category and locked required ones.",
  category: "saas",
  tags: ["privacy", "cookies", "consent", "gdpr"],
  files: [{ path: "components/cookie-consent.tsx" }],
  dependencies: ["motion@^12", "lucide-react"],
  registryDependencies: ["shadcn:utils", "motion-presets", "i18n"],
  examples: [
    { name: "cookie-consent-demo", title: "Banner", file: "cookie-consent-demo.tsx" },
    { name: "cookie-consent-states", title: "Controlled", file: "cookie-consent-states.tsx" },
  ],
  ai: {
    summary:
      "categories[] with {id,label,description,required}. onConsent receives a map of category to boolean. storageKey saves and remembers the choice in localStorage.",
    whenToUse: ["Sites that set non-essential cookies", "Consent prompts for analytics and marketing"],
    whenNotToUse: ["Legal advice: check your own requirements", "Unrelated notices; use banner"],
    composesWith: ["banner", "switch", "dialog"],
    a11y: [
      { keys: "Tab", action: "Buttons and switches are all reachable; the banner never traps focus" },
      { keys: "Focus", action: "Opening preferences moves focus to the new heading" },
      { keys: "Screen readers", action: "A labelled non-modal dialog; switches announce their state" },
    ],
    customization: ["categories", "placement", "policyHref", "storageKey or controlled open"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
});
