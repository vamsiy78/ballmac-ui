import * as React from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { Locations1 } from "@/components/ballmac/blocks/locations-1/locations-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})


describe("Locations1", () => {
  it("works out open now in each place's own time zone (a Sunday)", () => {
    // 2026-10-18 is a Sunday, 10:42 UTC. The London shop opens every day 10:00 to 19:00 (11:42 there).
    render(<Locations1 now="2026-10-18T10:42:00Z" />)
    expect(within(document.querySelector<HTMLElement>('[data-place="lon"]')!).getByText("Open now · until 19:00")).toBeInTheDocument()
    // Offices keep to Monday to Friday, so on a Sunday they are closed.
    expect(within(document.querySelector<HTMLElement>('[data-place="lis"]')!).getByText("Closed now")).toBeInTheDocument()
  })

  it("says when it opens later the same day", () => {
    // Monday 2026-10-19 05:00 UTC is 06:00 in Lisbon, before the 09:00 opening.
    render(<Locations1 now="2026-10-19T05:00:00Z" />)
    expect(within(document.querySelector<HTMLElement>('[data-place="lis"]')!).getByText("Closed · opens 09:00")).toBeInTheDocument()
  })

  it("uses the local time of the chosen place and its hours", () => {
    render(<Locations1 now="2026-10-19T10:42:00Z" defaultSelectedId="nyc" />)
    const card = screen.getByRole("article")
    expect(within(card).getByText(/06:42 there · 09:00 to 17:30/)).toBeInTheDocument()
    expect(within(card).getByText("Closed · opens 09:00")).toBeInTheDocument()
  })

  it("chooses a place from the list and tells the host", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<Locations1 onSelect={onSelect} />)
    await user.click(document.querySelector<HTMLElement>('[data-place="tyo"]')!)
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "tyo" }))
    expect(within(screen.getByRole("article")).getByRole("heading", { name: "Tokyo shop" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Get directions to Tokyo shop/ })).toHaveAttribute("target", "_blank")
  })

  it("has a pin for every place, as a button", async () => {
    const user = userEvent.setup()
    render(<Locations1 />)
    expect(screen.getAllByRole("button", { name: /, (Lisbon|Tokyo|Sydney)$/ })).toHaveLength(3)
    await user.click(screen.getByRole("button", { name: "Sydney office, Sydney" }))
    expect(within(screen.getByRole("article")).getByRole("heading", { name: "Sydney office" })).toBeInTheDocument()
  })

  it("searches by city and country, filters by type, and clears", async () => {
    const user = userEvent.setup()
    render(<Locations1 />)
    await user.type(screen.getByRole("searchbox", { name: "Search locations" }), "germany")
    expect(screen.getByText("1 place")).toBeInTheDocument()
    await user.clear(screen.getByRole("searchbox", { name: "Search locations" }))
    await user.click(screen.getByRole("button", { name: "Store" }))
    expect(screen.getByText("4 places")).toBeInTheDocument()
    await user.type(screen.getByRole("searchbox", { name: "Search locations" }), "zzzz")
    expect(screen.getByText("Nothing matches")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Clear" }))
    expect(screen.getByText("10 places")).toBeInTheDocument()
  })

  it("shows loading, empty and error states", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const { rerender } = render(<Locations1 state="loading" />)
    expect(screen.getByRole("status")).toBeInTheDocument()
    rerender(<Locations1 state="empty" />)
    expect(screen.getByRole("heading", { name: "No locations yet" })).toBeInTheDocument()
    rerender(<Locations1 state="error" onRetry={onRetry} />)
    await user.click(screen.getByRole("button", { name: /try again/i }))
    expect(onRetry).toHaveBeenCalled()
  })
})
