import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "faq-2",
  type: "registry:block",
  title: "FAQ 2: searchable with topic filters",
  description: "Frequently asked questions with live search that highlights matches, topic filters with counts, a friendly empty state and a support prompt. Topics scroll sideways on phones.",
  category: "blocks",
  blockCategory: "faq",
  tags: ["faq", "search", "accordion", "help", "support", "filter"],
  files: [{ path: "components/blocks/faq-2/faq-2.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "accordion", "button", "search-field"],
  examples: [
    { name: "faq-2-demo", title: "Default", file: "faq-2-demo.tsx" },
    { name: "faq-2-compact", title: "Two topics", file: "faq-2-compact.tsx" },
  ],
  ai: {
    summary: "A help-centre style FAQ. Pass categories=[{ name, questions: [{ question, answer }] }]; an All filter and search are built in.",
    whenToUse: ["More than eight questions across topics", "Pricing and product pages that attract many questions"],
    whenNotToUse: ["A handful of questions (use faq-1)"],
    composesWith: ["pricing-2", "pricing-3", "cta-1", "footer-1"],
    a11y: [
      { keys: "Enter / Space on a topic", action: "Filters the list (aria-pressed)" },
      { keys: "Typing in search", action: "Filters live; the result count is announced politely" },
    ],
    customization: ["categories: { name, questions: { question, answer }[] }[]", "support: { label, href, text? } (null to hide)"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
