import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { WaterfallChart, buildBars } from "@/components/ballmac/waterfall-chart"

const steps = [
  { id: "a", label: "Start", value: 100, kind: "total" as const },
  { id: "b", label: "Up", value: 40 },
  { id: "c", label: "Down", value: -70 },
  { id: "d", label: "End", value: 70, kind: "total" as const },
]

describe("buildBars", () => {
  it("floats changes from where the last step ended and resets on a total", () => {
    const bars = buildBars(steps)
    expect(bars.map((b) => [b.from, b.to, b.running])).toEqual([[0, 100, 100], [100, 140, 140], [140, 70, 70], [0, 70, 70]])
  })
  it("can cross zero", () => {
    const bars = buildBars([{ id: "a", label: "a", value: 10, kind: "total" }, { id: "b", label: "b", value: -25 }])
    expect(bars[1]).toMatchObject({ from: 10, to: -15, running: -15 })
  })
})

describe("WaterfallChart", () => {
  it("is a figure with a title and a table of every step, its change and the total after it", () => {
    render(<WaterfallChart title="Revenue bridge" steps={steps} />)
    expect(screen.getByRole("figure", { name: "Revenue bridge" })).toBeInTheDocument()
    const table = screen.getByRole("table", { name: "Revenue bridge" })
    const rows = within(table).getAllByRole("row")
    expect(rows).toHaveLength(5)
    expect(rows[2]).toHaveTextContent("Up")
    expect(rows[2]).toHaveTextContent("+40, increase")
    expect(rows[2]).toHaveTextContent("140")
    expect(rows[3]).toHaveTextContent("−70, decrease")
    expect(rows[3]).toHaveTextContent("70")
  })
  it("writes + and − on the bars so colour is never the only signal, and uses your format", () => {
    render(<WaterfallChart steps={steps} format={(v) => `$${v}`} />)
    expect(screen.getAllByText("+$40").length).toBeGreaterThan(0)
    expect(screen.getAllByText("−$70").length).toBeGreaterThan(0)
  })
  it("says where it ends", () => {
    render(<WaterfallChart steps={steps} />)
    expect(screen.getByText("Ends at 70.")).toBeInTheDocument()
  })
})
