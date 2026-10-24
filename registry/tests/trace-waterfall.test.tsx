import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { TraceWaterfall, flatten, formatCost, formatMs, type TraceSpan } from "@/components/ballmac/trace-waterfall"

const spans: TraceSpan[] = [
  { id: "run", name: "Run", kind: "agent", start: 0, duration: 1000 },
  { id: "b", parentId: "run", name: "Second", kind: "tool", start: 400, duration: 300, status: "error", detail: "It failed." },
  { id: "a", parentId: "run", name: "First", kind: "model", start: 100, duration: 200, tokens: 1234 },
  { id: "a1", parentId: "a", name: "Inner", kind: "retrieval", start: 120, duration: 50 },
  { id: "orphan", parentId: "gone", name: "Orphan", start: 800, duration: 100 },
]

describe("flatten", () => {
  it("nests spans under their parent in start order and treats a missing parent as top level", () => {
    const rows = flatten(spans, new Set())
    expect(rows.map((r) => [r.span.id, r.level])).toEqual([["run", 1], ["a", 2], ["a1", 3], ["b", 2], ["orphan", 1]])
    expect(rows[1]).toMatchObject({ setsize: 2, pos: 1, hasChildren: true })
  })
  it("leaves out the children of a collapsed span", () => {
    expect(flatten(spans, new Set(["a"])).map((r) => r.span.id)).toEqual(["run", "a", "b", "orphan"])
  })
  it("does not loop on a span that is its own parent", () => {
    expect(flatten([{ id: "x", parentId: "x", name: "x", start: 0, duration: 1 }], new Set())).toHaveLength(1)
  })
})

describe("formatMs", () => {
  it("formats milliseconds, seconds and minutes", () => {
    expect(formatMs(420)).toBe("420 ms")
    expect(formatMs(1240)).toBe("1.24 s")
    expect(formatMs(75000)).toBe("1 min 15 s")
    expect(formatMs(120000)).toBe("2 min")
  })
})

describe("TraceWaterfall", () => {
  it("is a tree whose items carry level, position and a full spoken description, and say failed in words", () => {
    render(<TraceWaterfall spans={spans} />)
    const tree = screen.getByRole("tree", { name: "Spans of the run" })
    const items = within(tree).getAllByRole("treeitem")
    expect(items).toHaveLength(5)
    expect(items[1]).toHaveAttribute("aria-level", "2")
    expect(items[1]).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("treeitem", { name: "Second, tool call, 300 ms, starts at 400 ms, failed" })).toBeInTheDocument()
  })
  it("moves with Up and Down, opens and closes with Right and Left, and goes to the parent", async () => {
    const user = userEvent.setup()
    render(<TraceWaterfall spans={spans} />)
    expect(screen.getAllByRole("treeitem").filter((i) => i.tabIndex === 0)).toHaveLength(1)
    await user.tab()
    expect(screen.getByRole("treeitem", { name: /^Run,/ })).toHaveFocus()
    await user.keyboard("{ArrowDown}")
    expect(screen.getByRole("treeitem", { name: /^First,/ })).toHaveFocus()
    await user.keyboard("{ArrowLeft}")
    expect(screen.getByRole("treeitem", { name: /^First,/ })).toHaveAttribute("aria-expanded", "false")
    expect(screen.queryByRole("treeitem", { name: /^Inner,/ })).toBeNull()
    await user.keyboard("{ArrowRight}")
    expect(screen.getByRole("treeitem", { name: /^First,/ })).toHaveAttribute("aria-expanded", "true")
    await user.keyboard("{ArrowRight}")
    expect(screen.getByRole("treeitem", { name: /^Inner,/ })).toHaveFocus()
    await user.keyboard("{ArrowLeft}")
    expect(screen.getByRole("treeitem", { name: /^First,/ })).toHaveFocus()
    await user.keyboard("{End}")
    expect(screen.getByRole("treeitem", { name: /^Orphan,/ })).toHaveFocus()
    await user.keyboard("{Home}")
    expect(screen.getByRole("treeitem", { name: /^Run,/ })).toHaveFocus()
  })
  it("selects with Enter or a click and shows timing, tokens and detail, and reports it", async () => {
    const user = userEvent.setup()
    const onSelectedChange = vi.fn()
    render(<TraceWaterfall spans={spans} onSelectedChange={onSelectedChange} />)
    expect(screen.getByText(/Select a span to see its timing/)).toBeInTheDocument()
    await user.click(screen.getByRole("treeitem", { name: /^First,/ }))
    expect(onSelectedChange).toHaveBeenLastCalledWith("a")
    expect(screen.getByText(/1,234 tokens/)).toBeInTheDocument()
    await user.keyboard("{ArrowDown}{ArrowDown}{Enter}")
    expect(onSelectedChange).toHaveBeenLastCalledWith("b")
    expect(screen.getByText("It failed.")).toBeInTheDocument()
    expect(screen.getByRole("treeitem", { name: /^Second,/ })).toHaveAttribute("aria-selected", "true")
  })
  it("can start with a branch collapsed", () => {
    render(<TraceWaterfall spans={spans} defaultCollapsed={["a"]} />)
    expect(screen.queryByRole("treeitem", { name: /^Inner,/ })).toBeNull()
  })
})

