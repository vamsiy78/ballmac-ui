import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { AgentQueue, type QueueTask } from "@/components/ballmac/agent-queue"

const tasks: QueueTask[] = [
  { id: "r1", title: "Invoice batch 1", state: "running", progress: 64, eta: "about 2 min", agent: "Billing" },
  { id: "r2", title: "Invoice batch 2", state: "running", progress: 12 },
  { id: "a", title: "Reconcile payouts", state: "queued", priority: "high", eta: "starts after batch 1" },
  { id: "b", title: "Email receipts", state: "queued" },
  { id: "c", title: "Archive old invoices", state: "paused", priority: "low" },
]

const waitingTitles = () => Array.from(document.querySelectorAll("ol > li")).map((li) => li.querySelector("p")?.textContent ?? "")

describe("AgentQueue", () => {
  it("counts what is running and waiting, and shows the slots in use", () => {
    render(<AgentQueue tasks={tasks} slots={3} />)
    expect(screen.getByText("2 running")).toBeInTheDocument()
    expect(screen.getByText("3 waiting")).toBeInTheDocument()
    expect(screen.getByRole("img", { name: "2 of 3 slots in use" })).toBeInTheDocument()
  })

  it("shows progress for running tasks and the order of waiting ones", () => {
    render(<AgentQueue tasks={tasks} />)
    expect(screen.getByRole("progressbar", { name: "Invoice batch 1" })).toHaveAttribute("aria-valuenow", "64")
    expect(waitingTitles()[0]).toContain("Reconcile payouts")
    expect(waitingTitles()[2]).toContain("Archive old invoices")
    expect(screen.getByText("Paused")).toBeInTheDocument()
  })

  it("moves a waiting task up and down, shows it at once and reports the new place", async () => {
    const user = userEvent.setup()
    const onMove = vi.fn().mockResolvedValue(undefined)
    render(<AgentQueue tasks={tasks} onMove={onMove} />)
    await user.click(screen.getByRole("button", { name: "Move Email receipts up" }))
    expect(onMove).toHaveBeenCalledWith("b", 0)
    expect(waitingTitles()[0]).toContain("Email receipts")
    expect(await screen.findByText("Email receipts moved to position 1")).toBeInTheDocument()
  })

  it("cannot move the first task up or the last one down", () => {
    render(<AgentQueue tasks={tasks} onMove={() => {}} />)
    expect(screen.getByRole("button", { name: "Move Reconcile payouts up" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Move Archive old invoices down" })).toBeDisabled()
  })

  it("puts a task back and says why when a move fails", async () => {
    const user = userEvent.setup()
    render(<AgentQueue tasks={tasks} onMove={() => Promise.reject(new Error("The queue changed. Try again."))} />)
    await user.click(screen.getByRole("button", { name: "Move Email receipts up" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("The queue changed. Try again.")
    expect(waitingTitles()[0]).toContain("Reconcile payouts")
  })

  it("pauses and resumes", async () => {
    const user = userEvent.setup()
    const onPause = vi.fn().mockResolvedValue(undefined)
    render(<AgentQueue tasks={tasks} onPause={onPause} />)
    await user.click(screen.getByRole("button", { name: "Pause Email receipts" }))
    expect(onPause).toHaveBeenLastCalledWith("b", true)
    await user.click(screen.getByRole("button", { name: "Resume Archive old invoices" }))
    expect(onPause).toHaveBeenLastCalledWith("c", false)
  })

  it("asks before cancelling and only cancels when confirmed", async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn().mockResolvedValue(undefined)
    render(<AgentQueue tasks={tasks} onCancel={onCancel} />)
    await user.click(screen.getByRole("button", { name: "Cancel Email receipts" }))
    expect(screen.getByText("Cancel this task?")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Keep it" }))
    expect(onCancel).not.toHaveBeenCalled()
    await user.click(screen.getByRole("button", { name: "Cancel Email receipts" }))
    await user.click(screen.getByRole("button", { name: "Yes, cancel it" }))
    expect(onCancel).toHaveBeenCalledWith("b")
  })

  it("changes the priority with a labelled select", async () => {
    const user = userEvent.setup()
    const onPriority = vi.fn().mockResolvedValue(undefined)
    render(<AgentQueue tasks={tasks} onPriority={onPriority} />)
    await user.selectOptions(screen.getByRole("combobox", { name: "Priority of Email receipts" }), "high")
    expect(onPriority).toHaveBeenCalledWith("b", "high")
  })

  it("says nothing is waiting when the queue is empty", () => {
    render(<AgentQueue tasks={[tasks[0]]} />)
    expect(screen.getByText("Nothing is waiting.")).toBeInTheDocument()
  })
})
