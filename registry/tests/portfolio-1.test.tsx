import * as React from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { Portfolio1, type Portfolio1Holding } from "@/components/ballmac/blocks/portfolio-1/portfolio-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

const h = (id: string, symbol: string, kind: string, shares: number, price: number, dayPct: number): Portfolio1Holding => ({ id, symbol, name: `${symbol} fund`, kind, shares, price, dayPct, spark: [price * 0.9, price] })
const holdings = [h("a", "AAA", "Stocks", 10, 100, 2), h("b", "BBB", "Bonds", 20, 50, -1), h("c", "CCC", "Cash", 1000, 1, 0)]
const series = { "1M": [1000, 1100, 1200, 1300], "1W": [1000, 900] }

describe("Portfolio1", () => {
  it("works out the total, allocation shares and each holding's value", () => {
    render(<Portfolio1 holdings={holdings} series={series} currency="USD" />)
    // 10*100 + 20*50 + 1000*1 = 3000
    expect(screen.getByText("3 holdings").nextElementSibling).toHaveTextContent("$3,000")
    expect(screen.getByRole("img", { name: "Allocation: Stocks 33%, Bonds 33%, Cash 33%" })).toBeInTheDocument()
    const row = screen.getByText("AAA").closest("tr")!
    expect(within(row).getByText("$1,000")).toBeInTheDocument()
    expect(within(row).getByText("33.3%")).toBeInTheDocument()
  })

  it("works out the change over the range from the first and last point, with a sign", async () => {
    const user = userEvent.setup()
    render(<Portfolio1 holdings={holdings} series={series} defaultRange="1M" />)
    expect(screen.getByText(/\+\$300 \(\+30\.00%\)/)).toBeInTheDocument()
    await user.click(screen.getByRole("radio", { name: "1W" }))
    expect(screen.getByText(/−\$100 \(−10\.00%\)/)).toBeInTheDocument()
  })

  it("lets the line be scrubbed with the keyboard and reads the value", async () => {
    const user = userEvent.setup()
    render(<Portfolio1 holdings={holdings} series={series} defaultRange="1M" />)
    const line = screen.getByRole("slider", { name: "Portfolio value over time" })
    line.focus()
    await user.keyboard("{Home}")
    expect(line).toHaveAttribute("aria-valuetext", "$1,000, point 1 of 4")
    await user.keyboard("{ArrowRight}{ArrowRight}")
    expect(line).toHaveAttribute("aria-valuetext", "$1,200, point 3 of 4")
    expect(screen.getByText(/\+\$200 since the start/)).toBeInTheDocument()
    await user.keyboard("{End}")
    expect(line).toHaveAttribute("aria-valuenow", "3")
  })

  it("writes day changes with a sign", () => {
    render(<Portfolio1 holdings={holdings} series={series} />)
    expect(screen.getByText("+2.00%")).toBeInTheDocument()
    expect(screen.getByText("−1.00%")).toBeInTheDocument()
    expect(screen.getByText("+0.00%")).toBeInTheDocument()
  })

  it("sorts by a column and says which way with aria-sort", async () => {
    const user = userEvent.setup()
    render(<Portfolio1 holdings={holdings} series={series} />)
    const symbols = () => screen.getAllByRole("rowheader").map((r) => r.textContent!.slice(0, 3))
    expect(symbols()).toHaveLength(3)
    await user.click(screen.getByRole("button", { name: "Holding" }))
    expect(symbols()).toEqual(["AAA", "BBB", "CCC"])
    expect(screen.getByRole("columnheader", { name: "Holding" })).toHaveAttribute("aria-sort", "ascending")
    await user.click(screen.getByRole("button", { name: "Holding" }))
    expect(symbols()).toEqual(["CCC", "BBB", "AAA"])
    expect(screen.getByRole("columnheader", { name: "Holding" })).toHaveAttribute("aria-sort", "descending")
  })

  it("filters holdings by type", async () => {
    const user = userEvent.setup()
    render(<Portfolio1 holdings={holdings} series={series} />)
    await user.click(screen.getByRole("button", { name: "Bonds" }))
    expect(screen.getByRole("button", { name: "Bonds" })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getAllByRole("rowheader")).toHaveLength(1)
  })

  it("shows loading, empty and error states", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const { rerender } = render(<Portfolio1 state="loading" />)
    expect(screen.getByRole("status")).toBeInTheDocument()
    rerender(<Portfolio1 state="empty" />)
    expect(screen.getByRole("heading", { name: "No holdings yet" })).toBeInTheDocument()
    rerender(<Portfolio1 state="error" onRetry={onRetry} />)
    await user.click(screen.getByRole("button", { name: /try again/i }))
    expect(onRetry).toHaveBeenCalled()
  })
})
