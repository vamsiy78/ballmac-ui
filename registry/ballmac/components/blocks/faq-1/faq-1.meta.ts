import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "faq-1",
  type: "registry:block",
  title: "FAQ 1: accordion with heading",
  description: "Frequently asked questions in an accessible accordion, with the heading and a help line in a side column on desktop.",
  category: "blocks",
  blockCategory: "faq",
  tags: ["faq", "accordion", "questions", "support"],
  files: [{ path: "components/blocks/faq-1/faq-1.tsx" }],
  registryDependencies: ["shadcn:utils", "accordion"],
  examples: [{ name: "faq-1-demo", title: "Default", file: "faq-1-demo.tsx" }],
  ai: {
    summary: "An FAQ section. Pass items=[{ question, answer }]; the first answer starts open.",
    whenToUse: ["Pricing pages and landing pages", "Support and onboarding pages"],
    whenNotToUse: ["Long documentation (use a docs page)"],
    composesWith: ["pricing-1", "cta-1"],
    customization: ["items: { question, answer }[]", "title and description props"],
  },
  version: "1.0.0",
  updated: "2026-09-28",
})
