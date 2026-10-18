import { describe, expect, it } from "vitest"

import {
  addDays,
  format,
  formatRange,
  addMonths,
  daysBetween,
  layoutDay,
  layoutWeek,
  monthGrid,
  snap,
  spanOf,
  startOfWeek,
  toDate,
  touchesDay,
  weekDays,
  weekStartFor,
} from "@/lib/ballmac/calendar-dates"

const d = (s: string) => toDate(s)

describe("toDate", () => {
  it("reads a bare day as local midnight, not UTC", () => {
    const x = d("2026-10-20")
    expect([x.getFullYear(), x.getMonth(), x.getDate(), x.getHours()]).toEqual([2026, 9, 20, 0])
  })
  it("reads a moment as written, and copies a Date", () => {
    expect(d("2026-10-20T09:30").getHours()).toBe(9)
    const a = new Date(2026, 0, 1)
    expect(toDate(a)).not.toBe(a)
    expect(toDate(a).getTime()).toBe(a.getTime())
  })
})

describe("day and month math", () => {
  it("adds months without spilling into the next one", () => {
    expect(addMonths(d("2026-01-31"), 1).getDate()).toBe(28)
    expect(addMonths(d("2028-01-31"), 1).getDate()).toBe(29)
    expect(addMonths(d("2026-12-15"), 1).getFullYear()).toBe(2027)
    expect(addMonths(d("2026-03-31"), -1).getDate()).toBe(28)
  })
  it("counts days by the calendar across a daylight-saving change", () => {
    expect(daysBetween(d("2026-03-07"), d("2026-03-09"))).toBe(2)
    expect(daysBetween(d("2026-10-31"), d("2026-11-02"))).toBe(2)
  })
  it("finds the start of a week for either convention", () => {
    expect(startOfWeek(d("2026-10-21"), 1).getDate()).toBe(19) // a Wednesday; Monday the 19th
    expect(startOfWeek(d("2026-10-21"), 0).getDate()).toBe(18) // Sunday the 18th
    expect(startOfWeek(d("2026-10-18"), 1).getDate()).toBe(12) // a Sunday belongs to the week before when weeks start on Monday
  })
  it("lists seven days", () => {
    const days = weekDays(d("2026-10-21"), 1)
    expect(days).toHaveLength(7)
    expect(days[0]!.getDay()).toBe(1)
    expect(days[6]!.getDay()).toBe(0)
  })
  it("builds a month as whole weeks", () => {
    const grid = monthGrid(d("2026-10-15"), 0)
    expect(grid.every((w) => w.length === 7)).toBe(true)
    expect(grid[0]![0]!.getDay()).toBe(0)
    expect(grid.flat().some((x) => x.getMonth() === 9 && x.getDate() === 1)).toBe(true)
    expect(grid.flat().some((x) => x.getMonth() === 9 && x.getDate() === 31)).toBe(true)
    // February 2026 starts on a Sunday and has 28 days: four Sunday weeks, but five Monday weeks
    expect(monthGrid(d("2026-02-10"), 0)).toHaveLength(4)
    expect(monthGrid(d("2026-02-10"), 1)).toHaveLength(5)
  })
  it("knows where weeks start in a few locales", () => {
    expect(weekStartFor("en-US")).toBe(0)
    expect(weekStartFor("de-DE")).toBe(1)
    expect(weekStartFor("ar-SA")).toBe(0)
    expect(weekStartFor("not a locale")).toBe(0)
  })
  it("rounds to the nearest slot", () => {
    expect(snap(37, 15)).toBe(30)
    expect(snap(38, 15)).toBe(45)
    expect(snap(7, 30)).toBe(0)
  })
})

describe("spanOf", () => {
  it("runs an all-day event to the end of its last day", () => {
    const s = spanOf({ id: "a", start: "2026-10-20", end: "2026-10-22", allDay: true })
    expect(s.allDay).toBe(true)
    expect(s.end).toEqual(d("2026-10-23"))
  })
  it("gives a one-day all-day event a day, and a timed event with no end an hour", () => {
    expect(spanOf({ id: "a", start: "2026-10-20", allDay: true }).end).toEqual(d("2026-10-21"))
    const t = spanOf({ id: "b", start: "2026-10-20T09:00" })
    expect(t.end.getTime() - t.start.getTime()).toBe(3_600_000)
  })
  it("never lets an event end before it starts", () => {
    const s = spanOf({ id: "c", start: "2026-10-20T09:00", end: "2026-10-20T08:00" })
    expect(s.end > s.start).toBe(true)
  })
  it("says whether an event touches a day", () => {
    const s = spanOf({ id: "d", start: "2026-10-20T22:00", end: "2026-10-21T02:00" })
    expect(touchesDay(s, d("2026-10-20"))).toBe(true)
    expect(touchesDay(s, d("2026-10-21"))).toBe(true)
    expect(touchesDay(s, d("2026-10-22"))).toBe(false)
  })
})

