import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { PlanTracker, formatMinutes, remainingMinutes, type PlanStep } from "@/components/ballmac/plan-tracker"

const steps: PlanStep[] = [
  { id: "1", title: "Read the ticket", status: "done", estimate: 1, actual: 1 },
  { id: "2", title: "Find the pricing code", status: "done", estimate: 2, actual: 4.5 },
  { id: "3", title: "Write the fix", status: "doing", estimate: 6, actual: 2, note: "Editing the totals helper." },
  { id: "4", title: "Update the snapshot tests", status: "todo", estimate: 3, origin: "added" },
  { id: "5", title: "Write release notes", status: "skipped", note: "Not needed for a fix." },
  { id: "6", title: "Open a pull request", status: "todo", estimate: 2 },
]

describe("formatMinutes and remainingMinutes", () => {
  it("formats minutes plainly", () => {
    expect([0.4, 3, 4.5, 2.04].map(formatMinutes)).toEqual(["under 1 min", "3 min", "4.5 min", "2 min"])
  })
  it("adds what is still to do and what is left of the step in progress", () => {
    expect(remainingMinutes(steps)).toBe(4 + 3 + 2)
    expect(remainingMinutes([{ id: "a", title: "x", status: "doing", estimate: 2, actual: 5 }])).toBe(0)
  })
})

describe("PlanTracker", () => {
  it("says how many steps are done out of those that count, and how long is left", () => {
    render(<PlanTracker steps={steps} />)
    expect(screen.getByText(/2 of 5 steps done · about 9 min left/)).toBeInTheDocument()
    const bar = screen.getByRole("progressbar", { name: "Plan" })
    expect(bar).toHaveAttribute("aria-valuenow", "2")
    expect(bar).toHaveAttribute("aria-valuemax", "5")
    expect(bar).toHaveAttribute("aria-valuetext", "2 of 5 steps done")
  })

  it("is honest that the plan changed", () => {
    render(<PlanTracker steps={steps} />)
    expect(screen.getByText("The plan changed").parentElement).toHaveTextContent("1 added")
    expect(screen.getByText("The plan changed").parentElement).toHaveTextContent("1 skipped")
    expect(screen.getByText("Added by the agent")).toBeInTheDocument()
  })

  it("says nothing about changes when the plan held", () => {
    render(<PlanTracker steps={[{ id: "1", title: "Only step", status: "done" }]} />)
    expect(screen.queryByText("The plan changed")).not.toBeInTheDocument()
    expect(screen.getByText(/1 of 1 steps done · complete/)).toBeInTheDocument()
  })

  it("reads each step's state in words, in order", () => {
    render(<PlanTracker steps={steps} />)
    const items = screen.getAllByRole("listitem")
    expect(items).toHaveLength(6)
    expect(items[0]).toHaveTextContent("Done: Read the ticket")
    expect(items[2]).toHaveTextContent("In progress: Write the fix")
    expect(items[4]).toHaveTextContent("Skipped: Write release notes")
    expect(items[3]).toHaveTextContent("To do: Update the snapshot tests")
  })

  it("shows time taken against the estimate, and by how much a step ran over", () => {
    render(<PlanTracker steps={steps} />)
    const over = screen.getByText("Find the pricing code").closest("li")!
    expect(over).toHaveTextContent("4.5 min / 2 min")
    expect(within(over).getByText("over by 2.5 min")).toBeInTheDocument()
    expect(screen.getByText("Read the ticket").closest("li")).not.toHaveTextContent("over by")
    expect(screen.getByText("Open a pull request").closest("li")).toHaveTextContent("expected 2 min")
  })

  it("shows a blocked step's reason", () => {
    render(<PlanTracker steps={[{ id: "1", title: "Deploy", status: "blocked", note: "Waiting for an approval." }]} />)
    expect(screen.getByText("Waiting for an approval.")).toBeInTheDocument()
    expect(screen.getAllByText("Blocked").length).toBeGreaterThan(0)
  })
})
