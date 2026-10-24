import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { AgentTree, agentProgress, flattenAgents, type AgentNode } from "@/components/ballmac/agent-tree"

const agents: AgentNode[] = [
  { id: "orch", name: "Orchestrator", task: "Research the market and write the brief.", status: "running", model: "Opus 5.5", cost: 0.12, tokens: 9000, duration: "3 min" },
  { id: "r", parentId: "orch", name: "Researcher", task: "Collect competitor pricing.", status: "running", cost: 0.08 },
  { id: "r1", parentId: "r", name: "Web search", task: "Search for pricing pages.", status: "done", cost: 0.02 },
  { id: "r2", parentId: "r", name: "Reader", task: "Read the top six pages.", status: "running", progress: 40, cost: 0.03 },
  { id: "w", parentId: "orch", name: "Writer", task: "Draft the brief.", status: "queued" },
  { id: "x", parentId: "orch", name: "Checker", status: "failed", cost: 0.004 },
]

describe("flattenAgents and agentProgress", () => {
  it("nests agents under the one that delegated and cuts a loop", () => {
    expect(flattenAgents(agents, new Set()).map((r) => [r.node.id, r.level])).toEqual([["orch", 1], ["r", 2], ["r1", 3], ["r2", 3], ["w", 2], ["x", 2]])
    expect(flattenAgents(agents, new Set(["r"])).map((r) => r.node.id)).toEqual(["orch", "r", "w", "x"])
    const loop: AgentNode[] = [{ id: "a", parentId: "b", name: "A", status: "running" }, { id: "b", parentId: "a", name: "B", status: "running" }]
    expect(flattenAgents(loop, new Set())).toHaveLength(2)
  })
  it("rolls progress up from sub-agents, counting done as 100", () => {
    expect(agentProgress(agents, "r2")).toBe(40)
    expect(agentProgress(agents, "r1")).toBe(100)
    expect(agentProgress(agents, "r")).toBe(70)
    expect(agentProgress(agents, "w")).toBeUndefined()
  })
})

describe("AgentTree", () => {
  it("is a tree whose items carry level, position, state and task for assistive technology", () => {
    render(<AgentTree agents={agents} />)
    const items = within(screen.getByRole("tree", { name: "Agents and who they delegated to" })).getAllByRole("treeitem")
    expect(items).toHaveLength(6)
    expect(items[1]).toHaveAttribute("aria-level", "2")
    expect(items[1]).toHaveAttribute("aria-expanded", "true")
    expect(items[2]).toHaveAccessibleName("Web search, done, Search for pricing pages.")
    expect(items[5]).toHaveAccessibleName("Checker, failed")
  })

  it("adds up the header: agents, running, failed, and cost", () => {
    render(<AgentTree agents={agents} title="Research team" />)
    const head = document.querySelector("[data-slot=agent-tree-header]") as HTMLElement
    expect(head).toHaveTextContent("Research team")
    expect(head).toHaveTextContent("6 agents")
    expect(head).toHaveTextContent("3 running")
    expect(head).toHaveTextContent("1 failed")
    expect(head).toHaveTextContent("$0.25")
  })

  it("keeps one stop in the tab order and moves with the arrow keys", async () => {
    const user = userEvent.setup()
    render(<AgentTree agents={agents} />)
    const items = screen.getAllByRole("treeitem")
    expect(items.filter((i) => i.getAttribute("tabindex") === "0")).toHaveLength(1)
    items[0].focus()
    await user.keyboard("{ArrowDown}")
    expect(items[1]).toHaveFocus()
    await user.keyboard("{ArrowRight}")
    expect(items[2]).toHaveFocus()
    await user.keyboard("{ArrowLeft}")
    expect(items[1]).toHaveFocus()
    await user.keyboard("{End}")
    expect(items[5]).toHaveFocus()
    await user.keyboard("{Home}")
    expect(items[0]).toHaveFocus()
  })

  it("closes and opens an agent's sub-agents from the keyboard", async () => {
    const user = userEvent.setup()
    render(<AgentTree agents={agents} />)
    screen.getAllByRole("treeitem")[1].focus()
    await user.keyboard("{ArrowLeft}")
    expect(screen.getAllByRole("treeitem")).toHaveLength(4)
    expect(screen.getByRole("treeitem", { name: /^Researcher/ })).toHaveAttribute("aria-expanded", "false")
    await user.keyboard("{ArrowRight}")
    expect(screen.getAllByRole("treeitem")).toHaveLength(6)
  })

  it("selects with Enter or a click, and writes the chosen agent out", async () => {
    const user = userEvent.setup()
    const onSelectedChange = vi.fn()
    render(<AgentTree agents={agents} onSelectedChange={onSelectedChange} />)
    screen.getAllByRole("treeitem")[0].focus()
    await user.keyboard("{Enter}")
    expect(onSelectedChange).toHaveBeenCalledWith("orch")
    expect(screen.getByText("Delegated to 3 agents.")).toBeInTheDocument()
    await user.click(screen.getByRole("treeitem", { name: /^Reader/ }))
    expect(screen.getAllByText("Read the top six pages.").length).toBeGreaterThan(0)
  })

  it("starts with chosen branches closed", () => {
    render(<AgentTree agents={agents} defaultCollapsed={["r"]} />)
    expect(screen.getAllByRole("treeitem")).toHaveLength(4)
  })
})
