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
  registryDependencies: ["shadcn:utils", "button", "checkbox", "field", "input", "select", "status-dot", "textarea", "use-resource"],
  examples: [{ name: "contact-1-demo", title: "Default", file: "contact-1-demo.tsx" },
    { name: "contact-1-support", title: "Support form", file: "contact-1-support.tsx" },
    { name: "contact-1-sending", title: "Sending", file: "contact-1-sending.tsx" },
    { name: "contact-1-sent", title: "Message sent", file: "contact-1-sent.tsx" },
    { name: "contact-1-error", title: "Could not send", file: "contact-1-error.tsx" },
  ],
  states: [
    { id: "submitting", title: "Sending", example: "contact-1-sending", trigger: "state=\"submitting\"", note: "Every field and button is disabled while the request is in flight, the button shows a spinner, and the form is marked busy." },
    { id: "success", title: "Message sent", example: "contact-1-sent", trigger: "state=\"success\"", note: "The confirmation screen the flow ends on." },
    { id: "error", title: "Could not send", example: "contact-1-error", trigger: "state=\"error\"", note: "An alert above the form with the message (errorState.description to change it); the fields stay editable so it can be fixed." },
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
    customization: ["methods: { icon?, label, value, href? }[]", "topics: [] hides the dropdown", "responseTime: null hides the pill", "onSubmit(values): async; throw to show the error state", "state: \"submitting\" | \"success\" | \"error\" (omit it and the form runs by itself); errorState.description sets the failure message. Pair with your own async handler: state={pending ? \"submitting\" : failed ? \"error\" : done ? \"success\" : undefined}"],
  },
  version: "1.1.0",
  updated: "2026-10-11",
  changelog: [
    { version: "1.1.0", date: "2026-10-11", note: "Adds state (submitting, success, error) to drive the form from your own async code, and defaultValues or defaultEmail to prefill. Fields lock while a request is in flight. Unchanged without state." },
    { version: "1.0.0", date: "2026-10-01", note: "First release." },
  ],
})
