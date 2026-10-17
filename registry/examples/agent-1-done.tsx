"use client"

import { Agent1, type Agent1Run } from "@/components/ballmac/blocks/agent-1/agent-1"

const run: Agent1Run = {
  task: "Summarize this week’s failed deploys and open an issue for the worst one",
  agent: "Ops agent",
  status: "done",
  elapsed: "1 min 52 s",
  usage: { tokens: 41208, cost: "$0.14" },
  steps: [
    { id: "1", title: "Read deploy logs from the last 7 days", status: "done", duration: "18 s" },
    { id: "2", title: "Group failures by cause", status: "done", duration: "34 s" },
    { id: "3", title: "Open an issue for the most frequent cause", status: "done", duration: "9 s" },
  ],
  events: [
    { id: "e1", type: "tool", name: "deploys.list", status: "success", duration: 1240, description: "142 deploys, 9 failed", input: { since: "7d" } },
    { id: "e2", type: "tool", name: "logs.search", status: "success", duration: 3120, description: "Failure logs for 9 deploys", input: { status: "failed" } },
    { id: "e3", type: "tool", name: "issues.create", status: "success", duration: 680, description: "Issue #812 opened", input: { title: "Migrations time out on large tables" }, result: { number: 812 } },
  ],
  output:
    "9 of 142 deploys failed this week.\n\n• 5 failed because a migration timed out on the events table (issue #812 opened).\n• 3 failed on a flaky end-to-end test in checkout.\n• 1 failed because a secret had expired; it has since been rotated.",
}

export default function Agent1Done() {
  return <Agent1 run={run} onFollowUp={() => {}} />
}
