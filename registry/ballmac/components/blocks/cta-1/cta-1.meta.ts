import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "cta-1",
  type: "registry:block",
  title: "CTA 1: framed call to action",
  description: "A closing call-to-action panel: large heading, one line of reassurance and two buttons, over a softly lit animated grid.",
  category: "blocks",
  blockCategory: "cta",
  tags: ["cta", "call to action", "signup", "landing"],
  files: [{ path: "components/blocks/cta-1/cta-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "animated-grid", "button"],
  examples: [{ name: "cta-1-demo", title: "Default", file: "cta-1-demo.tsx" }],
  ai: {
    summary: "The last section before the footer: one decisive action. Edit title, description and the two actions.",
    whenToUse: ["End of landing and pricing pages", "Between long content sections to prompt sign-up"],
    whenNotToUse: ["Top of the page (use a hero)"],
    composesWith: ["footer-1", "faq-1"],
    customization: ["title, description, primaryAction, secondaryAction props"],
  },
  version: "1.0.0",
  updated: "2026-09-28",
})