describe("summary, cost and slowest", () => {
  const priced: TraceSpan[] = [
    { id: "run", name: "Run", kind: "agent", start: 0, duration: 5000 },
    { id: "m", parentId: "run", name: "Think", kind: "model", model: "Opus 5.5", start: 0, duration: 3000, tokens: 2000, cost: 0.081 },
    { id: "t", parentId: "run", name: "Fetch", kind: "tool", start: 3000, duration: 1000, tokens: 500, cost: 0.003, status: "error" },
    { id: "r", parentId: "run", name: "Reply", kind: "model", start: 4000, duration: 900, tokens: 800, cost: 0.034 },
  ]

  it("formats costs with three decimals for small amounts", () => {
    expect(formatCost(0.0042)).toBe("$0.004")
    expect(formatCost(0.0004)).toBe("<$0.001")
    expect(formatCost(0.13)).toBe("$0.13")
    expect(formatCost(12)).toBe("$12.00")
  })

  it("adds up duration, cost, tokens, model calls, tool calls and errors", () => {
    render(<TraceWaterfall spans={priced} />)
    const sum = document.querySelector("[data-slot=trace-waterfall-summary]") as HTMLElement
    const text = (label: string) => within(sum).getByText(label).nextElementSibling?.textContent
    expect(text("Duration")).toBe("5 s")
    expect(text("Cost")).toBe("$0.12")
    expect(text("Tokens")).toBe("3,300")
    expect(text("Model calls")).toBe("2")
    expect(text("Tool calls")).toBe("1")
    expect(text("Errors")).toBe("1")
  })

  it("leaves out cost and tokens when no span has them, and can hide the summary", () => {
    const { rerender } = render(<TraceWaterfall spans={spans} />)
    expect(screen.queryByText("Cost")).not.toBeInTheDocument()
    expect(screen.queryByText("Tokens")).toBeInTheDocument()
    rerender(<TraceWaterfall spans={spans} summary={false} />)
    expect(document.querySelector("[data-slot=trace-waterfall-summary]")).toBeNull()
  })

  it("marks the slowest span that does real work, not the one that only contains others", () => {
    render(<TraceWaterfall spans={priced} />)
    expect(screen.getAllByText("Slowest")).toHaveLength(1)
    const row = screen.getByRole("treeitem", { name: /^Think,/ })
    expect(row).toHaveTextContent("Slowest")
    expect(row).toHaveAccessibleName(/slowest/)
  })

  it("shows the model and the cost on the row", () => {
    render(<TraceWaterfall spans={priced} />)
    expect(screen.getByText("Opus 5.5")).toBeInTheDocument()
    expect(screen.getByRole("treeitem", { name: /^Think,/ })).toHaveTextContent("$0.081")
  })
})
