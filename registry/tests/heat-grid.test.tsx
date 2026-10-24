import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { HeatGrid } from "@/components/ballmac/heat-grid"

const rows = [{ id: "a", label: "Model A" }, { id: "b", label: "Model B" }]
const columns = [{ id: "1", label: "Case 1" }, { id: "2", label: "Case 2" }, { id: "3", label: "Case 3" }]
const values = [[10, 50, 90], [20, null, 70]]

describe("HeatGrid", () => {
  it("is a grid with row and column headers and a value in every cell, and says when there is no data", () => {
    render(<HeatGrid rowLabel="Models" columnLabel="Cases" rows={rows} columns={columns} values={values} />)
    expect(screen.getByRole("grid", { name: "Models by Cases" })).toBeInTheDocument()
    expect(screen.getAllByRole("columnheader")).toHaveLength(4)
    expect(screen.getByRole("button", { name: "Model A, Case 3: 90" })).toHaveTextContent("90")
    expect(screen.getByRole("button", { name: "Model B, Case 2: No data" })).toBeInTheDocument()
  })

  it("keeps one cell in the tab order and moves with the arrow keys, Home, End and Ctrl", async () => {
    const user = userEvent.setup()
    render(<HeatGrid rows={rows} columns={columns} values={values} />)
    const cells = screen.getAllByRole("button")
    expect(cells.filter((c) => c.tabIndex === 0)).toHaveLength(1)
    await user.tab()
    expect(screen.getByRole("button", { name: /Model A, Case 1/ })).toHaveFocus()
    await user.keyboard("{ArrowRight}{ArrowDown}")
    expect(screen.getByRole("button", { name: /Model B, Case 2/ })).toHaveFocus()
    await user.keyboard("{End}")
    expect(screen.getByRole("button", { name: /Model B, Case 3/ })).toHaveFocus()
    await user.keyboard("{Control>}{Home}{/Control}")
    expect(screen.getByRole("button", { name: /Model A, Case 1/ })).toHaveFocus()
  })

  it("swaps the horizontal arrows in right-to-left", async () => {
    const user = userEvent.setup()
    render(<HeatGrid rows={rows} columns={columns} values={values} dir="rtl" />)
    await user.tab()
    await user.keyboard("{ArrowLeft}")
    expect(screen.getByRole("button", { name: /Model A, Case 2/ })).toHaveFocus()
  })

  it("chooses a cell with Enter or a click and reports it, or follows a controlled value", async () => {
    const user = userEvent.setup()
    const onSelectedChange = vi.fn()
    const { rerender } = render(<HeatGrid rows={rows} columns={columns} values={values} onSelectedChange={onSelectedChange} />)
    await user.click(screen.getByRole("button", { name: /Model A, Case 2/ }))
    expect(onSelectedChange).toHaveBeenLastCalledWith([0, 1])
    await user.keyboard("{ArrowRight}{Enter}")
    expect(onSelectedChange).toHaveBeenLastCalledWith([0, 2])
    rerender(<HeatGrid rows={rows} columns={columns} values={values} selected={[1, 0]} />)
    expect(screen.getByRole("button", { name: /Model B, Case 1/ }).closest("[role=gridcell]")).toHaveAttribute("aria-selected", "true")
  })

  it("classifies with tone and adds the word to the label, with a legend", () => {
    render(<HeatGrid rows={rows} columns={columns} values={values} tone={(v) => (v >= 80 ? "good" : v >= 40 ? "warn" : "bad")} />)
    expect(screen.getByRole("button", { name: "Model A, Case 3: 90, Good" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Model A, Case 2: 50, Warning" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Model A, Case 1: 10, Problem" })).toBeInTheDocument()
    expect(screen.getByRole("list", { name: "Legend" })).toBeInTheDocument()
  })
})
