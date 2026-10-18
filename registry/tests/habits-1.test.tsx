import * as React from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { Habits1, type Habits1Habit } from "@/components/ballmac/blocks/habits-1/habits-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

// 2026-10-18 is a Sunday, so this week is Monday 12 to Sunday 18.
const H = (done: string[], target = 5): Habits1Habit => ({ id: "h", name: "Read", target, done })
const day = (label: string) => screen.getByRole("checkbox", { name: new RegExp(`^Read, ${label}`) })

describe("Habits1", () => {
  it("counts the streak back from today", () => {
    render(<Habits1 habits={[H(["2026-10-18", "2026-10-17", "2026-10-16", "2026-10-13"])]} today="2026-10-18" locale="en" />)
    expect(screen.getByText(/3 days/)).toBeInTheDocument()
    expect(screen.getByText("Best 3")).toBeInTheDocument()
  })

  it("keeps a streak alive until today is over, but not past a missed day", () => {
    const { rerender } = render(<Habits1 habits={[H(["2026-10-17", "2026-10-16"])]} today="2026-10-18" />)
    expect(screen.getByText(/2 days/)).toBeInTheDocument()
    rerender(<Habits1 habits={[H(["2026-10-16", "2026-10-15"])]} today="2026-10-18" />)
    expect(screen.getByText(/0 days/)).toBeInTheDocument()
    expect(screen.getByText("Best 2")).toBeInTheDocument()
  })

  it("compares this week with the goal in words", () => {
    render(<Habits1 habits={[H(["2026-10-12", "2026-10-13", "2026-10-14", "2026-10-15", "2026-10-16"], 5)]} today="2026-10-18" />)
    expect(screen.getByText("5 of 5 this week, goal reached")).toBeInTheDocument()
  })

  it("names every day with the habit and the full date, and says which is today", () => {
    render(<Habits1 habits={[H([])]} today="2026-10-18" locale="en" />)
    expect(day("Sunday, October 18, today")).toBeInTheDocument()
    expect(day("Monday, October 12")).toHaveAttribute("aria-checked", "false")
  })

  it("ticks a day at once, updates the streak, and tells the host", async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn().mockResolvedValue(undefined)
    render(<Habits1 habits={[H([])]} today="2026-10-18" locale="en" onToggle={onToggle} />)
    await user.click(day("Sunday, October 18"))
    expect(onToggle).toHaveBeenCalledWith("h", "2026-10-18", true)
    expect(day("Sunday, October 18")).toHaveAttribute("aria-checked", "true")
    expect(screen.getByText(/1 day/)).toBeInTheDocument()
    expect(screen.getByText("1/1")).toBeInTheDocument()
  })

  it("puts a tick back and says why when saving fails", async () => {
    const user = userEvent.setup()
    render(<Habits1 habits={[H([])]} today="2026-10-18" locale="en" onToggle={() => Promise.reject(new Error("You are offline."))} />)
    await user.click(day("Sunday, October 18"))
    expect(await screen.findByRole("alert")).toHaveTextContent("You are offline.")
    expect(day("Sunday, October 18")).toHaveAttribute("aria-checked", "false")
  })

  it("counts what is done today in the ring and says so", () => {
    render(
      <Habits1
        habits={[{ id: "a", name: "A", target: 5, done: ["2026-10-18"] }, { id: "b", name: "B", target: 5, done: [] }]}
        today="2026-10-18"
      />
    )
    expect(screen.getByText("1/2")).toBeInTheDocument()
    expect(screen.getByText("1 to go today")).toBeInTheDocument()
  })

  it("adds a habit with its weekly goal", async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn().mockResolvedValue(undefined)
    render(<Habits1 habits={[H([])]} today="2026-10-18" onAdd={onAdd} />)
    await user.type(screen.getByLabelText("New habit"), "Stretch")
    await user.selectOptions(screen.getByLabelText("Days a week"), "3")
    await user.click(screen.getByRole("button", { name: "Add habit" }))
    expect(onAdd).toHaveBeenCalledWith({ name: "Stretch", target: 3 })
    expect(screen.getByRole("heading", { name: "Stretch" })).toBeInTheDocument()
  })

  it("shows loading, empty and error states", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const { rerender } = render(<Habits1 state="loading" />)
    expect(screen.getByRole("status")).toBeInTheDocument()
    rerender(<Habits1 state="empty" />)
    expect(screen.getByRole("heading", { name: "No habits yet" })).toBeInTheDocument()
    rerender(<Habits1 state="error" onRetry={onRetry} />)
    await user.click(screen.getByRole("button", { name: /try again/i }))
    expect(onRetry).toHaveBeenCalled()
  })
})
