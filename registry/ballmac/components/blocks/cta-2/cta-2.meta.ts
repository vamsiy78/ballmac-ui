import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "cta-2",
  type: "registry:block",
  title: "CTA 2: waitlist over light beams",
  description: "A waitlist or newsletter signup over rising light beams: heading, email field with validation, loading, success and error states.",
  category: "blocks",
  blockCategory: "cta",
  tags: ["cta", "waitlist", "newsletter", "signup", "beams"],
  files: [{ path: "components/blocks/cta-2/cta-2.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "beams-background", "button", "input"],
  examples: [{ name: "cta-2-demo", title: "Default", file: "cta-2-demo.tsx" }],
  ai: {
    summary: "Email capture section. Wire `onSubmit(email)` to your API (throw on failure); the block handles loading, success and error states.",
    whenToUse: ["Pre-launch waitlists", "Newsletter signup at the end of a page"],
    whenNotToUse: ["Collecting more than an email (use a form page)"],
    composesWith: ["hero-4", "features-3", "footer-1"],
    customization: ["eyebrow, title, description, buttonLabel, note, successMessage", "onSubmit(email): Promise<void>"],
  },
  version: "1.0.0",
  updated: "2026-09-29",
})
