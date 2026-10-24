import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { AgentRoster, type RosterAgent } from "@/components/ballmac/agent-roster"

const agents: RosterAgent[] = [
  { id: "a", name: "Planner", role: "Plans", status: "working", task: "Planning.", load: 60 },
  { id: "b", name: "Coder Agent", status: "blocked", task: "Needs approval.", lastActive: "6 min ago" },
  { id: "c", name: "Reviewer", status: "working" },
]

describe("AgentRoster", () => {
  it("shows each agent with its status in words and a labelled load meter", () => {
    render(<AgentRoster agents={agents} />)
    expect(screen.getByRole("region", { name: "Agents" })).toBeInTheDocument()
    expect(screen.getAllByText("Working").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Blocked").length).toBeGreaterThan(0)
    expect(screen.getByRole("meter", { name: "Planner load" })).toHaveAttribute("aria-valuenow", "60")
    expect(screen.getByText("CA")).toBeInTheDocument()
  })
  it("filters by status, hides statuses with no agents and says how many are shown", async () => {
    const user = userEvent.setup()
    render(<AgentRoster agents={agents} />)
    expect(screen.queryByRole("button", { name: /Offline/ })).toBeNull()
    await user.click(screen.getByRole("button", { name: /^Blocked/ }))
    expect(screen.getByRole("button", { name: /Coder Agent/ })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /Planner/ })).toBeNull()
    expect(screen.getByText("1 agents shown")).toBeInTheDocument()
  })
  it("selects an agent as a toggle and clears on a second press", async () => {
    const user = userEvent.setup()
    const onSelectedChange = vi.fn()
    render(<AgentRoster agents={agents} onSelectedChange={onSelectedChange} />)
    const card = screen.getByRole("button", { name: /Planner/ })
    await user.click(card)
    expect(onSelectedChange).toHaveBeenLastCalledWith("a")
    expect(card).toHaveAttribute("aria-pressed", "true")
    await user.click(card)
    expect(onSelectedChange).toHaveBeenLastCalledWith(null)
  })
  it("can be controlled", () => {
    render(<AgentRoster agents={agents} selected="b" />)
    expect(screen.getByRole("button", { name: /Coder Agent/ })).toHaveAttribute("aria-pressed", "true")
  })
})
