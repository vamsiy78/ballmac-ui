import * as React from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

vi.mock("recharts", async (importOriginal) => ({
  ...(await importOriginal<typeof import("recharts")>()),
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))
import { ChartArea } from "@/components/ballmac/chart-area"
import { ChartBar } from "@/components/ballmac/chart-bar"
import { ChartLine } from "@/components/ballmac/chart-line"
import { ChartPie } from "@/components/ballmac/chart-pie"
import { ChartRadar } from "@/components/ballmac/chart-radar"
import { ChartRadial } from "@/components/ballmac/chart-radial"
import { ChartScatter } from "@/components/ballmac/chart-scatter"

const months = [
  { month: "Jan", a: 10, b: 4 },
  { month: "Feb", a: 14, b: 6 },
  { month: "Mar", a: 12, b: 9 },
]
const two = [
  { key: "a", label: "Alpha" },
  { key: "b", label: "Beta" },
]

describe("the chart families", () => {
  it("ChartArea, ChartLine and ChartRadar each give a named figure, a toggling legend and a table", async () => {
    const user = userEvent.setup()
    for (const chart of [
      <ChartArea key="area" title="Area" data={months} xKey="month" series={two} stack="stacked" referenceLines={[{ y: 12, label: "Target" }]} />,
      <ChartLine key="line" title="Line" data={months} xKey="month" series={two} dashed={["b"]} />,
      <ChartRadar key="radar" title="Radar" data={months} xKey="month" series={two} scale />,
    ]) {
      const { unmount } = render(chart)
      const title = (chart.props as { title: string }).title
      expect(screen.getByRole("figure", { name: title })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Alpha" })).toHaveAttribute("aria-pressed", "true")
      await user.click(screen.getByRole("radio", { name: "Table" }))
      expect(within(screen.getByRole("table", { name: title })).getAllByRole("row")).toHaveLength(4)
      unmount()
    }
  })

  it("ChartLine can label its lines directly and then needs no legend", () => {
    render(<ChartLine title="Offices" data={months} xKey="month" series={two} directLabels />)
    expect(screen.getByRole("figure", { name: "Offices" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Alpha" })).not.toBeInTheDocument()
  })

  it("ChartBar sorts, and with colorBy='category' lists the categories in the legend and the table", async () => {
    const user = userEvent.setup()
    render(<ChartBar title="Browsers" data={[{ b: "Safari", v: 5 }, { b: "Chrome", v: 9 }, { b: "Edge", v: 2 }]} xKey="b" series={[{ key: "v", label: "Visitors" }]} colorBy="category" sort="descending" categoryLabel="Browser" />)
    expect(screen.getByRole("button", { name: "Chrome" })).toBeInTheDocument()
    expect(screen.getByRole("figure", { name: "Browsers" })).toHaveAccessibleDescription("3 points. Visitors: Chrome 9, Safari 5, Edge 2.")
    await user.click(screen.getByRole("radio", { name: "Table" }))
    const table = screen.getByRole("table", { name: "Browsers" })
    expect(within(table).getAllByRole("columnheader").map((h) => h.textContent)).toEqual(["Browser", "Visitors"])
    expect(within(table).getAllByRole("rowheader").map((h) => h.textContent)).toEqual(["Chrome", "Safari", "Edge"])
  })

  it("ChartPie writes every slice's share into the summary and the table", async () => {
    const user = userEvent.setup()
    render(<ChartPie title="Sources" data={[{ name: "search", label: "Search", value: 60 }, { name: "email", label: "Email", value: 40 }]} valueLabel="visits" />)
    expect(screen.getByRole("figure", { name: "Sources" })).toHaveAccessibleDescription("100 visits in total across 2 groups. Search 60% (60), Email 40% (40).")
    await user.click(screen.getByRole("radio", { name: "Table" }))
    const table = screen.getByRole("table", { name: "Sources" })
    expect(within(table).getAllByRole("columnheader").map((h) => h.textContent)).toEqual(["Category", "Visits", "Share"])
    expect(within(table).getAllByRole("cell").map((c) => c.textContent)).toEqual(["60", "60%", "40", "40%"])
  })

  it("ChartPie lets you switch a slice off in the legend", async () => {
    const user = userEvent.setup()
    render(<ChartPie title="Sources" data={[{ name: "search", label: "Search", value: 60 }, { name: "email", label: "Email", value: 40 }]} />)
    const search = screen.getByRole("button", { name: "Search" })
    await user.click(search)
    expect(search).toHaveAttribute("aria-pressed", "false")
    expect(screen.getByRole("button", { name: "Email" })).toHaveAttribute("aria-pressed", "true")
  })

  it("ChartRadial reads each ring as a share of the full ring", () => {
    render(<ChartRadial title="Goals" data={[{ name: "a", label: "Revenue", value: 72 }, { name: "b", label: "Retention", value: 50 }]} valueFormatter={(v) => `${v}%`} />)
    expect(screen.getByRole("figure", { name: "Goals" })).toHaveAccessibleDescription("Revenue: 72% of 100% (72%). Retention: 50% of 100% (50%).")
  })

  it("ChartRadial lets the full ring be more than 100", () => {
    render(<ChartRadial title="Steps" max={10000} data={[{ name: "s", label: "Today", value: 7500 }]} />)
    expect(screen.getByRole("figure", { name: "Steps" })).toHaveAccessibleDescription("Today: 7,500 of 10,000 (75%).")
  })

  it("ChartScatter tabulates every point with its name, group, numbers and size", async () => {
    const user = userEvent.setup()
    render(
      <ChartScatter
        title="Cities"
        data={[{ city: "Lagos", region: "africa", people: 15.4, growth: 3.2, gdp: 98 }, { city: "Seoul", region: "asia", people: 9.9, growth: 0.1, gdp: 880 }]}
        xKey="people"
        yKey="growth"
        zKey="gdp"
        groupKey="region"
        nameKey="city"
        xLabel="People"
        yLabel="Growth"
        zLabel="Output"
        groups={[{ key: "africa", label: "Africa" }, { key: "asia", label: "Asia" }]}
      />
    )
    expect(screen.getByRole("figure", { name: "Cities" })).toHaveAccessibleDescription("2 points. People from 9.9 to 15.4; Growth from 0.1 to 3.2.")
    await user.click(screen.getByRole("radio", { name: "Table" }))
    const table = screen.getByRole("table", { name: "Cities" })
    expect(within(table).getAllByRole("columnheader").map((h) => h.textContent)).toEqual(["Name", "Group", "People", "Growth", "Output"])
    expect(within(table).getAllByRole("cell").slice(0, 4).map((c) => c.textContent)).toEqual(["Africa", "15.4", "3.2", "98"])
  })

  it("every family shows loading, empty and error", () => {
    for (const [name, make] of Object.entries({
      area: (state: "loading" | "empty" | "error") => <ChartArea title="T" data={state === "empty" ? [] : months} xKey="month" series={two} state={state} />,
      bar: (state: "loading" | "empty" | "error") => <ChartBar title="T" data={state === "empty" ? [] : months} xKey="month" series={two} state={state} />,
      pie: (state: "loading" | "empty" | "error") => <ChartPie title="T" data={state === "empty" ? [] : [{ name: "a", value: 1 }]} state={state} />,
    })) {
      for (const state of ["loading", "empty", "error"] as const) {
        const { unmount } = render(make(state))
        expect(screen.getByRole(state === "error" ? "alert" : state === "loading" ? "status" : "heading", state === "empty" ? { name: "No data yet" } : undefined), `${name} ${state}`).toBeInTheDocument()
        unmount()
      }
    }
  })
})
