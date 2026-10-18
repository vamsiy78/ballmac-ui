import * as React from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { Timesheet1 } from "@/components/ballmac/blocks/timesheet-1/timesheet-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

const one = [{ id: "p1", name: "Alpha", entries: { "2026-10-12": 240 } as Record<string, number> }]
const cell = (n = "Alpha", d = "Mon 12 Oct") => screen.getByRole("textbox", { name: `${n}, ${d}` })

describe("Timesheet1", () => {
  it("works out row, day and week totals from minutes", () => {
    render(<Timesheet1 projects={[{ id: "a", name: "Alpha", entries: { "2026-10-12": 90, "2026-10-13": 60 } }, { id: "b", name: "Beta", entries: { "2026-10-12": 30 } }]} locale="en-GB" />)
    expect(within(screen.getByText("Alpha").closest("tr")!).getAllByText("2:30")).toHaveLength(1)
    const foot = screen.getByText("Day total").closest("tr")!
    expect(within(foot).getByText("2:00")).toBeInTheDocument()
    expect(within(foot).getByText("1:00")).toBeInTheDocument()
    expect(within(foot).getByText("3:00")).toBeInTheDocument()
  })

  it("accepts time typed the way people say it", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Timesheet1 projects={one} locale="en-GB" onChange={onChange} />)
    for (const [typed, minutes] of [["1.5", 90], ["1:30", 90], ["90m", 90], ["2h", 120], ["1,5", 90]] as const) {
      await user.clear(cell("Alpha", "Tue 13 Oct"))
      await user.type(cell("Alpha", "Tue 13 Oct"), `${typed}{Enter}`)
      expect(onChange).toHaveBeenLastCalledWith("p1", "2026-10-13", minutes)
    }
  })

  it("says what to type when the time cannot be read", async () => {
    const user = userEvent.setup()
    render(<Timesheet1 projects={one} locale="en-GB" />)
    await user.type(cell("Alpha", "Tue 13 Oct"), "lots{Enter}")
    expect(screen.getByRole("alert")).toHaveTextContent("Type time like 1.5, 1:30 or 90m.")
  })

  it("refuses more than 24 hours in a day, counting other projects", async () => {
    const user = userEvent.setup()
    render(<Timesheet1 projects={[{ id: "a", name: "Alpha", entries: { "2026-10-12": 20 * 60 } }, { id: "b", name: "Beta", entries: {} }]} locale="en-GB" />)
    await user.type(cell("Beta"), "6{Enter}")
    expect(screen.getByRole("alert")).toHaveTextContent("A day has 24 hours")
    expect(cell("Beta")).toHaveValue("")
  })

  it("says in words when a weekday runs over a full day", () => {
    render(<Timesheet1 projects={[{ id: "a", name: "Alpha", entries: { "2026-10-12": 9 * 60 + 15 } }]} locale="en-GB" dayTarget={8} />)
    expect(screen.getByText("+1:15 over")).toBeInTheDocument()
  })

  it("pages through weeks and keeps each week's own hours", async () => {
    const user = userEvent.setup()
    render(<Timesheet1 projects={[{ id: "a", name: "Alpha", entries: { "2026-10-12": 120, "2026-10-19": 300 } }]} locale="en-GB" />)
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("12 Oct to 18 Oct")
    await user.click(screen.getByRole("button", { name: "Next week" }))
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("19 Oct to 25 Oct")
    expect(cell("Alpha", "Mon 19 Oct")).toHaveValue("5:00")
  })

  it("adds and removes a project row", async () => {
    const user = userEvent.setup()
    render(<Timesheet1 projects={one} locale="en-GB" />)
    await user.click(screen.getByRole("combobox", { name: "Add a project" }))
    await user.click(await screen.findByRole("option", { name: "Training" }))
    expect(screen.getByRole("rowheader", { name: /Training/ })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Remove Training" }))
    expect(screen.queryByRole("rowheader", { name: /Training/ })).toBeNull()
  })

  it("submits the week, locks it, and says so", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<Timesheet1 projects={one} locale="en-GB" onSubmit={onSubmit} />)
    await user.click(screen.getByRole("button", { name: "Submit week" }))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ weekStart: "2026-10-12", minutes: 240 }))
    expect(await screen.findByText("This week is submitted and locked.")).toBeInTheDocument()
    expect(cell()).toBeDisabled()
  })

  it("keeps the week open and says why when submitting fails", async () => {
    const user = userEvent.setup()
    render(<Timesheet1 projects={one} locale="en-GB" onSubmit={() => Promise.reject(new Error("Your manager has closed this period."))} />)
    await user.click(screen.getByRole("button", { name: "Submit week" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("Your manager has closed this period.")
    expect(cell()).toBeEnabled()
  })

  it("shows loading, empty and error states", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const { rerender } = render(<Timesheet1 state="loading" />)
    expect(screen.getByRole("status")).toBeInTheDocument()
    rerender(<Timesheet1 state="empty" />)
    expect(screen.getByRole("heading", { name: "No projects on this timesheet" })).toBeInTheDocument()
    rerender(<Timesheet1 state="error" onRetry={onRetry} />)
    await user.click(screen.getByRole("button", { name: /try again/i }))
    expect(onRetry).toHaveBeenCalled()
  })
})
