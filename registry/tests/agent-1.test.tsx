import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Agent1, type Agent1Run } from "@/components/ballmac/blocks/agent-1/agent-1"

const run: Agent1Run = {
  task: "Archive old projects",
  status: "waiting",
  steps: [{ id: "1", title: "Find projects", status: "done" }],
  events: [
    { id: "m", type: "message", text: "Found 3 projects older than a year." },
    { id: "t", type: "tool", name: "projects.list", status: "success" },
    { id: "a", type: "approval", title: "Archive 3 projects", risk: "medium", status: "pending" },
  ],
}

describe("Agent1", () => {
  it("shows the task, the waiting status, and every event in order", () => {
    render(<Agent1 run={run} />)
    expect(screen.getByRole("heading", { name: "Archive old projects" })).toBeInTheDocument()
    expect(screen.getByText("Waiting for you").closest("[role=status]")).not.toBeNull()
    expect(screen.getByText("Found 3 projects older than a year.")).toBeInTheDocument()
    expect(screen.getByText("projects.list")).toBeInTheDocument()
  })

  it("approves in place and reports the event id", async () => {
    const user = userEvent.setup()
    const onApprove = vi.fn()
    render(<Agent1 run={run} onApprove={onApprove} />)
    await user.click(screen.getByRole("button", { name: /Approve/ }))
    expect(onApprove).toHaveBeenCalledWith("a")
    expect(screen.queryByRole("button", { name: /Approve/ })).toBeNull()
  })

  it("offers Stop while working, Run again after a failure, and sends follow-ups", async () => {
    const user = userEvent.setup()
    const onStop = vi.fn()
    const onRunAgain = vi.fn()
    const onFollowUp = vi.fn()
    const { rerender } = render(<Agent1 run={run} onStop={onStop} onFollowUp={onFollowUp} />)
    await user.click(screen.getByRole("button", { name: "Stop" }))
    expect(onStop).toHaveBeenCalled()
    await user.type(screen.getByRole("textbox", { name: "Follow-up instruction" }), "Skip the design project{Enter}")
    expect(onFollowUp).toHaveBeenCalledWith("Skip the design project")
    rerender(<Agent1 run={{ ...run, status: "failed" }} onStop={onStop} onRunAgain={onRunAgain} />)
    expect(screen.queryByRole("button", { name: "Stop" })).toBeNull()
    await user.click(screen.getByRole("button", { name: "Run again" }))
    expect(onRunAgain).toHaveBeenCalled()
  })

  it("shows the error state with retry", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    render(<Agent1 state="error" onRetry={onRetry} />)
    expect(screen.getByRole("alert")).toHaveTextContent("The run could not be loaded")
    await user.click(screen.getByRole("button", { name: "Try again" }))
    expect(onRetry).toHaveBeenCalled()
  })
})
