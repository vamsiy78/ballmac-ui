import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "reviews-1",
  type: "registry:block",
  title: "Reviews 1: customer reviews",
  description:
    "Customer reviews: an average with a bar for each star count that also filters, sorting, a verified-only switch, review cards with Read more, helpful votes that count at once and business replies. All figures are worked out from the reviews.",
  category: "blocks",
  blockCategory: "reviews",
  tags: ["reviews", "ratings", "stars", "customer feedback", "testimonials", "social proof", "verified", "product reviews"],
  files: [{ path: "components/blocks/reviews-1/reviews-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "cover-art", "select", "skeleton", "state-view"],
  examples: [
    { name: "reviews-1-demo", title: "Default", file: "reviews-1-demo.tsx" },
    { name: "reviews-1-loading", title: "Loading", file: "reviews-1-loading.tsx" },
    { name: "reviews-1-empty", title: "No reviews yet", file: "reviews-1-empty.tsx" },
    { name: "reviews-1-error", title: "Could not load", file: "reviews-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "reviews-1-loading", trigger: "state=\"loading\"", note: "A skeleton summary and review cards under the real heading, announced as loading." },
    { id: "empty", title: "No reviews yet", example: "reviews-1-empty", trigger: "state=\"empty\" (or reviews={[]})", note: "Invites the first review, with a Write a review button when onWrite is given. Filters with no match say so in place." },
    { id: "error", title: "Could not load", example: "reviews-1-error", trigger: "state=\"error\"", note: "An alert with Try again (onRetry)." },
  ],
  ai: {
    summary:
      "Customer reviews. <Reviews1 reviews={[{ id, author, rating: 1..5, title, body, date: '14 October 2026', iso: '2026-10-14', verified, helpful, context, reply: { from, body, date } }]} onWrite onHelpful={(review, helpful) => ...} />. The average, the bar for each star count and the percentage of 4 and 5 stars are worked out from the reviews. Clicking a bar filters by that star count.",
    whenToUse: ["A product or service page with customer reviews", "A reviews section under pricing or a store listing"],
    whenNotToUse: ["A few hand-picked quotes (use testimonials-1 or testimonials-2)", "A customer story with results (use casestudy-1)"],
    composesWith: ["testimonials-1", "pricing-1", "faq-1", "cta-1"],
    a11y: [
      { keys: "Tab", action: "Star-count buttons (each says its count and whether it is on), the verified switch, sort menu, then per review Read more and Helpful" },
      { keys: "Stars", action: "Drawn stars are hidden from assistive technology and replaced by '4 out of 5 stars' in text" },
      { keys: "Count", action: "'Showing 4 of 8 reviews' is announced politely as filters change" },
    ],
    customization: ["Sort options: most helpful, newest, highest and lowest rated", "Read more appears for bodies over about 220 characters", "A business reply sits under its review with a rule on the reading edge, so it mirrors in right-to-left"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
