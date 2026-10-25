import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { UptimeTracker, type UptimeDay } from "@/components/ballmac/uptime-tracker"

const days: UptimeDay[] = [
  { date: "Oct 1", status: "up" },
  { date: "Oct 2", status: "down", note: "42 minutes of errors" },
  { date: "Oct 3", status: "degraded", note: "Slow" },
  { date: "Oct 4", status: "none" },
  { date: "Oct 5", status: "up" },
]

describe("UptimeTracker", () => {
  it("says the uptime and what went wrong in words", () => {
    render(<UptimeTracker label="API" days={days} />)
    expect(screen.getByText("50% uptime")).toBeInTheDocument()
    expect(screen.getByText("1 outage day, 1 degraded")).toBeInTheDocument()
  })

  it("names each day, its status and its note", () => {
    render(<UptimeTracker label="API" days={days} />)
    expect(screen.getByRole("button", { name: "Oct 2: Outage. 42 minutes of errors" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Oct 4: No data" })).toBeInTheDocument()
  })

  it("is one tab stop on the last day and arrows move along the days", async () => {
    const user = userEvent.setup()
    render(<UptimeTracker label="API" days={days} />)
    const cells = screen.getAllByRole("button")
    expect(cells.filter((c) => c.getAttribute("tabindex") === "0")).toEqual([cells[4]])
    cells[4].focus()
    await user.keyboard("{ArrowLeft}{ArrowLeft}")
    expect(cells[2]).toHaveFocus()
    await user.keyboard("{Home}")
    expect(cells[0]).toHaveFocus()
    await user.keyboard("{End}")
    expect(cells[4]).toHaveFocus()
  })

  it("writes the day you are on underneath, and clears it with Escape", async () => {
    const user = userEvent.setup()
    render(<UptimeTracker label="API" days={days} />)
    const cells = screen.getAllByRole("button")
    act(() => cells[1].focus())
    expect(screen.getByText("Oct 2", { selector: "span" })).toBeInTheDocument()
    await user.keyboard("{Escape}")
    expect(screen.getByText("Today")).toBeInTheDocument()
  })

  it("uses the uptime it is given", () => {
    render(<UptimeTracker label="API" days={days} uptime={99.94} />)
    expect(screen.getByText("99.94% uptime")).toBeInTheDocument()
  })
})
