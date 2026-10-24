import { AgentLanes, type Lane } from "@/components/ballmac/agent-lanes"

const lanes: Lane[] = [
  {
    id: "planner",
    name: "Planner",
    role: "Breaks down the task",
    segments: [
      { id: "p1", start: 0, end: 38, kind: "thinking", label: "Reads the ticket", detail: "Reads the ticket and the three linked threads, then writes a four-step plan." },
      { id: "p2", start: 38, end: 52, kind: "done", label: "Plan ready" },
    ],
  },
  {
    id: "research",
    name: "Researcher",
    role: "Finds what already exists",
    segments: [
      { id: "r1", start: 40, end: 66, kind: "tool", label: "Searches the repo", detail: "Searches for existing billing helpers and finds two that can be reused." },
      { id: "r2", start: 66, end: 104, kind: "thinking", label: "Compares options" },
    ],
  },
  {
    id: "coder",
    name: "Coder",
    role: "Writes the change",
    segments: [
      { id: "c1", start: 106, end: 168, kind: "tool", label: "Edits 6 files", detail: "Edits the invoice view, the totals helper and four tests." },
      { id: "c2", start: 168, end: 188, kind: "waiting", label: "Waits for tests" },
      { id: "c3", start: 188, end: 232, kind: "thinking", label: "Fixes a failing test" },
    ],
  },
  {
    id: "review",
    name: "Reviewer",
    role: "Checks the result",
    segments: [{ id: "v1", start: 236, end: 262, kind: "done", label: "Approves the change", detail: "Reads the diff, runs the suite once more and approves." }],
  },
]

export default function AgentLanesDemo() {
  return (
    <div className="w-full max-w-4xl">
      <AgentLanes
        lanes={lanes}
        duration={270}
        now={250}
        defaultSelected="c3"
        handoffs={[
          { from: "p2", to: "r1", label: "plan" },
          { from: "r2", to: "c1", label: "findings" },
          { from: "c3", to: "v1", label: "diff" },
        ]}
      />
    </div>
  )
}
