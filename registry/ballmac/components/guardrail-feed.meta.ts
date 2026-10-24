import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "guardrail-feed",
  type: "registry:ui",
  title: "Guardrail Feed",
  description:
    "A feed of what an agent's guardrails did: each check with its rule, action (blocked, redacted, flagged or allowed) and target, counts that double as filters, and rows that open to show why and the text that matched.",
  category: "ai",
  tags: ["ai", "agents", "guardrails", "safety", "policy", "audit", "moderation", "feed"],
  files: [{ path: "components/guardrail-feed.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "guardrail-feed-demo", title: "A morning of checks", file: "guardrail-feed-demo.tsx" },
    { name: "guardrail-feed-quiet", title: "Nothing blocked", file: "guardrail-feed-quiet.tsx" },
  ],
  ai: {
    summary:
      "events is [{ id, time, rule, action: allowed | blocked | redacted | flagged, target, reason?, match? }] newest first. Counts by action are filter buttons; a row with reason or match opens to show them. defaultOpenId opens one row at first.",
    whenToUse: ["Showing people what an agent's safety rules caught", "An audit view of policy checks on an assistant's output or tool use"],
    whenNotToUse: ["A full audit log of a whole product; use the audit block", "The live stream of an agent's steps; use trace or log-stream"],
    composesWith: ["permission-grid", "approval-card", "agent-lanes", "log-stream"],
    a11y: [
      { keys: "Tab, Enter / Space", action: "Filters are toggle buttons; a row's button opens and closes its detail (aria-expanded)" },
      { keys: "Screen readers", action: "Every action is written as a word with an icon; the count of shown checks is a polite live region" },
      { keys: "Disabled filters", action: "An action with no events is disabled instead of hidden, so the set of filters never moves" },
    ],
    customization: ["events and their wording", "title", "defaultOpenId"],
  },
  statesNone: "A presentational feed: the events are passed in, so it has nothing of its own to load, and it shows its own empty message.",
  version: "1.0.0",
  updated: "2026-10-24",
})
