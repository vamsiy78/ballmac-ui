import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { Treemap, squarify, type TreemapItem } from "@/components/ballmac/treemap"

const items: TreemapItem[] = [
  { id: "a", label: "Alpha", value: 60, group: "One", detail: "The biggest." },
  { id: "b", label: "Beta", value: 25, group: "One" },
  { id: "c", label: "Gamma", value: 10, group: "Two" },
  { id: "d", label: "Delta", value: 5, group: "Two" },
  { id: "z", label: "Zero", value: 0 },
]

describe("squarify", () => {
  it("fills the rectangle exactly and gives each item an area in proportion to its value", () => {
    const rects = squarify(items.filter((i) => i.value > 0), 160, 100)
    const total = 160 * 100
    let sum = 0
    for (const i of items.filter((x) => x.value > 0)) {
      const r = rects[i.id]
      sum += r.w * r.h
      expect((r.w * r.h) / total).toBeCloseTo(i.value / 100, 6)
      expect(r.x).toBeGreaterThanOrEqual(-1e-9)
      expect(r.x + r.w).toBeLessThanOrEqual(160 + 1e-9)
      expect(r.y + r.h).toBeLessThanOrEqual(100 + 1e-9)
    }
    expect(sum).toBeCloseTo(total, 6)
  })
  it("returns nothing for an empty or zero-sized input", () => {
    expect(squarify([], 100, 100)).toEqual({})
    expect(squarify([{ id: "a", value: 1 }], 0, 100)).toEqual({})
  })
})

describe("Treemap", () => {
  it("drops items of zero size and names each cell with its value, share and group", () => {
    render(<Treemap items={items} unit="USD" />)
    expect(screen.queryByRole("button", { name: /Zero/ })).toBeNull()
    expect(screen.getByRole("button", { name: "Alpha: 60 USD, 60% of the total, One" })).toBeInTheDocument()
    expect(screen.getAllByRole("button")).toHaveLength(4)
  })
  it("keeps one cell in the tab order, starting on the largest, and moves with the arrow keys and Home and End", async () => {
    const user = userEvent.setup()
    render(<Treemap items={items} />)
    const cells = screen.getAllByRole("button")
    expect(cells.filter((c) => c.tabIndex === 0)).toHaveLength(1)
    await user.tab()
    expect(screen.getByRole("button", { name: /^Alpha/ })).toHaveFocus()
    await user.keyboard("{End}")
    expect(screen.getByRole("button", { name: /^Delta/ })).toHaveFocus()
    await user.keyboard("{Home}")
    expect(screen.getByRole("button", { name: /^Alpha/ })).toHaveFocus()
    await user.keyboard("{ArrowRight}")
    expect(screen.getByRole("button", { name: /^Alpha/ })).not.toHaveFocus()
  })
  it("selects a cell, shows its share and detail, and clears on a second press", async () => {
    const user = userEvent.setup()
    const onSelectedChange = vi.fn()
    render(<Treemap items={items} onSelectedChange={onSelectedChange} />)
    expect(screen.getByText("Select a block to see its share.")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /^Alpha/ }))
    expect(onSelectedChange).toHaveBeenLastCalledWith("a")
    expect(screen.getByText("The biggest.")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /^Alpha/ }))
    expect(onSelectedChange).toHaveBeenLastCalledWith(null)
  })
  it("lists the groups with their totals in a legend", () => {
    render(<Treemap items={items} />)
    const legend = screen.getByRole("list", { name: "Groups" })
    expect(legend).toHaveTextContent("One")
    expect(legend).toHaveTextContent("85 · 85%")
    expect(legend).toHaveTextContent("Two")
    expect(legend).toHaveTextContent("15 · 15%")
  })
})
