import * as React from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it } from "vitest"

import { Trip1, type Trip1Item } from "@/components/ballmac/blocks/trip-1/trip-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

const items: Trip1Item[] = [
  { id: "1", kind: "flight", date: "2026-11-06", time: "08:00", title: "Out flight", cost: 200, ref: "AB123" },
  { id: "2", kind: "food", date: "2026-11-06", time: "20:00", title: "Dinner", cost: 80, pending: true },
  { id: "3", kind: "activity", date: "2026-11-07", time: "10:00", title: "Museum", cost: 0 },
]

describe("Trip1", () => {
  it("works out nights, days to go, the total and each traveler's share", () => {
    render(<Trip1 items={items} dates={["2026-11-06", "2026-11-09"]} travelers={["A", "B"]} today="2026-10-18" currency="GBP" locale="en-GB" />)
    expect(screen.getByText(/3 nights/)).toBeInTheDocument()
    expect(screen.getByText("19 days to go")).toBeInTheDocument()
    expect(screen.getByText("£280")).toBeInTheDocument()
    expect(screen.getByText("£140 each for 2")).toBeInTheDocument()
  })

  it("says in words which things are not booked yet", () => {
    render(<Trip1 items={items} />)
    expect(screen.getAllByRole("status").some((n) => /1 thing is not booked yet: Dinner/.test(n.textContent ?? ""))).toBe(true)
    expect(screen.getByText("Not booked yet")).toBeInTheDocument()
  })

  it("groups by day in time order with numbered day headings", () => {
    render(<Trip1 items={items} locale="en-GB" />)
    expect(screen.getByRole("heading", { level: 2, name: /Day 1.*Friday 6 November/ })).toBeInTheDocument()
    expect(screen.getByRole("heading", { level: 2, name: /Day 2.*Saturday 7 November/ })).toBeInTheDocument()
    const day1 = screen.getByRole("heading", { name: /Day 1/ }).closest("li")!
    const titles = within(day1).getAllByText(/Out flight|Dinner/).map((t) => t.textContent)
    expect(titles).toEqual(["Out flight", "Dinner"])
  })

  it("filters by type and hides days with nothing left", async () => {
    const user = userEvent.setup()
    render(<Trip1 items={items} />)
    await user.click(screen.getByRole("button", { name: "Things to do" }))
    expect(screen.getByRole("button", { name: "Things to do" })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByText("Museum")).toBeInTheDocument()
    expect(screen.queryByText("Out flight")).toBeNull()
    expect(screen.queryByRole("heading", { name: /Day 1/ })).toBeNull()
  })

  it("has a copy button for each booking code, named for it", () => {
    render(<Trip1 items={items} />)
    expect(screen.getByRole("button", { name: "Copy booking code AB123" })).toBeInTheDocument()
  })

  it("counts packing progress", async () => {
    const user = userEvent.setup()
    render(<Trip1 items={items} packing={[{ id: "a", label: "Passport" }, { id: "b", label: "Charger", done: true }]} />)
    expect(screen.getByText("1 of 2")).toBeInTheDocument()
    await user.click(screen.getByRole("checkbox", { name: "Passport" }))
    expect(screen.getByText("2 of 2")).toBeInTheDocument()
    expect(screen.getByRole("progressbar", { name: "Packing progress" })).toHaveAttribute("aria-valuenow", "2")
  })

  it("says Free for a zero cost and gives the cost bar a text equivalent", () => {
    render(<Trip1 items={items} currency="GBP" locale="en-GB" />)
    expect(screen.getByText("Free")).toBeInTheDocument()
    expect(screen.getByRole("img", { name: "Cost by type: Flights £200, Food £80" })).toBeInTheDocument()
  })
})
