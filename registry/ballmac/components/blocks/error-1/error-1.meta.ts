import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "error-1",
  type: "registry:block",
  title: "Error 1: friendly 404, 403 and 500 page",
  description: "An error page with giant fading numerals whose zero is a ring with an orbiting moon, plain-language copy per status, home and back buttons, site search and helpful links.",
  category: "blocks",
  blockCategory: "error",
  tags: ["error", "404", "not found", "500", "403", "page"],
  files: [{ path: "components/blocks/error-1/error-1.tsx" }],
  dependencies: ["lucide-react", "motion@^12"],
  registryDependencies: ["shadcn:utils", "button", "search-field"],
  examples: [
    { name: "error-1-demo", title: "404", file: "error-1-demo.tsx" },
    { name: "error-1-server", title: "500 with reference", file: "error-1-server.tsx" },
  ],
  ai: {
    summary: "Drop into not-found.tsx or error.tsx. Set status ('404' | '403' | '500'); override title and description if you like; pass onSearch to wire the search box, links for next steps and reference for a request id.",
    whenToUse: ["Next.js not-found.tsx and error.tsx", "Any missing, forbidden or failed page"],
    whenNotToUse: ["Inline errors inside a form or panel (use alert or empty-state)"],
    composesWith: ["header-2", "footer-2", "contact-1"],
    a11y: [
      { keys: "Page title", action: "The heading is prefixed with 'Error 404:' for screen readers; the giant numerals are decorative" },
      { keys: "Enter in the search field", action: "Calls onSearch with the query" },
    ],
    customization: ["status picks the numerals and default copy", "links: [] hides the cards, search: false hides the field", "The orbiting moon stops for reduced motion"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
