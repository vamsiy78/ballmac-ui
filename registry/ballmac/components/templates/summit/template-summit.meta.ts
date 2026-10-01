import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "template-summit",
  type: "registry:block",
  title: "Northlight Summit: conference",
  description:
    "A five-page conference site under a sunrise ridgeline: a hero with a live countdown, a schedule you can star into an agenda with clash warnings, speakers with bios, tickets with a live total and promo code, and a venue guide.",
  category: "templates",
  templateKind: "specialty",
  templatePages: [
    { title: "Home", example: "template-summit-demo", path: "/summit" },
    { title: "Schedule", example: "template-summit-schedule", path: "/summit/schedule" },
    { title: "Speakers", example: "template-summit-speakers", path: "/summit/speakers" },
    { title: "Tickets", example: "template-summit-tickets", path: "/summit/tickets" },
    { title: "Venue", example: "template-summit-venue", path: "/summit/venue" },
  ],
  fonts: ["Unbounded", "Figtree"],
  featured: true,
  tags: ["template", "event", "conference", "summit", "schedule", "speakers", "tickets", "countdown"],
  files: [
    { path: "components/templates/summit/summit-fonts.ts" },
    { path: "components/templates/summit/summit-data.ts" },
    { path: "components/templates/summit/summit-theme.tsx" },
    { path: "components/templates/summit/summit-home.tsx" },
    { path: "components/templates/summit/summit-schedule.tsx" },
    { path: "components/templates/summit/summit-speakers.tsx" },
    { path: "components/templates/summit/summit-tickets.tsx" },
    { path: "components/templates/summit/summit-venue.tsx" },
    { path: "app/summit/page.tsx" },
    { path: "app/summit/schedule/page.tsx" },
    { path: "app/summit/speakers/page.tsx" },
    { path: "app/summit/tickets/page.tsx" },
    { path: "app/summit/venue/page.tsx" },
  ],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "dialog", "accordion"],
  examples: [
    { name: "template-summit-demo", title: "Home", file: "template-summit-demo.tsx" },
    { name: "template-summit-schedule", title: "Schedule", file: "template-summit-schedule.tsx" },
    { name: "template-summit-speakers", title: "Speakers", file: "template-summit-speakers.tsx" },
    { name: "template-summit-tickets", title: "Tickets", file: "template-summit-tickets.tsx" },
    { name: "template-summit-venue", title: "Venue", file: "template-summit-venue.tsx" },
  ],
  docs: "Pages are at /summit, /summit/schedule, /summit/speakers, /summit/tickets and /summit/venue. Speakers, sessions, tiers and FAQ live in summit-data.ts; set EVENT_DATE for the countdown. The promo code in the demo is NORTH10. Replace Portrait with photos when you have them.",
  ai: {
    summary:
      "Installs a five-page conference site with a countdown, a starrable schedule that warns about clashes, speaker dialogs, a ticket calculator with group and promo discounts, and a venue guide. Edit summit-data.ts and summitCss.",
    whenToUse: ["Conferences, meetups and festivals", "Any event site with a schedule, speakers and ticket tiers"],
    whenNotToUse: ["Ticketing with real payments (wire the form to your processor first)"],
    composesWith: ["dialog", "accordion", "countdown"],
    a11y: [
      { keys: "Star button on a session", action: "Adds or removes it from your agenda; the summary updates in a live region" },
      { keys: "Enter on a speaker", action: "Opens their bio in a dialog; Escape closes it" },
      { keys: "Arrow buttons beside the ticket count", action: "Change the quantity; the total is announced" }
    ],
    customization: ["Edit summit-data.ts for the event, speakers, sessions and tiers", "Change summitCss for the sky and ridge colours", "Swap Portrait for real photos", "Connect the checkout form to your payment provider"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
