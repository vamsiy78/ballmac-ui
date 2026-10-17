import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "search-1",
  type: "registry:block",
  title: "Search 1: results page",
  description:
    "A search results page: a large search box, the type of result as a filter with live counts, a date filter and sort, results with a trail and highlighted words, and a no-results page that suggests what to try.",
  category: "blocks",
  blockCategory: "search",
  tags: ["search", "results", "filters", "facets", "highlight", "query", "docs", "site search", "enterprise search"],
  files: [{ path: "components/blocks/search-1/search-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "kbd", "match-highlight", "select", "skeleton", "state-view"],
  examples: [
    { name: "search-1-demo", title: "Default", file: "search-1-demo.tsx" },
    { name: "search-1-few", title: "Few results, with a suggestion", file: "search-1-few.tsx" },
    { name: "search-1-no-results", title: "No results", file: "search-1-no-results.tsx" },
    { name: "search-1-loading", title: "Loading", file: "search-1-loading.tsx" },
    { name: "search-1-error", title: "Could not search", file: "search-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "search-1-loading", trigger: "state=\"loading\"", note: "Skeleton filters and results under the real search box, announced as searching; the box is disabled." },
    { id: "empty", title: "No results", example: "search-1-no-results", trigger: "state=\"empty\" (or a search that matches nothing)", note: "A page that says what was searched, suggests a spelling (didYouMean), lists what to try and offers to clear filters; emptyState sets the copy." },
    { id: "error", title: "Could not search", example: "search-1-error", trigger: "state=\"error\"", note: "An alert saying the search was kept, with Try again (onRetry)." },
  ],
  ai: {
    summary:
      "A site or workspace search results page. <Search1 results={[{ id, kind: 'doc' | 'person' | 'project' | 'file', title, snippet, path: ['Docs', 'API'], updated, ageDays, author, href }]} defaultQuery onQueryChange onOpen timing pageSize didYouMean />. It filters and ranks the results you pass; for server search, pass the results your API returned for onQueryChange and keep the filters here.",
    whenToUse: ["The page behind a site, docs or workspace search", "Mixed results of several types that people narrow by type and date"],
    whenNotToUse: ["A quick-jump palette (use command or spotlight-search)", "Searching inside one list (use search-field with the list)", "A help center home (use help-1)"],
    composesWith: ["header-2", "footer-2", "app-shell-1", "match-highlight"],
    a11y: [
      { keys: "/", action: "Jumps to the search from anywhere on the page, unless you are typing in a field" },
      { keys: "Arrow keys on the Type filter", action: "Move between types (native radio buttons); counts are part of each label" },
      { keys: "Typing", action: "The result count is announced politely; each result is one link with a single tab stop" },
    ],
    customization: [
      "pageSize and Show more; timing for \"0.14 s\"",
      "ageDays drives the Updated filter and Newest sort; updated is the label people read",
      "didYouMean appears when there are fewer than three results and on the no-results page",
    ],
  },
  version: "1.0.0",
  updated: "2026-10-17",
})
