import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "hero-8",
  type: "registry:block",
  title: "Hero 8: email signup with floating product",
  description:
    "A hero that asks for one thing, an email. The form checks the address as you leave it, says what happened (working, done, or why not) without losing what you typed, and a product screen floats beside it.",
  category: "blocks",
  blockCategory: "hero",
  tags: ["hero", "signup", "email", "form", "waitlist", "saas", "product", "social proof"],
  files: [{ path: "components/blocks/hero-8/hero-8.tsx" }],
  dependencies: ["lucide-react", "motion@^12"],
  registryDependencies: ["shadcn:utils", "motion-presets"],
  examples: [
    { name: "hero-8-demo", title: "Default", file: "hero-8-demo.tsx" },
    { name: "hero-8-fails", title: "The signup fails", file: "hero-8-fails.tsx" },
  ],
  statesNone: "Static content; the form reports its own working, done and failed states.",
  ai: {
    summary:
      "Conversion hero. <Hero8 announcement={{ text, href }} title description action fineprint onSubmit={(email) => Promise} proof={{ rating, text, people }} successText />. The email is checked on blur and on submit; invalid input shows a message beside the field; onSubmit may reject with a reason that is shown and keeps the typed address. The product screen is decoration, inert and hidden from assistive technology, and holds still with reduced motion.",
    whenToUse: ["A landing page whose goal is a signup or a waitlist", "A launch page with an announcement and proof under the form"],
    whenNotToUse: ["A hero led by a screenshot; use hero-7", "A developer tool led by a command; use hero-2"],
    composesWith: ["logo-cloud-1", "features-1", "testimonials-1", "header-1"],
    a11y: [
      { keys: "Form", action: "A labelled email field with autocomplete and inputMode; errors are alerts linked with aria-invalid; the button shows a working state" },
      { keys: "Result", action: "The success message is a status region" },
      { keys: "Announcement", action: "A real link" },
      { keys: "Decoration", action: "The floating screen is inert, aria-hidden and still with reduced motion" },
    ],
    customization: ["announcement, title, description, action, fineprint", "onSubmit and successText", "proof"],
  },
  version: "1.0.0",
  updated: "2026-10-25",
})
