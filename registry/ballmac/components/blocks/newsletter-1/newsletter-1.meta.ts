import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "newsletter-1",
  type: "registry:block",
  title: "Newsletter 1: signup with topics and sample issue",
  description: "An editorial newsletter signup: topic chips, an email field with validation, loading, error and success states, avatar social proof, and a tilted sample issue card beside it.",
  category: "blocks",
  blockCategory: "newsletter",
  tags: ["newsletter", "signup", "email", "subscribe", "topics", "form"],
  files: [{ path: "components/blocks/newsletter-1/newsletter-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "input"],
  examples: [
    { name: "newsletter-1-demo", title: "Default", file: "newsletter-1-demo.tsx" },
    { name: "newsletter-1-simple", title: "Email only", file: "newsletter-1-simple.tsx" },
  ],
  ai: {
    summary: "A newsletter signup section. Pass topics (or [] for none), proof, issue headlines for the preview card, and onSubmit(email, topics); throw to show an error.",
    whenToUse: ["Blogs, changelogs and docs sites", "Anywhere readers choose what to receive"],
    whenNotToUse: ["A waitlist over a dramatic background (use cta-2)"],
    composesWith: ["blog-1", "changelog-1", "footer-2", "faq-2"],
    a11y: [
      { keys: "Enter / Space on a topic", action: "Toggles it (aria-pressed)" },
      { keys: "Submit with a bad address", action: "The error is announced as an alert and linked with aria-describedby" },
    ],
    customization: ["topics: [] hides the chips", "defaultTopics", "issue: { name, number, headlines } for the preview card", "onSubmit(email, topics)"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
