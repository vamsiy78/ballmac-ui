import * as React from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { Leaderboard1 } from "@/components/ballmac/blocks/leaderboard-1/leaderboard-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

describe("Leaderboard1", () => {
  it("reads the podium in rank order and the rows from fourth place", () => {
    render(<Leaderboard1 />)
    const top = screen.getByRole("list", { name: "Top three" })
    expect(within(top).getByText("Rank 1: Priya Shah, 1,840 pts")).toBeInTheDocument()
    expect(within(top).getByText("Rank 2: Theo Nakamura, 1,710 pts")).toBeInTheDocument()
    expect(within(top).getByText("Rank 3: Mara Ellison, 1,620 pts")).toBeInTheDocument()
    const rows = screen.getByRole("list", { name: "Rankings from fourth place" })
    expect(within(rows).getAllByRole("listitem")[0]).toHaveTextContent("Alex Kim")
  })

  it("re-ranks when the period changes", async () => {
    const user = userEvent.setup()
    const onPeriodChange = vi.fn()
    render(<Leaderboard1 onPeriodChange={onPeriodChange} />)
    await user.click(screen.getByRole("radio", { name: "This month" }))
    expect(onPeriodChange).toHaveBeenCalledWith("month")
    expect(screen.getByText("Rank 1: Theo Nakamura, 6,480 pts")).toBeInTheDocument()
    expect(screen.getByText("Rank 2: Priya Shah, 6,120 pts")).toBeInTheDocument()
  })

  it("says in words which way people moved", () => {
    render(<Leaderboard1 />)
    expect(screen.getByText("Up 4 places")).toBeInTheDocument()
    expect(screen.getByText("Down 2 places")).toBeInTheDocument()
    expect(screen.getAllByText("No change").length).toBeGreaterThan(0)
  })

  it("highlights you, and pins your place when you are beyond the visible rows", () => {
    const { rerender } = render(<Leaderboard1 />)
    expect(screen.getByText("You", { selector: "span" })).toBeInTheDocument()
    expect(screen.queryByText("Your place")).toBeNull()
    rerender(<Leaderboard1 pageSize={3} />)
    expect(screen.getByText("Your place")).toBeInTheDocument()
  })

  it("finds a person and loads more rows", async () => {
    const user = userEvent.setup()
    render(<Leaderboard1 />)
    expect(screen.getByText("Showing 11 of 14")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Show 3 more" }))
    expect(screen.getByText("Amara Okoye")).toBeInTheDocument()
    await user.type(screen.getByRole("searchbox", { name: "Find a person" }), "design")
    const rows = screen.getByRole("list", { name: "Rankings from fourth place" })
    expect(within(rows).getAllByRole("listitem")).toHaveLength(2)
    expect(within(rows).queryByText("Alex Kim")).toBeNull()
  })

  it("makes each row a button when onSelect is given", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<Leaderboard1 onSelect={onSelect} />)
    await user.click(screen.getByRole("button", { name: "Rank 4: Alex Kim" }))
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "p4", rank: 4 }))
  })

  it("shows the empty state", () => {
    render(<Leaderboard1 state="empty" />)
    expect(screen.getByRole("heading", { name: "No scores yet" })).toBeInTheDocument()
  })
})
