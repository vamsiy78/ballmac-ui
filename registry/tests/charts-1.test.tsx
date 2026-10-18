import * as React from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

vi.mock("recharts", async (importOriginal) => ({
  ...(await importOriginal<typeof import("recharts")>()),
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))
import { Charts1 } from "@/components/ballmac/blocks/charts-1/charts-1"

// 14 days: the earlier seven have 100 visitors a day and 2 sign-ups, the latest seven 150 and 6.
const day = (i: number, newVisitors: number, returning: number, signups: number) => ({ date: `2026-07-${String(i + 1).padStart(2, "0")}`, newVisitors, returning, signups })
const daily = [...Array.from({ length: 7 }, (_, i) => day(i, 60, 40, 2)), ...Array.from({ length: 7 }, (_, i) => day(i + 7, 90, 60, 6))]

describe("Charts1", () => {
  it("works out each figure and its change from the period before", async () => {
    const user = userEvent.setup()
    render(<Charts1 daily={daily} defaultRange="7" />)
    const figures = screen.getAllByRole("definition")
    const text = (label: string) => screen.getByText(label, { selector: "dt" }).parentElement!.textContent
    expect(text("Visitors")).toContain("1,050")
    expect(text("Visitors")).toContain("+50%")
    expect(text("Visitors")).toContain("up vs the previous 7 days")
    expect(text("Sign-ups")).toContain("42")
    expect(text("Sign-ups")).toContain("+200%")
    expect(text("Conversion")).toContain("4%")
    expect(text("Returning")).toContain("40%")
    expect(figures.length).toBeGreaterThan(0)
    await user.click(screen.getByRole("radio", { name: "30 days" }))
    expect(text("Visitors")).toContain("1,750")
    expect(text("Visitors")).toContain("No earlier period to compare")
  })

  it("says a fall in words, not only with an arrow", () => {
    const falling = [...Array.from({ length: 7 }, (_, i) => day(i, 90, 60, 6)), ...Array.from({ length: 7 }, (_, i) => day(i + 7, 60, 40, 2))]
    render(<Charts1 daily={falling} defaultRange="7" />)
    expect(screen.getByText("Visitors", { selector: "dt" }).parentElement).toHaveTextContent("down vs the previous 7 days")
  })

  it("calls onRangeChange so the host can load that range", async () => {
    const user = userEvent.setup()
    const onRangeChange = vi.fn()
    render(<Charts1 daily={daily} defaultRange="7" onRangeChange={onRangeChange} />)
    await user.click(screen.getByRole("radio", { name: "90 days" }))
    expect(onRangeChange).toHaveBeenCalledWith("90")
  })

  it("gives each chart a table of its numbers", async () => {
    const user = userEvent.setup()
    render(<Charts1 daily={daily} defaultRange="7" pages={[{ page: "/a", views: 5 }]} sources={[{ name: "x", label: "Ex", value: 3 }]} />)
    await user.click(screen.getAllByRole("radio", { name: "Table" })[0]!)
    const table = screen.getByRole("table", { name: "Visitors" })
    expect(within(table).getAllByRole("row")).toHaveLength(8)
  })

  it("shows loading, empty and error", async () => {
    const user = userEvent.setup()
    const retry = vi.fn()
    const { rerender } = render(<Charts1 state="loading" />)
    expect(screen.getByRole("status")).toHaveTextContent("Loading analytics")
    expect(screen.getByRole("heading", { level: 1, name: "Analytics" })).toBeInTheDocument()
    rerender(<Charts1 state="empty" />)
    expect(screen.getByText("No visits yet")).toBeInTheDocument()
    rerender(<Charts1 state="empty" emptyState={{ title: "Quiet so far" }} />)
    expect(screen.getByText("Quiet so far")).toBeInTheDocument()
    rerender(<Charts1 daily={[]} />)
    expect(screen.getByText("No visits yet")).toBeInTheDocument()
    rerender(<Charts1 state="error" onRetry={retry} />)
    expect(screen.getByRole("alert")).toHaveTextContent("Analytics could not be loaded")
    await user.click(screen.getByRole("button", { name: /try again/i }))
    expect(retry).toHaveBeenCalledTimes(1)
  })
})
