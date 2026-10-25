import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "rating-distribution",
  type: "registry:ui",
  title: "Rating Distribution",
  description:
    "The shape of a set of ratings: the average with partly filled stars, the count, and a bar per star size that can filter the reviews beside it.",
  category: "data-display",
  tags: ["reviews", "rating", "stars", "distribution", "histogram", "feedback", "ecommerce"],
  files: [{ path: "components/rating-distribution.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "rating-distribution-demo", title: "Filtering by star size", file: "rating-distribution-demo.tsx" },
    { name: "rating-distribution-static", title: "Few ratings", file: "rating-distribution-static.tsx" },
  ],
  ai: {
    summary:
      "counts is { 1, 2, 3, 4, 5 } (how many of each). The average and total are computed and written as text. onSelect(rating | null) with selected makes each row a toggle button for filtering a review list.",
    whenToUse: ["Above a list of product, app or course reviews", "A feedback summary"],
    whenNotToUse: ["Collecting a rating; use rating", "Satisfaction over time; use chart-line"],
    composesWith: ["rating", "bar-list", "split-bar", "stat-card"],
    a11y: [
      { keys: "Summary", action: "The average and total are text; the stars are decoration" },
      { keys: "Rows", action: "Buttons named '4 stars: 2 ratings. Show only these' with pressed state" },
      { keys: "Counts", action: "Shown as numbers and percents beside each bar" },
    ],
    customization: ["counts", "onSelect and selected"],
  },
  statesNone: "A presentational summary: the counts are passed in, so it has nothing of its own to load.",
  version: "1.0.0",
  updated: "2026-10-25",
})
