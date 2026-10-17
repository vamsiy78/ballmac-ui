import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Agent3, type Agent3Run } from "@/components/ballmac/blocks/agent-3/agent-3"

const runs: Agent3Run[] = [
  {
    id: "r1",
    agent: "Ops",
    task: "Check deploys",
    status: "error",
    started: "Today",
    duration: 3000,
    tokens: 1200,
    spans: [
      { id: "s1", name: "plan", kind: "llm", start: 0, duration: 1000, tokens: 400 },
      { id: "s2", name: "logs.search", kind: "tool", start: 1000, duration: 2000, status: "error", error: "Timed out." },
    ],
  },
  { id: "r2", agent: "Docs", task: "Update guide", status: "success", started: "Today", duration: 1000, tokens: 300, spans: [{ id: "x", name: "write", kind: "llm", start: 0, duration: 1000 }] },
]

describe("Agent3", () => {
  it("opens the failed span first and describes each span for screen readers", () => {
    render(<Agent3 runs={runs} />)
    expect(screen.getByText("Timed out.")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /logs\.search, Tool call, starts at 1\.00 s, takes 2\.00 s, failed/ })).toHaveAttribute("aria-pressed", "true")
  })

  it("filters by status and search, and switches runs", async () => {
    const user = userEvent.setup()
    render(<Agent3 runs={runs} />)
    await user.click(screen.getByRole("radio", { name: "Failed" }))
    expect(screen.queryByText("Update guide")).toBeNull()
    await user.click(screen.getByRole("radio", { name: "All" }))
    await user.type(screen.getByRole("searchbox", { name: "Search runs" }), "guide")
    expect(screen.queryByText("Check deploys")).toBeNull()
    await user.click(screen.getByRole("button", { name: /Update guide/ }))
    expect(screen.getByRole("list", { name: "Spans in Update guide" })).toBeInTheDocument()
  })

  it("shows the empty state with no runs", () => {
    render(<Agent3 runs={[]} />)
    expect(screen.getByText("No runs yet")).toBeInTheDocument()
  })
})
