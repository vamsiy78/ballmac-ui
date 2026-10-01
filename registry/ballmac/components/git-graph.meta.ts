import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "git-graph",
  type: "registry:ui",
  title: "Git Graph",
  description:
    "A commit history with lane-routed branch and merge lines, branch and tag labels, authors and dates, selection, and listbox keyboard navigation.",
  category: "developer",
  tags: ["git", "commits", "history", "branches", "graph"],
  files: [{ path: "components/git-graph.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "git-graph-demo", title: "Branches and a merge", file: "git-graph-demo.tsx" },
    { name: "git-graph-linear", title: "Linear history", file: "git-graph-linear.tsx" },
  ],
  ai: {
    summary:
      "commits is newest first: [{ hash, parents, message, author, date, branches?, tags? }]. Lanes are computed for you (layoutCommits is exported). selected/onSelect for a detail view. Rows are listbox options.",
    whenToUse: ["Repository or release history views", "Explaining a branching strategy in docs"],
    whenNotToUse: ["Diffs (diff-viewer)", "Huge histories without paging"],
    composesWith: ["diff-viewer", "code-block", "badge"],
    a11y: [
      { keys: "ArrowUp / ArrowDown", action: "Moves the active commit" },
      { keys: "Home / End", action: "First or last commit" },
      { keys: "Enter / Space", action: "Selects the active commit" },
      { keys: "Screen readers", action: "Each option reads message, author, date, short hash, merge and refs" },
    ],
    customization: ["selected / onSelect", "hideAuthors", "label"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
