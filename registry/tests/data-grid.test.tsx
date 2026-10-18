import { fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { DataGrid, type DataGridColumn } from "@/components/ballmac/data-grid"

type Row = { id: string; name: string; qty: number; plan: string; done: boolean }

const base: Row[] = [
  { id: "a", name: "Alpha", qty: 3, plan: "free", done: false },
  { id: "b", name: "Bravo", qty: 10, plan: "team", done: true },
  { id: "c", name: "Charlie", qty: 7, plan: "team", done: false },
]

const columns: DataGridColumn<Row>[] = [
  { id: "name", header: "Name", accessorKey: "name", editable: true, width: 140 },
  { id: "qty", header: "Qty", accessorKey: "qty", type: "number", editable: true, width: 100, validate: (v) => (typeof v === "number" && v >= 0 ? undefined : "Must be zero or more.") },
  {
    id: "plan",
    header: "Plan",
    accessorKey: "plan",
    type: "select",
    editable: true,
    width: 120,
    options: [
      { value: "free", label: "Free" },
      { value: "team", label: "Team", tone: "success" },
    ],
  },
  { id: "done", header: "Done", accessorKey: "done", type: "boolean", editable: true, width: 90 },
]

const status = () => document.querySelector<HTMLElement>("[data-slot=data-grid-status]")!
const cell = (row: number, col: number) => document.querySelector<HTMLElement>(`[data-row="${row}"][data-col="${col}"]`)!

function Grid(props: Partial<React.ComponentProps<typeof DataGrid<Row>>>) {
  return <DataGrid<Row> label="Items" columns={columns} defaultData={base} height={240} {...props} />
}

describe("DataGrid", () => {
  it("is an ARIA grid that knows its size", () => {
    render(<Grid />)
    const grid = screen.getByRole("grid", { name: "Items" })
    expect(grid).toHaveAttribute("aria-rowcount", "4")
    expect(grid).toHaveAttribute("aria-colcount", "4")
    expect(screen.getAllByRole("columnheader")).toHaveLength(4)
    expect(screen.getAllByRole("row")[1]).toHaveAttribute("aria-rowindex", "2")
    expect(status()).toHaveTextContent("3 rows")
  })

  it("draws only the rows in view, and keeps their place for screen readers", () => {
    const many = Array.from({ length: 5000 }, (_, i) => ({ id: `r${i}`, name: `Row ${i}`, qty: i, plan: "free", done: false }))
    render(<Grid defaultData={many} density="compact" />)
    const grid = screen.getByRole("grid")
    expect(grid).toHaveAttribute("aria-rowcount", "5001")
    expect(screen.getAllByRole("row").length).toBeLessThan(40)
    expect(screen.getByText("Row 0")).toBeInTheDocument()
    expect(screen.queryByText("Row 4000")).toBeNull()
  })

  it("moves with the arrow keys, Home, End and the grid corners", async () => {
    const user = userEvent.setup()
    render(<Grid />)
    await user.click(cell(0, 0))
    expect(cell(0, 0)).toHaveFocus()
    await user.keyboard("{ArrowRight}{ArrowDown}")
    expect(cell(1, 1)).toHaveFocus()
    await user.keyboard("{End}")
    expect(cell(1, 3)).toHaveFocus()
    await user.keyboard("{Home}")
    expect(cell(1, 0)).toHaveFocus()
    await user.keyboard("{Control>}{End}{/Control}")
    expect(cell(2, 3)).toHaveFocus()
    await user.keyboard("{Control>}{Home}{/Control}")
    expect(cell(0, 0)).toHaveFocus()
  })

  it("swaps the left and right arrows in right-to-left", async () => {
    const user = userEvent.setup()
    render(<Grid dir="rtl" />)
    await user.click(cell(0, 1))
    await user.keyboard("{ArrowLeft}")
    expect(cell(0, 2)).toHaveFocus()
    await user.keyboard("{ArrowRight}{ArrowRight}")
    expect(cell(0, 0)).toHaveFocus()
  })

  it("has one tab stop, which follows the active cell", async () => {
    const user = userEvent.setup()
    render(<Grid />)
    expect(document.querySelectorAll('[role=gridcell][tabindex="0"]')).toHaveLength(1)
    await user.click(cell(2, 2))
    expect(document.querySelectorAll('[role=gridcell][tabindex="0"]')).toHaveLength(1)
    expect(cell(2, 2)).toHaveAttribute("tabindex", "0")
  })

  it("edits with Enter, saves with Enter and moves down", async () => {
    const user = userEvent.setup()
    const onDataChange = vi.fn()
    render(<Grid onDataChange={onDataChange} />)
    await user.click(cell(0, 0))
    await user.keyboard("{Enter}")
    const input = screen.getByRole("textbox", { name: /Edit Name, row 1/ })
    expect(input).toHaveValue("Alpha")
    await user.clear(input)
    await user.type(input, "Apex{Enter}")
    expect(screen.getByText("Apex")).toBeInTheDocument()
    expect(cell(1, 0)).toHaveFocus()
    expect(onDataChange).toHaveBeenCalledTimes(1)
    expect(onDataChange.mock.calls[0]![1]).toEqual([expect.objectContaining({ rowId: "a", columnId: "name", value: "Apex", previous: "Alpha" })])
  })

  it("starts editing when you type, and Escape puts the old value back", async () => {
    const user = userEvent.setup()
    render(<Grid />)
    await user.click(cell(1, 0))
    await user.keyboard("Z")
    const input = screen.getByRole("textbox")
    expect(input).toHaveValue("Z")
    await user.keyboard("{Escape}")
    expect(screen.queryByRole("textbox")).toBeNull()
    expect(screen.getByText("Bravo")).toBeInTheDocument()
    expect(cell(1, 0)).toHaveFocus()
  })

  it("saves with Tab and moves to the next cell", async () => {
    const user = userEvent.setup()
    render(<Grid />)
    await user.click(cell(0, 0))
    await user.keyboard("{Enter}")
    await user.type(screen.getByRole("textbox"), "!{Tab}")
    expect(screen.getByText("Alpha!")).toBeInTheDocument()
    expect(cell(0, 1)).toHaveFocus()
  })

  it("refuses a bad value, says why, and keeps the cell open", async () => {
    const user = userEvent.setup()
    const onDataChange = vi.fn()
    render(<Grid onDataChange={onDataChange} />)
    await user.click(cell(0, 1))
    await user.keyboard("{Enter}")
    const input = screen.getByRole("textbox", { name: /Edit Qty/ })
    await user.clear(input)
    await user.type(input, "-4{Enter}")
    expect(screen.getByRole("alert")).toHaveTextContent("Must be zero or more.")
    expect(input).toHaveAttribute("aria-invalid", "true")
    expect(onDataChange).not.toHaveBeenCalled()
    await user.clear(input)
    await user.type(input, "12{Enter}")
    expect(screen.queryByRole("alert")).toBeNull()
    expect(onDataChange).toHaveBeenCalledTimes(1)
    expect(screen.getByText("12")).toBeInTheDocument()
  })

  it("refuses text in a number column", async () => {
    const user = userEvent.setup()
    render(<Grid />)
    await user.click(cell(0, 1))
    await user.keyboard("{Enter}")
    const input = screen.getByRole("textbox")
    await user.clear(input)
    await user.type(input, "abc{Enter}")
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a number.")
  })

  it("toggles a boolean cell with Space and clears one with Delete", async () => {
    const user = userEvent.setup()
    const onCellChange = vi.fn()
    render(<Grid onCellChange={onCellChange} />)
    await user.click(cell(0, 3))
    await user.keyboard(" ")
    expect(onCellChange).toHaveBeenLastCalledWith(expect.objectContaining({ rowId: "a", columnId: "done", value: true }))
    await user.click(cell(0, 0))
    await user.keyboard("{Delete}")
    expect(onCellChange).toHaveBeenLastCalledWith(expect.objectContaining({ rowId: "a", columnId: "name", value: null }))
  })

  it("toggles a yes/no cell with one click", async () => {
    const user = userEvent.setup()
    const onCellChange = vi.fn()
    render(<Grid onCellChange={onCellChange} />)
    await user.click(within(cell(1, 3)).getByRole("img", { name: "Yes" }))
    expect(onCellChange).toHaveBeenCalledWith(expect.objectContaining({ rowId: "b", columnId: "done", value: false }))
  })

  it("writes big counts for the locale", () => {
    const many = Array.from({ length: 12345 }, (_, i) => ({ id: `r${i}`, name: `Row ${i}`, qty: i, plan: "free", done: false }))
    render(<Grid defaultData={many} />)
    expect(status()).toHaveTextContent("12,345 rows")
  })

  it("edits a select cell with the native list", async () => {
    const user = userEvent.setup()
    const onCellChange = vi.fn()
    render(<Grid onCellChange={onCellChange} />)
    await user.click(cell(0, 2))
    await user.keyboard("{Enter}")
    const select = screen.getByRole("combobox", { name: /Edit Plan/ })
    await user.selectOptions(select, "team")
    await user.keyboard("{Enter}")
    expect(onCellChange).toHaveBeenCalledWith(expect.objectContaining({ columnId: "plan", value: "team", previous: "free" }))
  })

  it("sorts by a heading and says so, adding a second sort with Shift", async () => {
    const user = userEvent.setup()
    render(<Grid />)
    const header = (name: string) => screen.getByRole("columnheader", { name: new RegExp(name) })
    expect(header("Qty")).toHaveAttribute("aria-sort", "none")
    await user.click(within(header("Qty")).getByRole("button"))
    expect(header("Qty")).toHaveAttribute("aria-sort", "ascending")
    expect(cell(0, 0)).toHaveTextContent("Alpha")
    await user.click(within(header("Qty")).getByRole("button"))
    expect(header("Qty")).toHaveAttribute("aria-sort", "descending")
    expect(cell(0, 0)).toHaveTextContent("Bravo")
    await user.click(within(header("Qty")).getByRole("button"))
    expect(header("Qty")).toHaveAttribute("aria-sort", "none")
    await user.click(within(header("Plan")).getByRole("button"))
    await user.keyboard("{Shift>}")
    await user.click(within(header("Name")).getByRole("button"))
    await user.keyboard("{/Shift}")
    expect(header("Plan")).toHaveAttribute("aria-sort", "ascending")
    expect(header("Name")).toHaveAttribute("aria-sort", "ascending")
  })

  it("reports sorting when it is controlled", async () => {
    const user = userEvent.setup()
    const onSortingChange = vi.fn()
    render(<Grid sorting={[]} onSortingChange={onSortingChange} />)
    await user.click(within(screen.getByRole("columnheader", { name: /Name/ })).getByRole("button"))
    expect(onSortingChange).toHaveBeenCalledWith([{ id: "name", desc: false }])
    expect(screen.getByRole("columnheader", { name: /Name/ })).toHaveAttribute("aria-sort", "none")
  })

  it("undoes and redoes edits, and announces it", async () => {
    const user = userEvent.setup()
    render(<Grid />)
    await user.click(cell(0, 0))
    await user.keyboard("{Enter}")
    await user.clear(screen.getByRole("textbox"))
    await user.type(screen.getByRole("textbox"), "Apex{Enter}")
    expect(screen.getByText("Apex")).toBeInTheDocument()
    await user.keyboard("{Control>}z{/Control}")
    expect(screen.getByText("Alpha")).toBeInTheDocument()
    expect(screen.getByText("Undid 1 change")).toBeInTheDocument()
    await user.keyboard("{Control>}{Shift>}z{/Shift}{/Control}")
    expect(screen.getByText("Apex")).toBeInTheDocument()
  })

  it("pastes cells copied from a spreadsheet as one change", () => {
    const onDataChange = vi.fn()
    render(<Grid onDataChange={onDataChange} />)
    fireEvent.focus(cell(0, 0))
    fireEvent.paste(cell(0, 0), { clipboardData: { getData: () => "Delta\t5\nEcho\t8" } })
    expect(onDataChange).toHaveBeenCalledTimes(1)
    expect(onDataChange.mock.calls[0]![1]).toHaveLength(4)
    expect(screen.getByText("Delta")).toBeInTheDocument()
    expect(screen.getByText("Echo")).toBeInTheDocument()
    expect(screen.getByText("Pasted 4 cells")).toBeInTheDocument()
  })

  it("selects rows and all rows", async () => {
    const user = userEvent.setup()
    const onSelectedRowIdsChange = vi.fn()
    render(<Grid selectable onSelectedRowIdsChange={onSelectedRowIdsChange} />)
    expect(screen.getByRole("grid")).toHaveAttribute("aria-multiselectable", "true")
    await user.click(screen.getByRole("checkbox", { name: "Select row 2" }))
    expect(onSelectedRowIdsChange).toHaveBeenLastCalledWith(["b"])
    expect(screen.getAllByRole("row")[2]).toHaveAttribute("aria-selected", "true")
    expect(status()).toHaveTextContent("1 selected")
    await user.click(screen.getByRole("checkbox", { name: "Select all rows" }))
    expect(onSelectedRowIdsChange).toHaveBeenLastCalledWith(expect.arrayContaining(["a", "b", "c"]))
  })

  it("filters rows by the search text and says when nothing matches", () => {
    const { rerender } = render(<Grid search="brav" />)
    expect(status()).toHaveTextContent("1 of 3 rows")
    expect(screen.getByRole("grid")).toHaveAttribute("aria-rowcount", "2")
    rerender(<Grid search="zzz" />)
    expect(screen.getByText("No rows match “zzz”.")).toBeInTheDocument()
  })

  it("resizes a column from the keyboard", async () => {
    const user = userEvent.setup()
    render(<Grid />)
    const handle = screen.getByRole("separator", { name: "Resize Name" })
    expect(handle).toHaveAttribute("aria-valuenow", "140")
    handle.focus()
    await user.keyboard("{ArrowRight}")
    expect(handle).toHaveAttribute("aria-valuenow", "156")
    await user.keyboard("{ArrowLeft}{ArrowLeft}")
    expect(handle).toHaveAttribute("aria-valuenow", "124")
  })

  it("pins a column to the start edge", () => {
    render(<Grid columns={columns.map((c, i) => (i === 1 ? { ...c, pin: "start" as const } : c))} />)
    const heads = screen.getAllByRole("columnheader")
    expect(heads[0]).toHaveTextContent("Qty")
    expect(heads[0]!.style.position).toBe("sticky")
  })

  it("does not edit read-only cells", async () => {
    const user = userEvent.setup()
    render(<Grid columns={columns.map((c) => ({ ...c, editable: false }))} />)
    await user.click(cell(0, 0))
    await user.keyboard("{Enter}x")
    expect(screen.queryByRole("textbox")).toBeNull()
    expect(cell(0, 0)).toHaveAttribute("aria-readonly", "true")
  })

  it("shows loading, empty and error states", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const { rerender } = render(<Grid state="loading" />)
    expect(screen.getByText("Loading rows")).toBeInTheDocument()
    expect(screen.queryByRole("grid")).toBeNull()
    rerender(<Grid data={[]} />)
    expect(screen.getByText("Nothing here yet")).toBeInTheDocument()
    rerender(<Grid state="error" onRetry={onRetry} />)
    await user.click(screen.getByRole("button", { name: /try again/i }))
    expect(onRetry).toHaveBeenCalled()
  })
})
