import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Pipeline1, type Pipeline1Run } from "@/components/ballmac/blocks/pipeline-1/pipeline-1"

describe("Pipeline1", () => {
  it("lists the stages in order with each status written out", () => {
    render(<Pipeline1 />)
    const stages = within(screen.getByRole("list", { name: "Stages" })).getAllByRole("listitem")
    expect(stages).toHaveLength(5)
    expect(stages[0]).toHaveTextContent("Build")
    expect(stages[0]).toHaveTextContent("Passed · 1 min 48 s")
    expect(stages[3]).toHaveTextContent("Waiting for approval")
    expect(stages[4]).toHaveTextContent("Not started")
  })

  it("opens a stage's log, left to right, and a stage with no log is not a button", async () => {
    const user = userEvent.setup()
    render(<Pipeline1 />)
    expect(screen.getByText("Select a stage to read its log.")).toBeInTheDocument()
    const build = screen.getByRole("button", { name: /Build/ })
    await user.click(build)
    expect(build).toHaveAttribute("aria-expanded", "true")
    const log = screen.getByLabelText("Build log")
    expect(log).toHaveTextContent("Compiled successfully")
    expect(log).toHaveAttribute("dir", "ltr")
    expect(screen.queryByRole("button", { name: /Deploy to production/ })).toBeNull()
  })

  it("approves a gate, passes it and starts the next stage", async () => {
    const user = userEvent.setup()
    const onApprove = vi.fn().mockResolvedValue(undefined)
    render(<Pipeline1 onApprove={onApprove} />)
    expect(screen.getByText("Needs Priya Shah or Noor Haddad.")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Approve production" }))
    expect(onApprove).toHaveBeenCalledWith("gate")
    const stages = within(screen.getByRole("list", { name: "Stages" })).getAllByRole("listitem")
    await screen.findByText("Running")
    expect(stages[3]).toHaveTextContent("Passed")
    expect(stages[4]).toHaveTextContent("Running")
  })

  it("keeps the gate waiting and says why when approval fails", async () => {
    const user = userEvent.setup()
    render(<Pipeline1 onApprove={() => Promise.reject(new Error("You are not on the approvers list."))} />)
    await user.click(screen.getByRole("button", { name: "Approve production" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("You are not on the approvers list.")
    expect(screen.getByText("Waiting for approval")).toBeInTheDocument()
  })

  it("offers to run a failed stage again, resetting the ones after it", async () => {
    const user = userEvent.setup()
    const onRerun = vi.fn().mockResolvedValue(undefined)
    const run: Pipeline1Run = { branch: "main", commit: "b2", message: "Fix", author: "Ana", stages: [{ id: "a", name: "Build", status: "passed" }, { id: "b", name: "Tests", status: "failed", log: ["1 failed"] }, { id: "c", name: "Deploy", status: "skipped" }] }
    render(<Pipeline1 run={run} onRerun={onRerun} />)
    await user.click(screen.getByRole("button", { name: "Run again from here" }))
    expect(onRerun).toHaveBeenCalledWith("b")
    const stages = within(screen.getByRole("list", { name: "Stages" })).getAllByRole("listitem")
    await screen.findByText("Running")
    expect(stages[2]).toHaveTextContent("Not started")
  })

  it("shows loading, empty and error states", () => {
    const { rerender } = render(<Pipeline1 state="loading" />)
    expect(screen.getByRole("status")).toHaveTextContent("Loading the pipeline")
    rerender(<Pipeline1 run={null} />)
    expect(screen.getByText("No runs yet")).toBeInTheDocument()
    rerender(<Pipeline1 state="error" onRetry={() => {}} />)
    expect(screen.getByRole("alert")).toHaveTextContent("The pipeline could not be loaded")
  })
})
