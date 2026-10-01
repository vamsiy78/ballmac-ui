import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "contact-1",
  type: "registry:block",
  title: "Contact 1: form with contact methods",
  description: "A contact section with a validated form (name, email, topic, message with counter, consent), loading, error and thank-you states, beside tiles for email, chat, phone and office with a response-time pill.",
  category: "blocks",
  blockCategory: "contact",
  tags: ["contact", "form", "support", "validation", "email", "sales"],
  files: [{ path: "components/blocks/contact-1/contact-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "checkbox", "field", "input", "select", "status-dot", "textarea"],
  examples: [
    { name: "contact-1-demo", title: "Default", file: "contact-1-demo.tsx" },
    { name: "contact-1-support", title: "Support form", file: "contact-1-support.tsx" },
  ],
  ai: {
    summary: "Contact page section. Pass methods, topics and onSubmit(values) (throw to show an error). Validation, focus on the first error, loading and the thank-you screen are built in.",
    whenToUse: ["Contact and support pages", "Sales enquiry sections"],
    whenNotToUse: ["Newsletter signup (use newsletter-1)", "Authenticated in-app feedback (use feedback-widget)"],
    composesWith: ["faq-2", "header-2", "footer-2", "careers-1"],
    a11y: [
      { keys: "Submit with errors", action: "Focus moves to the first invalid field; each error is announced as an alert and linked with aria-describedby" },
      { keys: "Arrow keys / Enter in the topic menu", action: "Choose a topic (Radix Select)" },
    ],
    customization: ["methods: { icon?, label, value, href? }[]", "topics: [] hides the dropdown", "responseTime: null hides the pill", "onSubmit(values): async; throw to show the error state"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
