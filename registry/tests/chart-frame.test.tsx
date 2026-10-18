import * as React from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

// jsdom has no layout, so ResponsiveContainer would render nothing; render its children directly.
vi.mock("recharts", async (importOriginal) => ({
  ...(await importOriginal<typeof import("recharts")>()),
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))
// motion remembers the first answer to "does this person want less motion", so each test sets it here instead.
let reducedMotion = false
vi.mock("motion/react", async (importOriginal) => ({ ...(await importOriginal<typeof import("motion/react")>()), useReducedMotion: () => reducedMotion }))
import { ChartFrame, describeChart, domainTicks, niceScale, type ChartFrameContext } from "@/components/ballmac/chart-frame"
import { DirectionProvider } from "@/lib/ballmac/direction"

const data = [
  { month: "Jan", desktop: 4210, mobile: 2480 },
  { month: "Feb", desktop: 4860, mobile: 3120 },
  { month: "Mar", desktop: 4540, mobile: 3790 },
]
const series = [
  { key: "desktop", label: "Desktop" },
  { key: "mobile", label: "Mobile" },
]

function setup(props: Partial<React.ComponentProps<typeof ChartFrame>> = {}) {
  const seen: ChartFrameContext[] = []
  const utils = render(
    <ChartFrame title="Visitors" description="Desktop and mobile" data={data} xKey="month" series={series} categoryLabel="Month" {...props}>
      {(chart) => {
        seen.push(chart)
        return <div data-testid="plot">{chart.visible.join(",")}</div>
      }}
    </ChartFrame>
  )
  return { ...utils, last: () => seen.at(-1)! }
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  reducedMotion = false
})

