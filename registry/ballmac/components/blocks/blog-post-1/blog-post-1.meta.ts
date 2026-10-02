import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "blog-post-1",
  type: "registry:block",
  title: "Blog Post 1: article with contents and progress",
  description: "A long-form article page: centered title and author row, cover, comfortable prose with pull quote and code, sticky table of contents with scroll spy, reading progress bar, author card and related posts.",
  category: "blocks",
  blockCategory: "blog",
  tags: ["blog", "article", "post", "prose", "table of contents", "reading progress"],
  files: [{ path: "components/blocks/blog-post-1/blog-post-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "blog-1", "breadcrumb", "copy-button", "scroll-progress", "table-of-contents", "i18n"],
  examples: [
    { name: "blog-post-1-demo", title: "Default", file: "blog-post-1-demo.tsx" },
    { name: "blog-post-1-short", title: "Your own content", file: "blog-post-1-short.tsx" },
  ],
  ai: {
    summary: "An article template. Pass title, subtitle, author, date and readMinutes, give the body as children (plain h2, h3, p, ul, blockquote and pre are styled), and list the headings in toc.",
    whenToUse: ["Blog posts, guides and announcements", "Any long reading page"],
    whenNotToUse: ["Documentation with a left sidebar (use your docs layout)"],
    composesWith: ["blog-1", "newsletter-1", "header-2", "footer-2"],
    a11y: [
      { keys: "Tab", action: "Reaches the breadcrumb, the copy button, links in the body, then the contents list" },
      { keys: "Enter on a contents link", action: "Scrolls to that heading; the current section is marked with aria-current" },
    ],
    customization: ["children: your article, with ids on h2 and h3 headings", "toc: { id, title, level }[] matching those ids", "stickyOffset: pixels to keep clear of a fixed header", "related: [] hides the Keep reading section"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
