import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { CalendarAgenda } from "@/components/ballmac/calendar-agenda"

const events = [
  { id: "one", date: "2026-09-30", time: "09:00", title: "Planning" },
  { id: "two", date: "2026-10-01", title: "Release" },
]

describe("CalendarAgenda", () => {
  it("moves between days and shows the matching agenda", async () => {
    const user = userEvent.setup()
    render(<CalendarAgenda events={events} defaultValue="2026-09-30" />)
    expect(screen.getByText("Planning")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Next day" }))
    expect(screen.getByText("Release")).toBeInTheDocument()
    expect(screen.queryByText("Planning")).not.toBeInTheDocument()
  })

  it("reports a controlled day without changing the shown events", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <CalendarAgenda
        events={events}
        value="2026-09-30"
        onValueChange={onValueChange}
      />,
    )
    await user.click(screen.getByRole("button", { name: "Next day" }))
    expect(onValueChange).toHaveBeenCalledWith("2026-10-01")
    expect(screen.getByText("Planning")).toBeInTheDocument()
  })
})