describe("ChartFrame", () => {
  it("names the figure and describes it with a summary written from the data", () => {
    setup()
    const figure = screen.getByRole("figure", { name: "Visitors" })
    expect(figure).toHaveAccessibleDescription(expect.stringContaining("Desktop: from 4,210 in Jan to 4,540 in Mar; highest 4,860 in Feb, lowest 4,210 in Jan."))
    expect(figure).toHaveAccessibleDescription(expect.stringContaining("Mobile: from 2,480 in Jan to 3,790 in Mar"))
    expect(figure).toHaveAccessibleDescription(expect.stringContaining("3 points."))
  })

  it("uses your own summary when you give one", () => {
    setup({ summary: "Mobile caught up." })
    expect(screen.getByRole("figure", { name: "Visitors" })).toHaveAccessibleDescription("Mobile caught up.")
  })

  it("shows the same numbers as a table, and downloads them", async () => {
    const user = userEvent.setup()
    const create = vi.fn(() => "blob:x")
    vi.stubGlobal("URL", Object.assign(URL, { createObjectURL: create, revokeObjectURL: vi.fn() }))
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {})
    setup({ valueFormatter: (v) => `${v} visits` })
    await user.click(screen.getByRole("radio", { name: "Table" }))
    const table = screen.getByRole("table", { name: "Visitors" })
    expect(within(table).getAllByRole("columnheader").map((h) => h.textContent)).toEqual(["Month", "Desktop", "Mobile"])
    expect(within(table).getByRole("rowheader", { name: "Feb" })).toBeInTheDocument()
    expect(within(table).getAllByRole("cell")[0]).toHaveTextContent("4210 visits")
    await user.click(screen.getByRole("button", { name: "Download CSV" }))
    expect(create).toHaveBeenCalledTimes(1)
    const blob = (create.mock.calls as unknown as [Blob][])[0]![0]
    expect(blob.type).toContain("text/csv")
  })

  it("has a legend that switches series off and keeps at least one on", async () => {
    const user = userEvent.setup()
    const { last } = setup()
    const desktop = screen.getByRole("button", { name: "Desktop" })
    const mobile = screen.getByRole("button", { name: "Mobile" })
    expect(desktop).toHaveAttribute("aria-pressed", "true")
    await user.click(desktop)
    expect(desktop).toHaveAttribute("aria-pressed", "false")
    expect(last().isHidden("desktop")).toBe(true)
    expect(last().visible).toEqual(["mobile"])
    await user.click(mobile) // the last one on cannot be switched off
    expect(mobile).toHaveAttribute("aria-pressed", "true")
    expect(last().visible).toEqual(["mobile"])
    await user.click(desktop)
    expect(last().visible).toEqual(["desktop", "mobile"])
  })

  it("draws a plain legend or none", () => {
    const { unmount } = setup({ legend: "static" })
    expect(screen.queryByRole("button", { name: "Desktop" })).not.toBeInTheDocument()
    expect(screen.getByText("Desktop")).toBeInTheDocument()
    unmount()
    setup({ legend: "none" })
    expect(screen.queryByText("Desktop")).not.toBeInTheDocument()
  })

  it("fills series with patterns when asked, and tells the chart", async () => {
    const user = userEvent.setup()
    const { last, container } = setup({ patterns: "toggle" })
    expect(last().patterns).toBe(false)
    expect(last().fill("desktop")).toBe("var(--color-desktop)")
    await user.click(screen.getByRole("button", { name: "Fill with patterns as well as color" }))
    expect(last().patterns).toBe(true)
    expect(last().fill("desktop")).toMatch(/^url\(#.+-p0\)$/)
    expect(container.querySelectorAll("pattern")).toHaveLength(0) // defs are rendered by the chart; the frame only hands them over
    expect(Array.isArray(last().defs)).toBe(true)
  })

  it("always uses patterns with patterns={true}", () => {
    const { last } = setup({ patterns: true })
    expect(last().patterns).toBe(true)
    expect(screen.queryByRole("button", { name: "Fill with patterns as well as color" })).not.toBeInTheDocument()
  })

  it("writes numbers with the formatter and the locale", () => {
    const { last } = setup({ valueFormatter: (v, k) => `${k}:${v}`, locale: "de" })
    expect(last().format(1234, "desktop")).toBe("desktop:1234")
    expect(last().locale).toBe("de")
  })

  it("turns animation off under reduced motion", () => {
    reducedMotion = true
    const { last } = setup()
    expect(last().animate).toBe(false)
  })

  it("tells the chart when the page reads right to left", () => {
    const seen: ChartFrameContext[] = []
    render(
      <DirectionProvider dir="rtl">
        <ChartFrame title="T" data={data} xKey="month" series={series}>
          {(chart) => {
            seen.push(chart)
            return <div />
          }}
        </ChartFrame>
      </DirectionProvider>
    )
    expect(seen.at(-1)!.rtl).toBe(true)
  })

  it("shows loading, empty and error states, with retry", async () => {
    const user = userEvent.setup()
    const retry = vi.fn()
    const { rerender } = render(
      <ChartFrame title="Visitors" data={[]} xKey="month" series={series} state="loading">
        {() => <div />}
      </ChartFrame>
    )
    expect(screen.getByRole("status")).toHaveTextContent("Loading Visitors")
    expect(screen.queryByRole("radio", { name: "Table" })).not.toBeInTheDocument()
    rerender(
      <ChartFrame title="Visitors" data={[]} xKey="month" series={series}>
        {() => <div />}
      </ChartFrame>
    )
    expect(screen.getByText("No data yet")).toBeInTheDocument()
    rerender(
      <ChartFrame title="Visitors" data={data} xKey="month" series={series} state="error" onRetry={retry} errorState={{ description: "The service is down." }}>
        {() => <div />}
      </ChartFrame>
    )
    expect(screen.getByRole("alert")).toHaveTextContent("The service is down.")
    await user.click(screen.getByRole("button", { name: /try again/i }))
    expect(retry).toHaveBeenCalledTimes(1)
  })

  it("can hide the table view", () => {
    setup({ tableView: false })
    expect(screen.queryByRole("radiogroup", { name: "View" })).not.toBeInTheDocument()
  })
})

describe("describeChart", () => {
  const msg = ((_k: string, fallback: unknown, values?: Record<string, unknown>) => {
    const text = typeof fallback === "string" ? fallback : (fallback as { other: string }).other
    return text.replace(/\{(\w+)\}/g, (_m, name) => String(values?.[name] ?? ""))
  }) as never
  it("ranks categories largest first", () => {
    const text = describeChart({ data: [{ p: "a", v: 3 }, { p: "b", v: 9 }, { p: "c", v: 5 }], xKey: "p", series: [{ key: "v", label: "Views" }], mode: "ranking", format: (v) => String(v), formatCategory: String, msg })
    expect(text).toContain("Views: b 9, c 5, a 3.")
  })
  it("says so for one point and for nothing", () => {
    expect(describeChart({ data: [{ p: "a", v: 3 }], xKey: "p", series: [{ key: "v", label: "Views" }], mode: "trend", format: String, formatCategory: String, msg })).toContain("Views: 3 in a.")
    expect(describeChart({ data: [], xKey: "p", series: [], mode: "trend", format: String, formatCategory: String, msg })).toBe("")
  })
})

describe("axis helpers", () => {
  it("niceScale rounds to steps people read", () => {
    const s = niceScale({ data: [{ a: 0 }, { a: 1400 }], keys: ["a"] })!
    expect(s.ticks).toEqual([0, 500, 1000, 1500])
    expect(s.domain).toEqual([0, 1500])
  })
  it("niceScale adds stacked values and keeps zero for bars", () => {
    const s = niceScale({ data: [{ a: 400, b: 300 }, { a: 650, b: 640 }], keys: ["a", "b"], stacked: true })!
    expect(s.domain[0]).toBe(0)
    expect(s.domain[1]).toBeGreaterThanOrEqual(1290)
  })
  it("niceScale can leave zero out for lines, and handles negatives", () => {
    expect(niceScale({ data: [{ a: 98 }, { a: 104 }], keys: ["a"], zero: false })!.domain[0]).toBeGreaterThanOrEqual(90)
    expect(niceScale({ data: [{ a: -1800 }, { a: 6400 }], keys: ["a"] })!.ticks).toContain(0)
    expect(niceScale({ data: [], keys: ["a"] })).toBeUndefined()
  })
  it("domainTicks rounds inside a fixed domain", () => {
    expect(domainTicks([3.5, 5])).toEqual([3.5, 4, 4.5, 5])
    expect(domainTicks([0, 100])).toEqual([0, 25, 50, 75, 100])
    expect(domainTicks(["auto", 5])).toBeUndefined()
  })
})
