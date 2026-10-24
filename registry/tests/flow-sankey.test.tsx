import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { FlowSankey, layoutSankey } from "@/components/ballmac/flow-sankey"

const nodes = [{ id: "a", label: "Start" }, { id: "b", label: "Middle" }, { id: "c", label: "End" }, { id: "d", label: "Drop" }, { id: "x", label: "Unused" }]
const links = [
  { source: "a", target: "b", value: 100 },
  { source: "b", target: "c", value: 60 },
  { source: "b", target: "d", value: 40 },
  { source: "a", target: "a", value: 5 },
  { source: "a", target: "nope", value: 5 },
  { source: "b", target: "c", value: 0 },
]

describe("layoutSankey", () => {
  const l = layoutSankey(nodes, links)
  it("puts each node after everything that feeds it and leaves out nodes with no links", () => {
    const col = Object.fromEntries(l.nodes.map((n) => [n.id, n.col]))
    expect(col).toEqual({ a: 0, b: 1, c: 2, d: 2 })
    expect(l.nodes.find((n) => n.id === "x")).toBeUndefined()
  })
  it("ignores links that are empty, point nowhere or loop onto themselves", () => {
    expect(l.links).toHaveLength(3)
  })
  it("sizes nodes by the larger of what flows in and out, and links by their value", () => {
    const a = l.nodes.find((n) => n.id === "a")!
    const b = l.nodes.find((n) => n.id === "b")!
    expect(a.h).toBeCloseTo(b.h, 6)
    const w = Object.fromEntries(l.links.map((k) => [`${k.source}-${k.target}`, k.width]))
    expect(w["b-c"] / w["b-d"]).toBeCloseTo(1.5, 6)
    expect(w["a-b"]).toBeCloseTo(w["b-c"] + w["b-d"], 6)
  })
  it("leaves out a link that would close a loop, and still lays out the rest", () => {
    const cyc = layoutSankey([{ id: "p", label: "P" }, { id: "q", label: "Q" }, { id: "r", label: "R" }], [{ source: "p", target: "q", value: 2 }, { source: "q", target: "r", value: 2 }, { source: "r", target: "p", value: 1 }])
    expect(cyc.links.map((k) => `${k.source}-${k.target}`)).toEqual(["p-q", "q-r"])
    expect(cyc.nodes.map((n) => n.col).sort()).toEqual([0, 1, 2])
  })
})

describe("FlowSankey", () => {
  it("names each node with its totals in and out", () => {
    render(<FlowSankey nodes={nodes} links={links} />)
    expect(screen.getByRole("button", { name: "Middle: 100 in, 100 out" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Start: 0 in, 100 out" })).toBeInTheDocument()
  })
  it("lists every flow in a table for screen readers", () => {
    render(<FlowSankey nodes={nodes} links={links} />)
    const table = screen.getByRole("table", { hidden: true })
    expect(within(table).getAllByRole("row", { hidden: true })).toHaveLength(4)
    expect(within(table).getByText("Drop")).toBeInTheDocument()
  })
  it("keeps one node in the tab order and moves down a column and across columns with the arrows", async () => {
    const user = userEvent.setup()
    render(<FlowSankey nodes={nodes} links={links} />)
    expect(screen.getAllByRole("button").filter((b) => b.tabIndex === 0)).toHaveLength(1)
    await user.tab()
    expect(screen.getByRole("button", { name: /^Start/ })).toHaveFocus()
    await user.keyboard("{ArrowRight}")
    expect(screen.getByRole("button", { name: /^Middle/ })).toHaveFocus()
    await user.keyboard("{ArrowRight}")
    const first = document.activeElement as HTMLElement
    expect(first.getAttribute("aria-label")).toMatch(/^(End|Drop):/)
    await user.keyboard("{ArrowDown}{ArrowUp}")
    await user.keyboard(first.getAttribute("aria-label")?.startsWith("End") ? "{ArrowDown}" : "{ArrowUp}")
    expect(document.activeElement).not.toBe(first)
    expect((document.activeElement as HTMLElement).getAttribute("aria-label")).toMatch(/^(End|Drop):/)
  })
  it("selects a node, shows its totals, and clears on a second press", async () => {
    const user = userEvent.setup()
    const onSelectedChange = vi.fn()
    render(<FlowSankey nodes={nodes} links={links} onSelectedChange={onSelectedChange} />)
    expect(screen.getByText("Select a step to follow its flows.")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /^Middle/ }))
    expect(onSelectedChange).toHaveBeenLastCalledWith("b")
    expect(screen.getByText(/100 in · 100 out/)).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /^Middle/ }))
    expect(onSelectedChange).toHaveBeenLastCalledWith(null)
  })
})
