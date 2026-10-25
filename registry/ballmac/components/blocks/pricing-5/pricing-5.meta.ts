import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "pricing-5",
  type: "registry:block",
  title: "Pricing 5: price calculator",
  description:
    "A price you work out yourself: slide the number of people, see the volume band and what each person costs, switch on add-ons, and read the monthly or yearly total with the working written out.",
  category: "blocks",
  blockCategory: "pricing",
  tags: ["pricing", "calculator", "seats", "volume", "slider", "add-ons", "yearly", "saas"],
  files: [{ path: "components/blocks/pricing-5/pricing-5.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "switch"],
  examples: [
    { name: "pricing-5-demo", title: "Default", file: "pricing-5-demo.tsx" },
    { name: "pricing-5-simple", title: "Two bands, no add-ons", file: "pricing-5-simple.tsx" },
  ],
  statesNone: "Static content with local choices: the slider, the switches and the total are all on the page, so there is nothing to load or fail.",
  ai: {
    summary:
      "Seat-based pricing calculator. <Pricing5 title description tiers={[{ upTo, perSeat }]} addons={[{ id, label, description, price }]} min max yearlyDiscount currency salesFrom includes href={({ seats, addons, yearly }) => string} />. Each volume band's seats cost that band's rate, so the total grows smoothly; the table writes the working out. Yearly is on by default and takes yearlyDiscount (0.2) off. At salesFrom seats the button says Talk to sales.",
    whenToUse: ["Per-seat software with volume discounts", "Pages where buyers need to check the price for their team"],
    whenNotToUse: ["A flat two or three tier page; use pricing-2", "One-time licences; use pricing-4"],
    composesWith: ["pricing-3", "faq-2", "cta-1", "header-1"],
    a11y: [
      { keys: "Slider", action: "A native range input with a label, a spoken value (n people) and a live output" },
      { keys: "Working", action: "A real table with a caption, column headers and row headers; your band is tagged in words" },
      { keys: "Add-ons", action: "Native checkboxes in a fieldset with prices in the label" },
      { keys: "Yearly", action: "A labelled switch; the total and the saving are written as text and announced" },
      { keys: "Motion", action: "No animation" },
    ],
    customization: ["title and description", "tiers and addons", "min, max, salesFrom", "yearlyDiscount and currency", "href"],
  },
  version: "1.0.0",
  updated: "2026-10-25",
})