describe("layoutDay", () => {
  const spans = (list: [string, string, string][]) => list.map(([id, a, b]) => spanOf({ id, start: a, end: b }))
  const day = d("2026-10-20")
  it("puts events that do not overlap in one full-width column", () => {
    const out = layoutDay(spans([["a", "2026-10-20T09:00", "2026-10-20T10:00"], ["b", "2026-10-20T10:00", "2026-10-20T11:00"]]), day)
    expect(out.map((p) => [p.column, p.columns])).toEqual([[0, 1], [0, 1]])
    expect(out[0]!.top).toBe(540)
    expect(out[0]!.height).toBe(60)
  })
  it("sets overlapping events side by side", () => {
    const out = layoutDay(spans([["a", "2026-10-20T09:00", "2026-10-20T11:00"], ["b", "2026-10-20T10:00", "2026-10-20T12:00"], ["c", "2026-10-20T10:30", "2026-10-20T11:30"]]), day)
    expect(out.map((p) => p.span.event.id)).toEqual(["a", "b", "c"])
    expect(out.map((p) => p.column)).toEqual([0, 1, 2])
    expect(out.every((p) => p.columns === 3)).toBe(true)
  })
  it("reuses a column once its event is over", () => {
    const out = layoutDay(spans([["a", "2026-10-20T09:00", "2026-10-20T10:00"], ["b", "2026-10-20T09:30", "2026-10-20T11:00"], ["c", "2026-10-20T10:00", "2026-10-20T10:30"]]), day)
    expect(out.find((p) => p.span.event.id === "c")!.column).toBe(0)
    expect(out.every((p) => p.columns === 2)).toBe(true)
  })
  it("clips an event that runs past midnight and keeps a minimum height", () => {
    const out = layoutDay(spans([["a", "2026-10-20T23:00", "2026-10-21T02:00"], ["b", "2026-10-20T12:00", "2026-10-20T12:05"]]), day)
    const a = out.find((p) => p.span.event.id === "a")!
    expect(a.top + a.height).toBe(1440)
    expect(out.find((p) => p.span.event.id === "b")!.height).toBe(20)
  })
  it("leaves out all-day events and other days", () => {
    const out = layoutDay([spanOf({ id: "x", start: "2026-10-20", allDay: true }), spanOf({ id: "y", start: "2026-10-21T09:00" })], day)
    expect(out).toHaveLength(0)
  })
})

describe("layoutWeek", () => {
  const days = weekDays(d("2026-10-21"), 1) // Mon 19 – Sun 25
  it("makes a bar across the days an event covers", () => {
    const segs = layoutWeek([spanOf({ id: "a", start: "2026-10-20", end: "2026-10-22", allDay: true })], days)
    expect(segs).toHaveLength(1)
    expect([segs[0]!.from, segs[0]!.to, segs[0]!.lane]).toEqual([1, 3, 0])
    expect([segs[0]!.startsHere, segs[0]!.endsHere]).toEqual([true, true])
  })
  it("marks a bar that continues from the week before and into the next", () => {
    const segs = layoutWeek([spanOf({ id: "a", start: "2026-10-15", end: "2026-10-30", allDay: true })], days)
    expect([segs[0]!.from, segs[0]!.to]).toEqual([0, 6])
    expect([segs[0]!.startsHere, segs[0]!.endsHere]).toEqual([false, false])
  })
  it("stacks bars that overlap into lanes and shares a lane when they do not", () => {
    const segs = layoutWeek(
      [
        spanOf({ id: "a", start: "2026-10-19", end: "2026-10-21", allDay: true }),
        spanOf({ id: "b", start: "2026-10-20", end: "2026-10-20", allDay: true }),
        spanOf({ id: "c", start: "2026-10-22", end: "2026-10-23", allDay: true }),
      ],
      days
    )
    const lane = (id: string) => segs.find((s) => s.span.event.id === id)!.lane
    expect(lane("a")).toBe(0)
    expect(lane("b")).toBe(1)
    expect(lane("c")).toBe(0)
  })
  it("ignores an event outside the week, and an event that ends at midnight does not take the next day", () => {
    expect(layoutWeek([spanOf({ id: "a", start: "2026-11-02", allDay: true })], days)).toHaveLength(0)
    const segs = layoutWeek([spanOf({ id: "b", start: "2026-10-19T20:00", end: "2026-10-20T00:00" })], days)
    expect([segs[0]!.from, segs[0]!.to]).toEqual([0, 0])
  })
})

describe("addDays", () => {
  it("keeps the time of day across a daylight-saving change", () => {
    const x = addDays(new Date(2026, 2, 7, 9, 0), 2)
    expect([x.getDate(), x.getHours()]).toEqual([9, 9])
  })
})

describe("formatting", () => {
  it("writes plain spaces, so a server and a browser agree", () => {
    const text = format(new Date(2026, 9, 21, 9, 30), "en-US", { hour: "numeric", minute: "2-digit" })
    expect(text).toBe("9:30 AM")
    expect(text).not.toMatch(/[\u202f\u2009\u00a0]/)
    const range = formatRange(new Date(2026, 9, 19), new Date(2026, 9, 25), "en-US", { month: "short", day: "numeric", year: "numeric" })
    expect(range).toBe("Oct 19 – 25, 2026")
  })
})
