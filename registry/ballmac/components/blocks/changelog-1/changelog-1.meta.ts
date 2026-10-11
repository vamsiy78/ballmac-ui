import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "changelog-1",
  type: "registry:block",
  title: "Changelog 1: release notes timeline",
  description: "A release-notes page: a sticky version and date beside each release card, optional banner art for headline releases, typed changes with filters and counts, and a show-older button.",
  category: "blocks",
  blockCategory: "changelog",
  tags: ["changelog", "release notes", "updates", "versions", "timeline", "filter"],
  files: [{ path: "components/blocks/changelog-1/changelog-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "blog-1", "button", "i18n", "media", "state-view", "skeleton"],
  examples: [
    { name: "changelog-1-demo", title: "Default", file: "changelog-1-demo.tsx" },
    { name: "changelog-1-minimal", title: "Minimal", file: "changelog-1-minimal.tsx" },
    { name: "changelog-1-loading", title: "Loading", file: "changelog-1-loading.tsx" },
    { name: "changelog-1-error", title: "Could not load", file: "changelog-1-error.tsx" },
    { name: "changelog-1-no-releases", title: "No releases", file: "changelog-1-no-releases.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "changelog-1-loading", trigger: "state=\"loading\"", note: "A skeleton with the same shapes as the ready view, announced as loading; nothing is clickable." },
    { id: "empty", title: "No releases", example: "changelog-1-no-releases", trigger: "state=\"empty\"", note: "A clear message that there is nothing yet. emptyState sets the copy and can add an action." },
    { id: "error", title: "Could not load", example: "changelog-1-error", trigger: "state=\"error\"", note: "An error with a Try again button (onRetry), announced as an alert." },
  ],
  ai: {
    summary: "A public changelog page. Pass releases=[{ version, date, title, summary?, changes: { type: 'new' | 'improved' | 'fixed', text }[], cover? }] newest first.",
    whenToUse: ["Product release notes", "Open-source project updates"],
    whenNotToUse: ["A compact in-app feed (use changelog-feed)"],
    composesWith: ["newsletter-1", "header-2", "footer-2", "hero-6"],
    a11y: [
      { keys: "Enter / Space on a filter", action: "Filters the changes (aria-pressed); the release count is announced politely" },
      { keys: "Tab", action: "Each change type is also spelled out in text, not only colour" },
    ],
    customization: ["releases: cover (0 to 4) adds banner art to a headline release", "initialCount: releases shown before the button", "feed: null hides the RSS button", "state: \"ready\" | \"loading\" | \"empty\" | \"error\"; onRetry, emptyState and errorState set the retry action and the copy. Pair with useResource: state={r.state} onRetry={r.retry}"],
  },
  version: "1.1.0",
  updated: "2026-10-11",
  changelog: [
    { version: "1.1.0", date: "2026-10-11", note: "Adds state (loading, empty, error) with onRetry, emptyState and errorState: a skeleton with the same shapes as the ready view, an error with retry, and an empty message. Unchanged without state." },
    { version: "1.0.0", date: "2026-10-01", note: "First release." },
  ],
})
