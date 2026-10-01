import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "template-docs",
  type: "registry:block",
  title: "Tern: documentation",
  description:
    "A five-page documentation site: search-first landing, a guide with synced language tabs, filterable API reference, search with highlighted matches and a changelog, with ⌘K search in the header.",
  category: "templates",
  templateKind: "specialty",
  templatePages: [
    { title: "Home", example: "template-docs-demo", path: "/docs" },
    { title: "Guide", example: "template-docs-guide", path: "/docs/guides" },
    { title: "Reference", example: "template-docs-reference", path: "/docs/reference" },
    { title: "Search", example: "template-docs-search", path: "/docs/search" },
    { title: "Changelog", example: "template-docs-changelog", path: "/docs/changelog" },
  ],
  fonts: ["Newsreader", "Instrument Sans", "JetBrains Mono"],
  featured: true,
  tags: ["template", "docs", "documentation", "api reference", "search", "changelog", "developer"],
  files: [
    { path: "components/templates/docs/docs-fonts.ts" },
    { path: "components/templates/docs/docs-data.ts" },
    { path: "components/templates/docs/docs-theme.tsx" },
    { path: "components/templates/docs/docs-home.tsx" },
    { path: "components/templates/docs/docs-guide.tsx" },
    { path: "components/templates/docs/docs-reference.tsx" },
    { path: "components/templates/docs/docs-search.tsx" },
    { path: "components/templates/docs/docs-changelog.tsx" },
    { path: "app/docs/page.tsx" },
    { path: "app/docs/guides/page.tsx" },
    { path: "app/docs/reference/page.tsx" },
    { path: "app/docs/search/page.tsx" },
    { path: "app/docs/changelog/page.tsx" },
  ],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "command", "kbd", "sheet", "snippet-tabs", "install-tabs", "code-block", "callout", "copy-button", "table-of-contents", "api-endpoint"],
  examples: [
    { name: "template-docs-demo", title: "Home", file: "template-docs-demo.tsx" },
    { name: "template-docs-guide", title: "Guide", file: "template-docs-guide.tsx" },
    { name: "template-docs-reference", title: "Reference", file: "template-docs-reference.tsx" },
    { name: "template-docs-search", title: "Search", file: "template-docs-search.tsx" },
    { name: "template-docs-changelog", title: "Changelog", file: "template-docs-changelog.tsx" },
  ],
  docs: "Pages are at /docs, /docs/guides, /docs/reference, /docs/search and /docs/changelog. Edit navigation, search entries, releases and endpoints in docs-data.ts; edit docsCss in docs-theme.tsx for the palette. Language tabs share one storage key (tern-lang), so a reader's choice follows them across pages.",
  ai: {
    summary:
      "Installs a five-page documentation site with ⌘K search, synced language tabs, an on-this-page list, endpoint cards and a changelog. Change content in docs-data.ts and the palette in docsCss.",
    whenToUse: ["Developer docs, API references and product help centres", "Any site that needs search, a guide layout and a changelog"],
    whenNotToUse: ["A long-form editorial site (use the publication template)", "Marketing pages without reference content"],
    composesWith: ["command", "snippet-tabs", "table-of-contents", "api-endpoint", "callout"],
    a11y: [
      { keys: "⌘K / Ctrl+K", action: "Opens the docs search" },
      { keys: "Arrow keys and Enter in search", action: "Move through results and open one" },
      { keys: "Method buttons on the reference page", action: "Filter endpoints; each is a pressed toggle" }
    ],
    customization: ["Replace nav, searchIndex, releases and endpointGroups in docs-data.ts", "Edit docsCss for the light and dark palettes", "Swap the Tern mark in DocsLogo"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
