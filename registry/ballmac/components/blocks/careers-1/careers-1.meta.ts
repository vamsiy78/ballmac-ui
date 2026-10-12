import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "careers-1",
  type: "registry:block",
  title: "Careers 1: open roles with filters and perks",
  description: "Open roles grouped by team with team filter chips, live search and an empty state, then a hairline grid of perks. Every role row is one large link with location and type.",
  category: "blocks",
  blockCategory: "careers",
  tags: ["careers", "jobs", "hiring", "roles", "filter", "perks"],
  files: [{ path: "components/blocks/careers-1/careers-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "search-field"],
  examples: [
    { name: "careers-1-demo", title: "Default", file: "careers-1-demo.tsx" },
    { name: "careers-1-small", title: "A few roles", file: "careers-1-small.tsx" },
  ],
  statesNone: "Static content: nothing to load, submit or fail.",
  ai: {
    summary: "A jobs section. Pass jobs=[{ title, team, location, type?, href }] and optionally perks=[{ icon?, title, description }]; teams and filters are derived from the jobs.",
    whenToUse: ["Company careers pages", "Open source projects looking for maintainers"],
    whenNotToUse: ["A full applicant tracking system"],
    composesWith: ["team-1", "contact-1", "header-2", "footer-2"],
    a11y: [
      { keys: "Enter / Space on a team chip", action: "Filters the roles (aria-pressed); the count is announced politely" },
      { keys: "Tab", action: "Each role is a single link with its location and type in the name" },
    ],
    customization: ["jobs / perks arrays", "perks: [] hides the grid", "openApplication: null hides the link"],
  },
  version: "1.0.1",
  updated: "2026-10-11",
  changelog: [
    { version: "1.0.1", date: "2026-10-11", note: "Hover lift and press depth follow the theme's --bm-lift and --bm-hover tokens. Unchanged by default." },
    { version: "1.0.0", date: "2026-10-01", note: "First release." },
  ],
})
