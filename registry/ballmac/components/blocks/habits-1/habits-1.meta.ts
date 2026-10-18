import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "habits-1",
  type: "registry:block",
  title: "Habits 1: streaks and weekly goals",
  description:
    "A habit tracker: each habit with its streak (kept alive until today ends), best streak, this week against its goal, the last seven days to tick, twelve weeks as a grid, a ring for today, and ticks that go back if they fail.",
  category: "blocks",
  blockCategory: "habits",
  tags: ["habits", "streak", "habit tracker", "routine", "goals", "daily", "wellness", "consistency", "check-in"],
  files: [{ path: "components/blocks/habits-1/habits-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "input", "skeleton", "state-view"],
  examples: [
    { name: "habits-1-demo", title: "Four habits", file: "habits-1-demo.tsx" },
    { name: "habits-1-fresh", title: "Just started", file: "habits-1-fresh.tsx" },
    { name: "habits-1-loading", title: "Loading", file: "habits-1-loading.tsx" },
    { name: "habits-1-empty", title: "No habits yet", file: "habits-1-empty.tsx" },
    { name: "habits-1-error", title: "Could not load", file: "habits-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "habits-1-loading", trigger: "state=\"loading\"", note: "Skeleton cards under the real heading, announced as loading." },
    { id: "empty", title: "No habits yet", example: "habits-1-empty", trigger: "state=\"empty\" (or habits={[]})", note: "Says to pick one small thing to do most days; emptyState sets the copy and can add a button." },
    { id: "error", title: "Could not load", example: "habits-1-error", trigger: "state=\"error\"", note: "An alert saying nothing was lost, with Try again (onRetry). A tick that fails to save goes back with its reason under the habit." },
  ],
  ai: {
    summary:
      "A habit tracker. <Habits1 habits={[{ id, name, target: 5, done: ['2026-10-18'], tone: 1..5 }]} today='2026-10-18' locale onToggle={(habitId, date, done) => Promise} onAdd={({ name, target }) => Promise} />. The streak is the run of days ending today, or yesterday while today is not done yet, so it only breaks when a day is missed. Best streak, this-week count (Monday to today) and the goal are worked out from done. Pass today yourself; the block never reads the clock. Reject onToggle and the day goes back with the message.",
    whenToUse: ["Wellness, learning and productivity apps with daily routines", "A team ritual tracker"],
    whenNotToUse: ["One-off to-dos (use tasks-1)", "Long-term targets with numbers (use goals-1)"],
    composesWith: ["goals-1", "tasks-1", "leaderboard-1", "app-shell-1"],
    a11y: [
      { keys: "Tab, Space", action: "Each day is a checkbox named for the habit and the full date ('Read for 20 minutes, Sunday 18 October, today'); toggling is announced politely" },
      { keys: "Streak", action: "'12 days streak' and 'Best 18' are written in text with icons; this week reads '4 of 5 this week, goal reached'" },
      { keys: "Twelve weeks", action: "The grid is a picture with a text equivalent giving how many of the last 84 days were done" },
    ],
    customization: ["tone picks one of five chart colors per habit", "The history grid runs oldest to newest left to right in every language, like a chart", "target is days a week; a week counts Monday to Sunday"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
