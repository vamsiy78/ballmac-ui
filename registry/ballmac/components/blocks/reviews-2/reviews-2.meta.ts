import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "reviews-2",
  type: "registry:block",
  title: "Reviews 2: ratings with insights",
  description:
    "Reviews with the whole picture: the average and the shape of the ratings (which filter the list), what people keep mentioning, and whether the mood is positive. The list follows the star size you choose.",
  category: "blocks",
  blockCategory: "reviews",
  tags: ["reviews", "ratings", "social proof", "insights", "sentiment", "filter", "ecommerce", "feedback"],
  files: [{ path: "components/blocks/reviews-2/reviews-2.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "skeleton", "state-view", "rating-distribution", "bar-list", "split-bar"],
  examples: [
    { name: "reviews-2-demo", title: "Default", file: "reviews-2-demo.tsx" },
    { name: "reviews-2-few", title: "Two reviews", file: "reviews-2-few.tsx" },
    { name: "reviews-2-loading", title: "Loading", file: "reviews-2-loading.tsx" },
    { name: "reviews-2-empty", title: "No reviews yet", file: "reviews-2-empty.tsx" },
    { name: "reviews-2-error", title: "Could not load", file: "reviews-2-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "reviews-2-loading", trigger: "state=\"loading\"", note: "Skeleton summary, list and side panels under the real heading, announced as loading." },
    { id: "empty", title: "No reviews yet", example: "reviews-2-empty", trigger: "state=\"empty\"", note: "Says there are no reviews yet; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "reviews-2-error", trigger: "state=\"error\"", note: "An alert saying nothing was changed, with Try again (onRetry)." },
  ],
  ai: {
    summary:
      "Reviews with insights. <Reviews2 title description reviews={[{ id, author, rating, date, title, body, verified?, helpful? }]} counts themes={BarListItem[]} sentiment={SplitSegment[]} />. Counts default to the reviews given. Choosing a star size filters the list and the count is announced politely.",
    whenToUse: ["A product or app page where reviews drive the decision", "A review dashboard for the team"],
    whenNotToUse: ["A scrolling quote wall for a landing page; use testimonials-1", "Collecting a review; use a form"],
    composesWith: ["analytics-1", "testimonials-1", "hero-1", "pricing-2"],
    a11y: [
      { keys: "Filter", action: "Each star row is a toggle button named for its count; the list's size is announced" },
      { keys: "Reviews", action: "Each is a list item; the star rating is spoken as 'n out of 5 stars'" },
      { keys: "Charts", action: "The bars and the mood split repeat numbers shown as text" },
    ],
    customization: ["title and description", "reviews and counts", "themes and sentiment"],
  },
  version: "1.0.0",
  updated: "2026-10-24",
})
