import * as React from "react"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { Retention1 } from "@/components/ballmac/blocks/retention-1/retention-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

const cohorts = [
  { id: "a", label: "Cohort A", size: 1000, retention: [100, 60, 40] },
  { id: "b", label: "Cohort B", size: 3000, retention: [100, 80] },
]

describe("Retention1", () => {
  it("weights the average by cohort size and only counts cohorts old enough", () => {
    render(<Retention1 cohorts={cohorts} />)
    const row = screen.getByRole("rowheader", { name: "Average" }).closest("[role=row]")!
    // Period 1: (60*1000 + 80*3000) / 4000 = 75. Period 2 only has cohort A: 40.
    expect(within(row as HTMLElement).getByText("75%")).toBeInTheDocument()
    expect(within(row as HTMLElement).getByText("40%")).toBeInTheDocument()
  })

  it("reads each cell as cohort, period, percent and people", () => {
    render(<Retention1 cohorts={cohorts} />)
    expect(screen.getByRole("gridcell", { name: "Cohort A, week 1: 60% still active, 600 people" })).toBeInTheDocument()
    expect(screen.getByRole("gridcell", { name: "Not yet" })).toBeInTheDocument()
  })

  it("switches between percent and people", async () => {
    const user = userEvent.setup()
    render(<Retention1 cohorts={cohorts} />)
    await user.click(screen.getByRole("radio", { name: "People" }))
    expect(screen.getByRole("gridcell", { name: /Cohort B, week 1/ })).toHaveTextContent("2,400")
  })

  it("moves with the arrow keys and never onto a cell that does not exist yet", async () => {
    const user = userEvent.setup()
    render(<Retention1 cohorts={cohorts} />)
    screen.getByRole("gridcell", { name: /Cohort A, week 1/ }).focus()
    await user.keyboard("{ArrowRight}")
    await waitFor(() => expect(screen.getByRole("gridcell", { name: /Cohort A, week 2/ })).toHaveFocus())
    await user.keyboard("{ArrowDown}")
    await waitFor(() => expect(screen.getByRole("gridcell", { name: /Cohort B, week 1/ })).toHaveFocus())
    await user.keyboard("{ArrowRight}")
    expect(screen.getByRole("gridcell", { name: /Cohort B, week 1/ })).toHaveFocus()
    await user.keyboard("{Home}")
    await waitFor(() => expect(screen.getByRole("gridcell", { name: /Cohort B, week 0/ })).toHaveFocus())
  })

  it("compares the chosen cell with the average in a sentence", async () => {
    const user = userEvent.setup()
    render(<Retention1 cohorts={cohorts} />)
    await user.click(screen.getByRole("gridcell", { name: /Cohort A, week 1/ }))
    expect(screen.getByText(/15 points below the average/)).toBeInTheDocument()
  })

  it("works out the headline numbers", () => {
    render(<Retention1 cohorts={cohorts} />)
    expect(screen.getByText("Week 1 retention").nextElementSibling).toHaveTextContent("75%")
  })

  it("has one tab stop in the grid", () => {
    render(<Retention1 cohorts={cohorts} />)
    expect(screen.getAllByRole("gridcell").filter((c) => c.getAttribute("tabindex") === "0")).toHaveLength(1)
  })

  it("shows loading, empty and error states", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const { rerender } = render(<Retention1 state="loading" />)
    expect(screen.getByRole("status")).toBeInTheDocument()
    rerender(<Retention1 state="empty" />)
    expect(screen.getByRole("heading", { name: "No cohorts yet" })).toBeInTheDocument()
    rerender(<Retention1 state="error" onRetry={onRetry} />)
    await user.click(screen.getByRole("button", { name: /try again/i }))
    expect(onRetry).toHaveBeenCalled()
  })
})
