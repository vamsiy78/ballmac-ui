import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "blog-1",
  type: "registry:block",
  title: "Blog 1: featured post with filterable grid",
  description: "A blog index with a large featured post, topic filter chips and a three-column grid. Posts without a photo get a generated cover drawn from theme tokens, in five compositions.",
  category: "blocks",
  blockCategory: "blog",
  tags: ["blog", "posts", "articles", "index", "filter", "cards"],
  files: [{ path: "components/blocks/blog-1/blog-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n", "media", "state-view", "skeleton"],
  examples: [
    { name: "blog-1-demo", title: "Default", file: "blog-1-demo.tsx" },
    { name: "blog-1-compact", title: "Three posts", file: "blog-1-compact.tsx" },
    { name: "blog-1-loading", title: "Loading", file: "blog-1-loading.tsx" },
    { name: "blog-1-error", title: "Could not load", file: "blog-1-error.tsx" },
    { name: "blog-1-no-posts", title: "No posts", file: "blog-1-no-posts.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "blog-1-loading", trigger: "state=\"loading\"", note: "A skeleton with the same shapes as the ready view, announced as loading; nothing is clickable." },
    { id: "empty", title: "No posts", example: "blog-1-no-posts", trigger: "state=\"empty\"", note: "A clear message that there is nothing yet. emptyState sets the copy and can add an action." },
    { id: "error", title: "Could not load", example: "blog-1-error", trigger: "state=\"error\"", note: "An error with a Try again button (onRetry), announced as an alert." },
  ],
  ai: {
    summary: "The index page of a blog. Pass posts=[{ title, excerpt, category, date, readMinutes, author, role?, href, image?, cover? }]; the first post is featured. Also exports BlogCover for your own cards.",
    whenToUse: ["Company and product blogs", "Resource and news pages"],
    whenNotToUse: ["A single article (use blog-post-1)", "Hundreds of posts that need pagination and search"],
    composesWith: ["blog-post-1", "newsletter-1", "header-2", "footer-2"],
    a11y: [
      { keys: "Enter / Space on a topic chip", action: "Filters the list (aria-pressed); the count is announced politely" },
      { keys: "Tab", action: "Each card has one link; the whole card is clickable" },
    ],
    customization: ["posts: image for a photo, or cover (0 to 4) to choose a generated cover", "filterable: false hides the chips", "locale for dates (UTC, fixed by default)", "state: \"ready\" | \"loading\" | \"empty\" | \"error\"; onRetry, emptyState and errorState set the retry action and the copy. Pair with useResource: state={r.state} onRetry={r.retry}"],
  },
  version: "1.1.0",
  updated: "2026-10-11",
  changelog: [
    { version: "1.1.0", date: "2026-10-11", note: "Adds state (loading, empty, error) with onRetry, emptyState and errorState: a skeleton with the same shapes as the ready view, an error with retry, and an empty message. Unchanged without state." },
    { version: "1.0.0", date: "2026-10-01", note: "First release." },
  ],
})
