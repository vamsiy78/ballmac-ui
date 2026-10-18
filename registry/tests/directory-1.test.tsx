import * as React from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { Directory1 } from "@/components/ballmac/blocks/directory-1/directory-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

const card = (name: string) => screen.getByRole("button", { name: new RegExp(name) }).closest("article")!

describe("Directory1", () => {
  it("shows each person's local time worked out from the moment passed in", () => {
    render(<Directory1 now="2026-10-18T10:42:00Z" locale="en-GB" />)
    // Osaka is UTC+9, New York UTC-4, Accra UTC+0.
    expect(within(card("Theo Nakamura")).getByText(/19:42/)).toBeInTheDocument()
    expect(within(card("Jordan Lee")).getByText(/06:42/)).toBeInTheDocument()
    expect(within(card("Kofi Mensah")).getByText(/10:42/)).toBeInTheDocument()
  })

  it("marks someone in the middle of their night, in words", () => {
    render(<Directory1 now="2026-10-18T10:42:00Z" locale="en-GB" />)
    expect(within(card("Jordan Lee")).getByText(/probably offline/)).toBeInTheDocument()
    expect(within(card("Priya Shah")).queryByText(/probably offline/)).toBeNull()
  })

  it("says availability as a word", () => {
    render(<Directory1 />)
    expect(within(card("Kofi Mensah")).getByText("Out of office")).toBeInTheDocument()
    expect(within(card("Priya Shah")).getByText("Available")).toBeInTheDocument()
  })

  it("filters by department with counts that follow the search, and announces the number", async () => {
    const user = userEvent.setup()
    render(<Directory1 />)
    expect(screen.getByText("14 people")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /^Design/ }))
    expect(screen.getByRole("button", { name: /^Design/ })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByText("3 people match")).toBeInTheDocument()
    await user.type(screen.getByRole("searchbox", { name: "Search people" }), "lead")
    expect(screen.getByText("1 person match")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /^Everyone 3$/ })).toBeInTheDocument()
  })

  it("finds people by city", async () => {
    const user = userEvent.setup()
    render(<Directory1 />)
    await user.type(screen.getByRole("searchbox", { name: "Search people" }), "tokyo")
    expect(screen.getByRole("button", { name: /Yuki Tanaka/ })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /Priya Shah/ })).toBeNull()
  })

  it("says nobody matches and clears the filters", async () => {
    const user = userEvent.setup()
    render(<Directory1 />)
    await user.type(screen.getByRole("searchbox", { name: "Search people" }), "zzzz")
    expect(screen.getByText("Nobody matches")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Clear filters" }))
    expect(screen.getByText("14 people")).toBeInTheDocument()
  })

  it("switches to a list that keeps the same people", async () => {
    const user = userEvent.setup()
    render(<Directory1 />)
    await user.click(screen.getByRole("radio", { name: "List" }))
    expect(screen.queryAllByRole("article")).toHaveLength(0)
    expect(screen.getAllByRole("listitem").length).toBeGreaterThanOrEqual(14)
    expect(screen.getByRole("button", { name: /Priya Shah/ })).toBeInTheDocument()
  })

  it("tells the host who was chosen, and offers an email link per person", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<Directory1 onSelect={onSelect} />)
    await user.click(screen.getByRole("button", { name: /Noor Haddad/ }))
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "6" }))
    expect(screen.getByRole("link", { name: "Email Noor Haddad" })).toHaveAttribute("href", "mailto:noor@acme.com")
  })

  it("shows loading, empty and error states", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const { rerender } = render(<Directory1 state="loading" />)
    expect(screen.getByRole("status")).toBeInTheDocument()
    rerender(<Directory1 state="empty" />)
    expect(screen.getByRole("heading", { name: "Nobody is listed yet" })).toBeInTheDocument()
    rerender(<Directory1 state="error" onRetry={onRetry} />)
    await user.click(screen.getByRole("button", { name: /try again/i }))
    expect(onRetry).toHaveBeenCalled()
  })
})
