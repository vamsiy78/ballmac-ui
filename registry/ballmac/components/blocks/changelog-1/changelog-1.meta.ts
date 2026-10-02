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
  registryDependencies: ["shadcn:utils", "blog-1", "button", "i18n", "media"],
  examples: [
    { name: "changelog-1-demo", title: "Default", file: "changelog-1-demo.tsx" },
    { name: "changelog-1-minimal", title: "Minimal", file: "changelog-1-minimal.tsx" },
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
    customization: ["releases: cover (0 to 4) adds banner art to a headline release", "initialCount: releases shown before the button", "feed: null hides the RSS button"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
