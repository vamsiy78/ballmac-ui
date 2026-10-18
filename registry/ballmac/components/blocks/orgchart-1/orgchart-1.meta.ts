import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "orgchart-1",
  type: "registry:block",
  title: "Org chart 1: organization tree",
  description:
    "An organization chart drawn as a real tree: connected person cards, a count toggle on every team, search that opens the path to a person, a details panel with manager and direct reports, and the standard tree keys.",
  category: "blocks",
  blockCategory: "orgchart",
  tags: ["org chart", "organization", "hierarchy", "team", "people", "tree", "reports", "company", "about"],
  files: [{ path: "components/blocks/orgchart-1/orgchart-1.tsx" }],
  dependencies: ["lucide-react", "motion"],
  registryDependencies: ["shadcn:utils", "button", "cover-art", "direction", "match-highlight", "skeleton", "state-view"],
  examples: [
    { name: "orgchart-1-demo", title: "Two levels open", file: "orgchart-1-demo.tsx" },
    { name: "orgchart-1-open", title: "Everyone, a deep report selected", file: "orgchart-1-open.tsx" },
    { name: "orgchart-1-loading", title: "Loading", file: "orgchart-1-loading.tsx" },
    { name: "orgchart-1-empty", title: "No chart yet", file: "orgchart-1-empty.tsx" },
    { name: "orgchart-1-error", title: "Could not load", file: "orgchart-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "orgchart-1-loading", trigger: "state=\"loading\"", note: "Skeleton cards under the real heading, announced as loading." },
    { id: "empty", title: "No chart yet", example: "orgchart-1-empty", trigger: "state=\"empty\"", note: "Explains that the chart draws itself once people and reporting lines are added; emptyState sets the copy and can add a button." },
    { id: "error", title: "Could not load", example: "orgchart-1-error", trigger: "state=\"error\"", note: "An alert with Try again (onRetry)." },
  ],
  ai: {
    summary:
      "An org chart. <Org1 root={{ id, name, title, team, location, email, reports: [...] }} defaultExpandedDepth={2} defaultSelectedId onSelect />. Pass one root person; everyone below hangs off reports. Search opens the path to the person; the side panel shows the manager and direct reports and lets you jump to them.",
    whenToUse: ["An about or team page showing who reports to whom", "An internal directory with reporting lines"],
    whenNotToUse: ["A grid of team photos with no hierarchy (use team-1)", "A flat people directory with filters (use a table)"],
    composesWith: ["about-1", "team-1", "app-shell-1"],
    a11y: [
      { keys: "Tab, then Up / Down / Home / End", action: "Move through the visible people in reading order (a roving tree)" },
      { keys: "Right / Left", action: "Open or close a team; Right on an open team goes to the first report, Left goes to the manager (swapped in right-to-left)" },
      { keys: "Enter / Space", action: "Choose a person and show their details" },
      { keys: "Names", action: "Each card is announced as name, role, team and how many people are in their organization" },
    ],
    customization: ["defaultExpandedDepth: 1 shows only the top", "Connectors and the count toggle mirror in right-to-left", "Avatars are seeded art from the name, so they are identical on server and client"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
