import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "poll-1",
  type: "registry:block",
  title: "Poll 1: vote and live results",
  description:
    "A poll: pick one option or several, vote, and results appear with each share, the leader marked and your choice highlighted. Your vote counts at once and is taken back with the reason if it fails; change it until the poll closes.",
  category: "blocks",
  blockCategory: "poll",
  tags: ["poll", "vote", "voting", "results", "survey", "feedback", "community", "roadmap", "choose", "ballot"],
  files: [{ path: "components/blocks/poll-1/poll-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "skeleton", "state-view"],
  examples: [
    { name: "poll-1-demo", title: "Open, not voted", file: "poll-1-demo.tsx" },
    { name: "poll-1-voted", title: "Results after voting", file: "poll-1-voted.tsx" },
    { name: "poll-1-multiple", title: "Choose up to two", file: "poll-1-multiple.tsx" },
    { name: "poll-1-closed", title: "Closed", file: "poll-1-closed.tsx" },
    { name: "poll-1-loading", title: "Loading", file: "poll-1-loading.tsx" },
    { name: "poll-1-empty", title: "No poll", file: "poll-1-empty.tsx" },
    { name: "poll-1-error", title: "Could not load", file: "poll-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "poll-1-loading", trigger: "state=\"loading\"", note: "A skeleton question and options, announced as loading." },
    { id: "empty", title: "No poll", example: "poll-1-empty", trigger: "state=\"empty\" (or options={[]})", note: "Says a question appears here when there is one to vote on; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "poll-1-error", trigger: "state=\"error\"", note: "An alert saying your vote has not been lost, with Try again (onRetry). A vote that fails to save is taken back with its reason in place." },
  ],
  ai: {
    summary:
      "A poll. <Poll1 question description options={[{ id, label, votes, hint }]} multiple maxChoices={2} closesAt='2026-10-20T18:00:00Z' now='2026-10-18T10:00:00Z' defaultVoted={['a']} onVote={(ids) => Promise} />. Before voting people choose (radio buttons, or checkboxes with multiple); after voting, or when closed, they see each share, the single leader and their own choice. Votes are counted at once; reject onVote and they are taken back with the message. Changing a vote removes the old choice and adds the new. Time left comes from closesAt and now; pass now yourself, the block never reads the clock.",
    whenToUse: ["Letting users vote on what to build next", "Community and event polls with live results"],
    whenNotToUse: ["A multi-question survey (use survey-1)", "Scored questions with right answers (use quiz-1)"],
    composesWith: ["survey-1", "comments-1", "changelog-1", "app-shell-1"],
    a11y: [
      { keys: "Arrow keys / Space", action: "Options are real radio buttons (or checkboxes when several are allowed); when the limit is reached the rest are disabled and the legend says the limit" },
      { keys: "Results", action: "Each option reads as its label, percentage and vote count; your choice says Your vote and the leader says Leading, with icons and words, not only color" },
      { keys: "Voting", action: "A counted vote is announced politely; a failure is an alert that says it was taken back" },
    ],
    customization: ["multiple and maxChoices allow several choices", "Leading is shown only when one option is ahead", "See results without voting reveals the bars and offers Vote now"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
