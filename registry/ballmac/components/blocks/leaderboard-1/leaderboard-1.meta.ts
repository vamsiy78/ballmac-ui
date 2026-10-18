import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "leaderboard-1",
  type: "registry:block",
  title: "Leaderboard 1: podium and rankings",
  description:
    "A leaderboard: a podium with the leader raised, ranked rows with bars against the leader's score, movement written in words, a week, month and all-time switch, a search, and your own place highlighted and pinned.",
  category: "blocks",
  blockCategory: "leaderboard",
  tags: ["leaderboard", "ranking", "podium", "scores", "gamification", "community", "top users", "contest", "competition"],
  files: [{ path: "components/blocks/leaderboard-1/leaderboard-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "avatar", "blur-fade", "button", "cover-art", "number-ticker", "segmented-control", "skeleton", "state-view"],
  examples: [
    { name: "leaderboard-1-demo", title: "This week", file: "leaderboard-1-demo.tsx" },
    { name: "leaderboard-1-pinned", title: "Your place pinned", file: "leaderboard-1-pinned.tsx" },
    { name: "leaderboard-1-loading", title: "Loading", file: "leaderboard-1-loading.tsx" },
    { name: "leaderboard-1-empty", title: "No scores yet", file: "leaderboard-1-empty.tsx" },
    { name: "leaderboard-1-error", title: "Could not load", file: "leaderboard-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "leaderboard-1-loading", trigger: "state=\"loading\"", note: "A skeleton podium and rows under the real heading, announced as loading; the period switch is disabled." },
    { id: "empty", title: "No scores yet", example: "leaderboard-1-empty", trigger: "state=\"empty\" (or entries={[]})", note: "A friendly message that the board fills up with the first points; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "leaderboard-1-error", trigger: "state=\"error\"", note: "An alert with Try again (onRetry)." },
  ],
  ai: {
    summary:
      "A ranked board. <Leaderboard1 entries={[{ id, name, subtitle, avatar, scores: { week, month, all }, change: { week, month, all }, isYou }]} unit=\"pts\" defaultPeriod pageSize locale onPeriodChange onSelect />. The block sorts by the chosen period and numbers the ranks itself; change is how many places a person moved (positive is up). Mark the signed-in user with isYou.",
    whenToUse: ["Community, sales, support or learning rankings", "A contest or challenge board"],
    whenNotToUse: ["A table of data with many columns (use data-table)", "Showing one person's stats (use stat-card or profile-1)"],
    composesWith: ["profile-1", "app-shell-1", "stat-card", "header-2"],
    a11y: [
      { keys: "Podium", action: "Read as an ordered list: \"Rank 1: name, 1,840 pts\"; the decorative numerals and crown are hidden" },
      { keys: "Movement", action: "Up 2 places, Down 1 place or No change are words for screen readers next to the arrow" },
      { keys: "Rows", action: "With onSelect each row is one button named by rank and person; the period switch is a radio group" },
    ],
    customization: ["unit, title, description, pageSize, locale", "scores for all three periods can come from your API; the block does the sorting and ranking", "The podium tones use chart colors, so a theme change recolors them"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
