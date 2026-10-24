import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { ParallelAttempts, type Attempt } from "@/components/ballmac/parallel-attempts"

const attempts: Attempt[] = [
  { id: "a", label: "Attempt A", status: "done", summary: "First.", added: 10, removed: 5, files: 2, duration: "1 min", cost: "$0.10" },
  { id: "b", label: "Attempt B", status: "done", summary: "Second.", added: 30, removed: 0 },
  { id: "c", label: "Attempt C", status: "running", summary: "Third.", progress: 40 },
  { id: "d", label: "Attempt D", status: "failed", summary: "Fourth." },
]

describe("ParallelAttempts", () => {
  it("is a radio group with a radio per attempt, and only finished attempts can be picked", () => {
    render(<ParallelAttempts attempts={attempts} />)
    expect(screen.getByRole("group", { name: "Attempts" })).toBeInTheDocument()
    expect(screen.getAllByRole("radio")).toHaveLength(4)
    expect(screen.getByRole("radio", { name: /Attempt A/ })).toBeEnabled()
    expect(screen.getByRole("radio", { name: /Attempt C/ })).toBeDisabled()
    expect(screen.getByRole("radio", { name: /Attempt D/ })).toBeDisabled()
  })
  it("shows status in words, a progress bar while running, and the changed lines", () => {
    render(<ParallelAttempts attempts={attempts} />)
    expect(screen.getByText("Running")).toBeInTheDocument()
    expect(screen.getByText("Failed")).toBeInTheDocument()
    expect(screen.getByRole("progressbar", { name: "Attempt C progress" })).toHaveAttribute("aria-valuenow", "40")
    expect(screen.getByText("+10 added")).toBeInTheDocument()
    expect(screen.getByText("−5 removed")).toBeInTheDocument()
  })
  it("picks with the keyboard and skips attempts that cannot be picked", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<ParallelAttempts attempts={attempts} defaultValue="a" onValueChange={onValueChange} />)
    screen.getByRole("radio", { name: /Attempt A/ }).focus()
    await user.keyboard("{ArrowDown}")
    expect(onValueChange).toHaveBeenLastCalledWith("b")
    expect(screen.getByRole("radio", { name: /Attempt B/ })).toBeChecked()
  })
  it("marks the suggested attempt and can be controlled", () => {
    render(<ParallelAttempts attempts={attempts} recommended="b" value="b" />)
    expect(screen.getByText("Suggested")).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: /Attempt B/ })).toBeChecked()
  })
  it("adds a confirm button that names the pick and stays off until one is picked", async () => {
    const user = userEvent.setup()
    const onChoose = vi.fn()
    render(<ParallelAttempts attempts={attempts} onChoose={onChoose} />)
    const confirm = screen.getByRole("button", { name: "Continue" })
    expect(confirm).toBeDisabled()
    await user.click(screen.getByRole("radio", { name: /Attempt B/ }))
    expect(screen.getByText("Attempt B is selected.")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Continue with Attempt B" }))
    expect(onChoose).toHaveBeenCalledWith("b")
  })
  it("does not treat a picked attempt as chosen when it is not finished", () => {
    render(<ParallelAttempts attempts={attempts} value="c" onChoose={() => {}} />)
    expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled()
  })
})

describe("ParallelAttempts summary and tests", () => {
  it("counts the attempts by status above the cards, and can hide the line", () => {
    const { rerender } = render(<ParallelAttempts attempts={attempts} />)
    const line = document.querySelector("[data-slot=parallel-attempts-summary]") as HTMLElement
    expect(line).toHaveTextContent("4 attempts")
    expect(line).toHaveTextContent("2 done")
    expect(line).toHaveTextContent("1 running")
    expect(line).toHaveTextContent("1 failed")
    rerender(<ParallelAttempts attempts={attempts} summary={false} />)
    expect(document.querySelector("[data-slot=parallel-attempts-summary]")).toBeNull()
  })

  it("shows how many tests pass as a meter and in words, and says so when some fail", () => {
    render(<ParallelAttempts attempts={[{ id: "a", label: "Attempt A", status: "done", summary: "x", tests: { passed: 21, total: 23 } }, { id: "b", label: "Attempt B", status: "done", summary: "y", tests: { passed: 27, total: 27 } }]} />)
    expect(screen.getByRole("meter", { name: "Attempt A tests passing" })).toHaveAttribute("aria-valuenow", "21")
    expect(screen.getByText("21 of 23 tests pass")).toBeInTheDocument()
    expect(screen.getByText("27 of 27 tests pass")).toBeInTheDocument()
  })
})
