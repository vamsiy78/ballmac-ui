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
  registryDependencies: ["shadcn:utils", "button", "input", "media", "use-resource"],
  examples: [{ name: "newsletter-1-demo", title: "Default", file: "newsletter-1-demo.tsx" },
    { name: "newsletter-1-simple", title: "Email only", file: "newsletter-1-simple.tsx" },
    { name: "newsletter-1-subscribing", title: "Subscribing", file: "newsletter-1-subscribing.tsx" },
    { name: "newsletter-1-subscribed", title: "Subscribed", file: "newsletter-1-subscribed.tsx" },
    { name: "newsletter-1-error", title: "Could not subscribe", file: "newsletter-1-error.tsx" },
  ],
  states: [
    { id: "submitting", title: "Subscribing", example: "newsletter-1-subscribing", trigger: "state=\"submitting\"", note: "Every field and button is disabled while the request is in flight, the button shows a spinner, and the form is marked busy." },
    { id: "success", title: "Subscribed", example: "newsletter-1-subscribed", trigger: "state=\"success\"", note: "The confirmation screen the flow ends on." },
    { id: "error", title: "Could not subscribe", example: "newsletter-1-error", trigger: "state=\"error\"", note: "An alert above the form with the message (errorState.description to change it); the fields stay editable so it can be fixed." },
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
    customization: ["topics: [] hides the chips", "defaultTopics", "issue: { name, number, headlines } for the preview card", "onSubmit(email, topics)", "state: \"submitting\" | \"success\" | \"error\" (omit it and the form runs by itself); errorState.description sets the failure message. Pair with your own async handler: state={pending ? \"submitting\" : failed ? \"error\" : done ? \"success\" : undefined}"],
  },
  version: "1.1.0",
  updated: "2026-10-11",
  changelog: [
    { version: "1.1.0", date: "2026-10-11", note: "Adds state (submitting, success, error) to drive the form from your own async code, and defaultValues or defaultEmail to prefill. Fields lock while a request is in flight. Unchanged without state." },
    { version: "1.0.0", date: "2026-10-01", note: "First release." },
  ],
})
