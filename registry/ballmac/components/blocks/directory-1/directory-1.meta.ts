import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "directory-1",
  type: "registry:block",
  title: "Directory 1: people directory",
  description:
    "A people directory: search across names, roles, teams and cities, department chips with live counts, a location filter, a grid and a compact list, each person with availability and their local time right now.",
  category: "blocks",
  blockCategory: "directory",
  tags: ["directory", "people", "team", "employees", "contacts", "company", "who is who", "time zones", "staff"],
  files: [{ path: "components/blocks/directory-1/directory-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "cover-art", "match-highlight", "segmented-control", "select", "skeleton", "state-view"],
  examples: [
    { name: "directory-1-demo", title: "Grid", file: "directory-1-demo.tsx" },
    { name: "directory-1-list", title: "List", file: "directory-1-list.tsx" },
    { name: "directory-1-loading", title: "Loading", file: "directory-1-loading.tsx" },
    { name: "directory-1-empty", title: "Nobody listed", file: "directory-1-empty.tsx" },
    { name: "directory-1-error", title: "Could not load", file: "directory-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "directory-1-loading", trigger: "state=\"loading\"", note: "Skeleton cards under the real heading, announced as loading." },
    { id: "empty", title: "Nobody listed", example: "directory-1-empty", trigger: "state=\"empty\" (or people={[]})", note: "Says people appear once added; emptyState sets the copy. A search with no match says so with Clear filters." },
    { id: "error", title: "Could not load", example: "directory-1-error", trigger: "state=\"error\"", note: "An alert with Try again (onRetry)." },
  ],
  ai: {
    summary:
      "A people directory. <Directory1 people={[{ id, name, title, department, location, utcOffset: 1, email, pronouns, status: 'available' | 'away' | 'out' }]} now='2026-10-18T10:42:00Z' locale defaultView='grid' | 'list' onSelect />. Local times are worked out from now plus each utcOffset; pass now yourself, the block never reads the clock. Department chips and the location menu come from the data.",
    whenToUse: ["An internal company directory or a team page with filters", "Remote teams that need to see where people are and what time it is for them"],
    whenNotToUse: ["A reporting hierarchy (use orgchart-1)", "A marketing team section with photos (use team-1)"],
    composesWith: ["orgchart-1", "app-shell-1", "about-1"],
    a11y: [
      { keys: "Tab", action: "Search, location, view, department buttons (pressed state announced), then one button per person; the email shortcut is its own link" },
      { keys: "Count", action: "'7 people match' is announced politely as filters change" },
      { keys: "Availability", action: "Written as a word (Available, Away, Out of office) beside the dot, never by color alone" },
    ],
    customization: ["Local time uses each person's utcOffset, so half-hour zones work", "A person between 21:00 and 07:00 locally is marked probably offline", "Pictures are drawn from the name, so identical on server and client"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
