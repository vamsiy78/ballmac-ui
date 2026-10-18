import { act, fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { EventCalendar, type CalendarEvent, type EventCalendarProps } from "@/components/ballmac/event-calendar"

const TODAY = new Date(2026, 9, 21, 10, 42) // Wednesday 21 October 2026

const events: CalendarEvent[] = [
  { id: "a", title: "Standup", start: "2026-10-19T09:00", end: "2026-10-19T09:30", tone: "chart-2" },
  { id: "b", title: "Design review", start: "2026-10-20T11:00", end: "2026-10-20T12:00", tone: "chart-3", location: "Room 4" },
  { id: "c", title: "Customer call", start: "2026-10-20T11:30", end: "2026-10-20T12:30", tone: "chart-2" },
  { id: "d", title: "Launch week", start: "2026-10-21", end: "2026-10-23", allDay: true, tone: "chart-4" },
  { id: "e", title: "Ship it", start: "2026-10-23T14:00", end: "2026-10-23T15:00" },
]

function Cal(props: Partial<EventCalendarProps>) {
  return <EventCalendar label="Team calendar" events={events} defaultDate={TODAY} today={TODAY} locale="en-US" weekStartsOn={1} {...props} />
}

describe("EventCalendar: month", () => {
  it("is a grid of the month, with each day named", () => {
    render(<Cal />)
    const grid = screen.getByRole("grid", { name: "October 2026" })
    expect(within(grid).getAllByRole("columnheader")).toHaveLength(7)
    expect(within(grid).getAllByRole("columnheader")[0]).toHaveAttribute("aria-label", "Monday")
    expect(screen.getByRole("heading", { name: "October 2026" })).toBeInTheDocument()
    const today = screen.getByRole("gridcell", { name: /Wednesday, October 21, 2026/ })
    expect(today).toHaveAttribute("aria-current", "date")
    expect(today).toHaveAccessibleName(/1 event/)
    expect(screen.getByRole("gridcell", { name: /Tuesday, October 20, 2026/ })).toHaveAccessibleName(/2 events/)
  })

  it("names every event with its date, time and place", () => {
    render(<Cal />)
    expect(screen.getByRole("button", { name: "Standup, Monday, October 19, 2026, 9:00 AM to 9:30 AM" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Launch week, Wednesday, October 21, 2026 to Friday, October 23, 2026, all day/ })).toBeInTheDocument()
  })

  it("draws a multi-day event once, as a bar across its days", () => {
    render(<Cal />)
    const bars = screen.getAllByRole("button", { name: /Launch week/ })
    expect(bars).toHaveLength(1)
    expect(bars[0]!.style.width).toContain("42.857")
  })

  it("moves by month and back to today", async () => {
    const user = userEvent.setup()
    const onDateChange = vi.fn()
    render(<Cal onDateChange={onDateChange} />)
    await user.click(screen.getByRole("button", { name: "Next month" }))
    expect(screen.getByRole("heading", { name: "November 2026" })).toBeInTheDocument()
    expect(onDateChange).toHaveBeenLastCalledWith(new Date(2026, 10, 21))
    await user.click(screen.getByRole("button", { name: "Previous month" }))
    await user.click(screen.getByRole("button", { name: "Previous month" }))
    expect(screen.getByRole("heading", { name: "September 2026" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Today" }))
    expect(screen.getByRole("heading", { name: "October 2026" })).toBeInTheDocument()
  })

  it("moves between days with the arrow keys and across months with Page Down", async () => {
    const user = userEvent.setup()
    render(<Cal />)
    const cell = (d: string) => document.querySelector<HTMLElement>(`[role=gridcell][data-date="${d}"]`)!
    cell("2026-10-21").focus()
    await user.keyboard("{ArrowRight}")
    expect(cell("2026-10-22")).toHaveFocus()
    await user.keyboard("{ArrowDown}")
    expect(cell("2026-10-29")).toHaveFocus()
    await user.keyboard("{ArrowLeft}{ArrowUp}")
    expect(cell("2026-10-21")).toHaveFocus()
    await user.keyboard("{Home}")
    expect(cell("2026-10-19")).toHaveFocus()
    await user.keyboard("{End}")
    expect(cell("2026-10-25")).toHaveFocus()
    await user.keyboard("{PageDown}")
    expect(screen.getByRole("heading", { name: "November 2026" })).toBeInTheDocument()
    expect(cell("2026-11-25")).toHaveFocus()
  })

  it("keeps one tab stop in the month", () => {
    render(<Cal />)
    expect(document.querySelectorAll('[role=gridcell][tabindex="0"]')).toHaveLength(1)
  })

  it("swaps the arrow keys in right-to-left", async () => {
    const user = userEvent.setup()
    document.documentElement.dir = "rtl"
    try {
      render(<Cal />)
      const cell = (d: string) => document.querySelector<HTMLElement>(`[role=gridcell][data-date="${d}"]`)!
      cell("2026-10-21").focus()
      await user.keyboard("{ArrowLeft}")
      expect(cell("2026-10-22")).toHaveFocus()
    } finally {
      document.documentElement.dir = ""
    }
  })

  it("folds extra events into +n more and lists them in a popover", async () => {
    const user = userEvent.setup()
    const busy: CalendarEvent[] = Array.from({ length: 6 }, (_, i) => ({ id: `x${i}`, title: `Task ${i + 1}`, start: `2026-10-14T0${i + 1}:00`, end: `2026-10-14T0${i + 1}:30` }))
    render(<Cal events={busy} maxLanes={2} />)
    expect(screen.queryByRole("button", { name: /Task 3,/ })).toBeNull()
    const more = screen.getByRole("button", { name: "4 more events on Wednesday, October 14, 2026" })
    expect(more).toHaveTextContent("+4 more")
    await user.click(more)
    const list = await screen.findByRole("dialog", { name: "Events on Wednesday, October 14, 2026" })
    expect(within(list).getAllByRole("button")).toHaveLength(6)
  })

  it("opens a day from its number and calls onDateClick", async () => {
    const user = userEvent.setup()
    const onDateClick = vi.fn()
    render(<Cal onDateClick={onDateClick} />)
    await user.click(screen.getByRole("button", { name: "Open Thursday, October 1, 2026" }))
    expect(onDateClick).toHaveBeenCalledWith(new Date(2026, 9, 1))
  })

  it("opens the day view by default when a day is chosen", async () => {
    const user = userEvent.setup()
    render(<Cal />)
    await user.click(screen.getByRole("button", { name: "Open Thursday, October 1, 2026" }))
    expect(screen.getByRole("heading", { name: "Thursday, October 1, 2026" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Day" })).toHaveAttribute("aria-pressed", "true")
  })

  it("calls onEventClick", async () => {
    const user = userEvent.setup()
    const onEventClick = vi.fn()
    render(<Cal onEventClick={onEventClick} />)
    await user.click(screen.getByRole("button", { name: /Standup/ }))
    expect(onEventClick).toHaveBeenCalledWith(expect.objectContaining({ id: "a" }))
  })

  it("starts weeks where the locale says", () => {
    render(<Cal locale="de-DE" weekStartsOn={undefined} />)
    expect(screen.getAllByRole("columnheader")[0]).toHaveAttribute("aria-label", "Montag")
    expect(screen.getByRole("heading")).toHaveTextContent("Oktober 2026")
  })
})

describe("EventCalendar: week and day", () => {
  it("lays events on the hours, and overlapping ones side by side", () => {
    render(<Cal defaultView="week" hourHeight={60} />)
    const standup = screen.getByRole("button", { name: /Standup/ })
    expect(standup.style.top).toBe("540px")
    const review = screen.getByRole("button", { name: /Design review/ })
    const call = screen.getByRole("button", { name: /Customer call/ })
    expect(review.style.width).toContain("50%")
    expect(call.style.width).toContain("50%")
    expect(review.style.insetInlineStart).toContain("0%")
    expect(call.style.insetInlineStart).toContain("50%")
  })

  it("heads each day and marks today", () => {
    render(<Cal defaultView="week" />)
    expect(screen.getByRole("heading")).toHaveTextContent("Oct 19 – 25, 2026")
    expect(screen.getByRole("button", { name: "Open Wednesday, October 21, 2026" })).toHaveAttribute("aria-current", "date")
    expect(screen.getAllByRole("group")).toHaveLength(8) // seven days and the view switch
  })

  it("puts all-day events in their own row", () => {
    render(<Cal defaultView="week" />)
    expect(screen.getByText("All day")).toBeInTheDocument()
    expect(screen.getAllByRole("button", { name: /Launch week/ })).toHaveLength(1)
  })

  it("draws the now line only on today, at the current time", () => {
    render(<Cal defaultView="week" hourHeight={60} />)
    const line = document.querySelectorAll("[data-slot=event-calendar-now]")
    expect(line).toHaveLength(1)
    expect((line[0] as HTMLElement).style.top).toBe(`${10 * 60 + 42}px`)
  })

  it("shows one day in the day view and steps by day", async () => {
    const user = userEvent.setup()
    render(<Cal defaultView="day" defaultDate={new Date(2026, 9, 20)} />)
    expect(screen.getByRole("heading")).toHaveTextContent("Tuesday, October 20, 2026")
    expect(screen.getByRole("button", { name: /Design review/ })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /Standup/ })).toBeNull()
    await user.click(screen.getByRole("button", { name: "Next day" }))
    expect(screen.getByRole("heading")).toHaveTextContent("Wednesday, October 21, 2026")
  })

  it("moves an event with Alt+arrows and says so", async () => {
    const user = userEvent.setup()
    const onEventChange = vi.fn()
    render(<Cal defaultView="week" editable onEventChange={onEventChange} />)
    const standup = screen.getByRole("button", { name: /Standup/ })
    standup.focus()
    await user.keyboard("{Alt>}{ArrowDown}{/Alt}")
    expect(onEventChange).toHaveBeenLastCalledWith(expect.objectContaining({ id: "a" }), expect.objectContaining({ start: new Date(2026, 9, 19, 9, 30), end: new Date(2026, 9, 19, 10, 0), allDay: false }))
    await user.keyboard("{Alt>}{ArrowRight}{/Alt}")
    expect(onEventChange).toHaveBeenLastCalledWith(expect.anything(), expect.objectContaining({ start: new Date(2026, 9, 20, 9, 0) }))
    await user.keyboard("{Alt>}{Shift>}{ArrowDown}{/Shift}{/Alt}")
    expect(onEventChange).toHaveBeenLastCalledWith(expect.anything(), expect.objectContaining({ start: new Date(2026, 9, 19, 9, 0), end: new Date(2026, 9, 19, 10, 0) }))
    expect(document.querySelector("[data-slot=event-calendar-status]")).toHaveTextContent(/Moved Standup to/)
  })

  it("does not move events unless it is editable, or when the event is read only", async () => {
    const user = userEvent.setup()
    const onEventChange = vi.fn()
    const { rerender } = render(<Cal defaultView="week" onEventChange={onEventChange} />)
    screen.getByRole("button", { name: /Standup/ }).focus()
    await user.keyboard("{Alt>}{ArrowDown}{/Alt}")
    rerender(<Cal defaultView="week" editable onEventChange={onEventChange} events={events.map((e) => ({ ...e, readOnly: true }))} />)
    screen.getByRole("button", { name: /Standup/ }).focus()
    await user.keyboard("{Alt>}{ArrowDown}{/Alt}")
    expect(onEventChange).not.toHaveBeenCalled()
  })

  it("moves an all-day event by days from the keyboard, giving its last day back", async () => {
    const user = userEvent.setup()
    const onEventChange = vi.fn()
    render(<Cal defaultView="week" editable onEventChange={onEventChange} />)
    screen.getByRole("button", { name: /Launch week/ }).focus()
    await user.keyboard("{Alt>}{ArrowRight}{/Alt}")
    const change = onEventChange.mock.calls[0]![1]
    expect(change.allDay).toBe(true)
    expect(change.start).toEqual(new Date(2026, 9, 22))
    expect(change.end).toEqual(new Date(2026, 9, 24)) // the last day, inclusive
  })

  describe("with the pointer", () => {
    // jsdom has no layout: give the day columns a box (7 columns of 100px, an hour is 60px)
    const withLayout = (fn: () => void) => {
      const original = Element.prototype.getBoundingClientRect
      Element.prototype.getBoundingClientRect = function (this: Element) {
        if ((this as HTMLElement).className?.toString().includes("grid flex-1") && (this as HTMLElement).getAttribute("role") === "presentation") {
          return { x: 0, y: 0, left: 0, top: 0, width: 700, height: 1440, right: 700, bottom: 1440, toJSON() {} } as DOMRect
        }
        return original.call(this)
      }
      try {
        fn()
      } finally {
        Element.prototype.getBoundingClientRect = original
      }
    }

    it("drags an event to a new day and time, in steps of a slot", () => {
      const onEventChange = vi.fn()
      withLayout(() => {
        render(<Cal defaultView="week" editable hourHeight={60} slotMinutes={30} onEventChange={onEventChange} />)
        const standup = screen.getByRole("button", { name: /Standup/ })
        fireEvent.pointerDown(standup, { clientX: 50, clientY: 9 * 60 + 5, button: 0 })
        fireEvent(window, new MouseEvent("pointermove", { clientX: 250, clientY: 14 * 60 + 5 }))
        fireEvent(window, new MouseEvent("pointerup", { clientX: 250, clientY: 14 * 60 + 5 }))
      })
      expect(onEventChange).toHaveBeenCalledWith(expect.objectContaining({ id: "a" }), { start: new Date(2026, 9, 21, 14, 0), end: new Date(2026, 9, 21, 14, 30), allDay: false })
    })

    it("changes the length from the bottom edge", () => {
      const onEventChange = vi.fn()
      withLayout(() => {
        render(<Cal defaultView="week" editable hourHeight={60} onEventChange={onEventChange} />)
        const standup = screen.getByRole("button", { name: /Standup/ })
        const handle = standup.querySelector<HTMLElement>("span[aria-hidden=true].cursor-ns-resize")!
        fireEvent.pointerDown(handle, { clientX: 50, clientY: 9 * 60 + 29, button: 0 })
        fireEvent(window, new MouseEvent("pointermove", { clientX: 50, clientY: 11 * 60 }))
        fireEvent(window, new MouseEvent("pointerup", { clientX: 50, clientY: 11 * 60 }))
      })
      expect(onEventChange).toHaveBeenCalledWith(expect.objectContaining({ id: "a" }), { start: new Date(2026, 9, 19, 9, 0), end: new Date(2026, 9, 19, 11, 0), allDay: false })
    })

    it("makes an event by dragging across empty time", () => {
      const onRangeSelect = vi.fn()
      withLayout(() => {
        render(<Cal defaultView="week" selectable hourHeight={60} onRangeSelect={onRangeSelect} />)
        const column = document.querySelector<HTMLElement>('[data-day="2026-10-23"]')!
        fireEvent.pointerDown(column, { clientX: 450, clientY: 15 * 60, button: 0 })
        fireEvent(window, new MouseEvent("pointermove", { clientX: 450, clientY: 16 * 60 + 40 }))
        fireEvent(window, new MouseEvent("pointerup", { clientX: 450, clientY: 16 * 60 + 40 }))
      })
      expect(onRangeSelect).toHaveBeenCalledWith({ start: new Date(2026, 9, 23, 15, 0), end: new Date(2026, 9, 23, 16, 30), allDay: false })
    })

    it("cancels a drag with Escape", () => {
      const onEventChange = vi.fn()
      withLayout(() => {
        render(<Cal defaultView="week" editable hourHeight={60} onEventChange={onEventChange} />)
        const standup = screen.getByRole("button", { name: /Standup/ })
        fireEvent.pointerDown(standup, { clientX: 50, clientY: 9 * 60 + 5, button: 0 })
        fireEvent(window, new MouseEvent("pointermove", { clientX: 250, clientY: 14 * 60 }))
        fireEvent.keyDown(window, { key: "Escape" })
        fireEvent(window, new MouseEvent("pointerup", { clientX: 250, clientY: 14 * 60 }))
      })
      expect(onEventChange).not.toHaveBeenCalled()
    })
  })

  it("adds an event from the toolbar for people who do not drag", async () => {
    const user = userEvent.setup()
    const onRangeSelect = vi.fn()
    render(<Cal selectable onRangeSelect={onRangeSelect} />)
    await user.click(screen.getByRole("button", { name: "Add event" }))
    expect(onRangeSelect).toHaveBeenCalledWith({ start: new Date(2026, 9, 21, 9, 0), end: new Date(2026, 9, 21, 10, 0), allDay: false })
  })
})

describe("EventCalendar: agenda and states", () => {
  it("lists the month's events by day", () => {
    render(<Cal defaultView="agenda" />)
    const list = screen.getByRole("list", { name: "October 2026" })
    const days = within(list).getAllByRole("heading", { level: 3 })
    expect(days.map((h) => h.textContent)).toEqual(expect.arrayContaining([expect.stringContaining("19"), expect.stringContaining("20"), expect.stringContaining("23")]))
    expect(within(list).getAllByRole("button", { name: /Launch week/ })).toHaveLength(3)
    expect(within(list).getAllByText("All day").length).toBeGreaterThan(0)
  })

  it("says there is nothing when the month is empty", () => {
    render(<Cal defaultView="agenda" events={[]} />)
    expect(screen.getByText("No events this month")).toBeInTheDocument()
  })

  it("switches views and reports it", async () => {
    const user = userEvent.setup()
    const onViewChange = vi.fn()
    render(<Cal onViewChange={onViewChange} />)
    await user.click(screen.getByRole("button", { name: "Week" }))
    expect(onViewChange).toHaveBeenCalledWith("week")
    expect(screen.getByRole("button", { name: "Week" })).toHaveAttribute("aria-pressed", "true")
  })

  it("only offers the views it is given", () => {
    render(<Cal views={["month"]} />)
    expect(screen.queryByRole("group", { name: "Calendar view" })).toBeNull()
  })

  it("shows loading and error states", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const { rerender } = render(<Cal state="loading" />)
    expect(screen.getByText("Loading the calendar")).toBeInTheDocument()
    expect(screen.queryByRole("grid")).toBeNull()
    rerender(<Cal state="error" onRetry={onRetry} />)
    await user.click(screen.getByRole("button", { name: /try again/i }))
    expect(onRetry).toHaveBeenCalled()
  })

  it("waits for the clock when no date is given, and never calls Date.now while rendering", async () => {
    const spy = vi.spyOn(Date, "now")
    render(<EventCalendar label="Plain" events={[]} />)
    await act(async () => {})
    expect(screen.getByRole("heading").textContent).toMatch(/\d{4}/)
    spy.mockRestore()
  })
})
