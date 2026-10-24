import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { AgentGraph, layoutGraph } from "@/components/ballmac/agent-graph"

const nodes = [
  { id: "a", label: "Planner", status: "done" as const },
  { id: "b", label: "Coder", status: "working" as const },
  { id: "c", label: "Tests", kind: "tool" as const },
  { id: "d", label: "Reviewer", kind: "agent" as const, status: "blocked" as const },
]
const edges = [
  { from: "a", to: "b", label: "plan" },
  { from: "b", to: "c" },
  { from: "b", to: "d", active: true },
  { from: "d", to: "b" },
  { from: "a", to: "zz" },
]

describe("layoutGraph", () => {
  const l = layoutGraph(nodes, edges)
  it("places each node after what feeds it and gives every node a position", () => {
    const col = Object.fromEntries(l.nodes.map((n) => [n.id, n.col]))
    expect(col.a).toBe(0)
    expect(col.b).toBe(1)
    expect(l.nodes.every((n) => Number.isFinite(n.x) && Number.isFinite(n.y))).toBe(true)
  })
  it("ignores edges to unknown nodes and draws a loop back as a curve under the nodes", () => {
    expect(l.edges).toHaveLength(4)
    const back = l.edges.find((e) => e.from === "d" && e.to === "b")!
    expect(back.ly).toBeGreaterThan(l.nodes.find((n) => n.id === "d")!.y)
  })
  it("survives a loop with no start", () => {
    const loop = layoutGraph([{ id: "p", label: "P" }, { id: "q", label: "Q" }], [{ from: "p", to: "q" }, { from: "q", to: "p" }])
    expect(loop.nodes).toHaveLength(2)
  })
})

describe("AgentGraph", () => {
  it("names each node with its kind and status in words", () => {
    render(<AgentGraph nodes={nodes} edges={edges} />)
    expect(screen.getByRole("button", { name: "Coder, agent, working" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Tests, tool" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Reviewer, agent, blocked" })).toBeInTheDocument()
  })
  it("follows the edges with the arrow keys", async () => {
    const user = userEvent.setup()
    render(<AgentGraph nodes={nodes} edges={edges} />)
    expect(screen.getAllByRole("button").filter((b) => b.tabIndex === 0)).toHaveLength(1)
    await user.tab()
    expect(screen.getByRole("button", { name: /^Planner/ })).toHaveFocus()
    await user.keyboard("{ArrowRight}")
    expect(screen.getByRole("button", { name: /^Coder/ })).toHaveFocus()
    await user.keyboard("{ArrowRight}")
    expect(document.activeElement?.getAttribute("aria-label")).toMatch(/^(Tests|Reviewer)/)
    await user.keyboard("{ArrowLeft}")
    expect(screen.getByRole("button", { name: /^Coder/ })).toHaveFocus()
    await user.keyboard("{ArrowLeft}")
    expect(screen.getByRole("button", { name: /^Planner/ })).toHaveFocus()
  })
  it("lists a node's connections in a sentence when it is selected, and clears on a second press", async () => {
    const user = userEvent.setup()
    const onSelectedChange = vi.fn()
    render(<AgentGraph nodes={nodes} edges={edges} onSelectedChange={onSelectedChange} />)
    expect(screen.getByText(/Select a node to see its connections/)).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /^Coder/ }))
    expect(onSelectedChange).toHaveBeenLastCalledWith("b")
    expect(screen.getByText(/Receives from Planner, Reviewer\. Sends to Tests, Reviewer\./)).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /^Coder/ }))
    expect(onSelectedChange).toHaveBeenLastCalledWith(null)
  })
  it("says a node with nothing before or after it starts or ends the work", async () => {
    const user = userEvent.setup()
    render(<AgentGraph nodes={nodes} edges={edges} />)
    await user.click(screen.getByRole("button", { name: /^Planner/ }))
    expect(screen.getByText(/Starts the work\./)).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /^Tests/ }))
    expect(screen.getByText(/Nothing follows it\./)).toBeInTheDocument()
  })
})
