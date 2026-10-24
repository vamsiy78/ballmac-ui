import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { AgentLanes, formatClock, type Lane } from "@/components/ballmac/agent-lanes"

const lanes: Lane[] = [
  { id: "a", name: "Planner", segments: [{ id: "a1", start: 0, end: 20, kind: "thinking", label: "Plans" }, { id: "a2", start: 20, end: 30, kind: "done", label: "Plan ready" }] },
  { id: "b", name: "Coder", role: "Writes code", segments: [{ id: "b1", start: 30, end: 80, kind: "tool", label: "Edits files", detail: "Edits three files." }, { id: "b2", start: 80, end: 100, kind: "blocked", label: "Blocked" }] },
]
const handoffs = [{ from: "a2", to: "b1", label: "plan" }]

describe("AgentLanes", () => {
  it("shows one labelled group per agent and a button per step with its kind and time", () => {
    render(<AgentLanes lanes={lanes} handoffs={handoffs} />)
    expect(screen.getByRole("group", { name: "Planner" })).toBeInTheDocument()
    expect(screen.getByRole("group", { name: "Coder, Writes code" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Edits files, Coder, Using a tool, 0:30 to 1:20" })).toBeInTheDocument()
  })
  it("lists handoffs as sentences for assistive technology", () => {
    render(<AgentLanes lanes={lanes} handoffs={handoffs} />)
    expect(screen.getByText("Planner hands over to Coder at 0:30")).toBeInTheDocument()
  })
  it("keeps one step in the tab order and moves with the arrow keys", async () => {
    const user = userEvent.setup()
    render(<AgentLanes lanes={lanes} />)
    const steps = screen.getAllByRole("button")
    expect(steps.filter((s) => s.tabIndex === 0)).toHaveLength(1)
    await user.tab()
    expect(steps[0]).toHaveFocus()
    await user.keyboard("{ArrowRight}")
    expect(screen.getByRole("button", { name: /^Plan ready/ })).toHaveFocus()
    await user.keyboard("{ArrowDown}")
    expect(screen.getByRole("button", { name: /^Edits files/ })).toHaveFocus()
    await user.keyboard("{End}")
    expect(screen.getByRole("button", { name: /^Blocked/ })).toHaveFocus()
    await user.keyboard("{Control>}{Home}{/Control}")
    expect(screen.getByRole("button", { name: /^Plans/ })).toHaveFocus()
  })
  it("swaps the horizontal arrows in right-to-left", async () => {
    const user = userEvent.setup()
    render(<AgentLanes lanes={lanes} dir="rtl" />)
    await user.tab()
    await user.keyboard("{ArrowLeft}")
    expect(screen.getByRole("button", { name: /^Plan ready/ })).toHaveFocus()
  })
  it("selects with Enter and shows the detail, and reports the change", async () => {
    const user = userEvent.setup()
    const onSelectedChange = vi.fn()
    render(<AgentLanes lanes={lanes} handoffs={handoffs} onSelectedChange={onSelectedChange} />)
    expect(screen.getByText(/Select a step to see what happened/)).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /^Edits files/ }))
    expect(onSelectedChange).toHaveBeenCalledWith("b1")
    const detail = document.querySelector('[data-slot="agent-lanes-detail"]') as HTMLElement
    expect(within(detail).getByText("Edits three files.")).toBeInTheDocument()
    expect(within(detail).getByText(/Started by Planner/)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /^Edits files/ })).toHaveAttribute("aria-pressed", "true")
  })
  it("can be controlled", () => {
    render(<AgentLanes lanes={lanes} selected="b2" />)
    expect(screen.getByRole("button", { name: /^Blocked/ })).toHaveAttribute("aria-pressed", "true")
  })
  it("draws a Now line only inside the run", () => {
    const { rerender } = render(<AgentLanes lanes={lanes} now={50} />)
    expect(screen.getByText("Now")).toBeInTheDocument()
    rerender(<AgentLanes lanes={lanes} now={500} />)
    expect(screen.queryByText("Now")).toBeNull()
  })
  it("formats seconds as m:ss and h:mm:ss", () => {
    expect(formatClock(75)).toBe("1:15")
    expect(formatClock(3725)).toBe("1:02:05")
  })
})
