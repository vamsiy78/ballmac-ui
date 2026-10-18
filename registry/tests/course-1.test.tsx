import * as React from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { Course1 } from "@/components/ballmac/blocks/course-1/course-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

describe("Course1", () => {
  it("works out progress, time left and says it in words", () => {
    render(<Course1 />)
    expect(screen.getByRole("progressbar", { name: "Course progress" })).toHaveAttribute("aria-valuenow", "33")
    expect(screen.getByText(/4 of 12/)).toBeInTheDocument()
    expect(screen.getByText(/lessons · .* in all/)).toBeInTheDocument()
  })

  it("continues from the first lesson that is neither done nor locked", async () => {
    const user = userEvent.setup()
    const onOpenLesson = vi.fn()
    render(<Course1 onOpenLesson={onOpenLesson} />)
    await user.click(screen.getByRole("button", { name: /^Continue: Estimating without guessing/ }))
    expect(onOpenLesson).toHaveBeenCalledWith(expect.objectContaining({ id: "l5" }))
  })

  it("opens the module with the next lesson and lets others be opened", async () => {
    const user = userEvent.setup()
    render(<Course1 />)
    expect(screen.getByRole("button", { name: /Planning that holds up/, expanded: true })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Start here/ })).toHaveAttribute("aria-expanded", "false")
    await user.click(screen.getByRole("button", { name: /Start here/ }))
    expect(screen.getByText("Set up your workspace")).toBeInTheDocument()
  })

  it("marks a lesson done and moves progress and Continue on", async () => {
    const user = userEvent.setup()
    const onToggleDone = vi.fn()
    render(<Course1 onToggleDone={onToggleDone} />)
    await user.click(screen.getByRole("checkbox", { name: 'Mark "Estimating without guessing" as done' }))
    expect(onToggleDone).toHaveBeenCalledWith(expect.objectContaining({ id: "l5" }), true)
    expect(screen.getByRole("progressbar", { name: "Course progress" })).toHaveAttribute("aria-valuenow", "42")
    expect(screen.getByRole("button", { name: /^Continue: Dependencies and what blocks you/ })).toBeInTheDocument()
    expect(screen.getByRole("checkbox", { name: 'Mark "Estimating without guessing" as not done' })).toBeChecked()
  })

  it("disables locked lessons and says why", async () => {
    const user = userEvent.setup()
    render(<Course1 />)
    await user.click(screen.getByRole("button", { name: /Final project/ }))
    const lesson = screen.getByText("Plan a real project from scratch").closest("button")!
    expect(lesson).toBeDisabled()
    expect(lesson).toHaveTextContent("Finish the modules before it")
    expect(screen.getByRole("checkbox", { name: /Plan a real project from scratch/ })).toBeDisabled()
  })

  it("unlocks the certificate only when everything is done", () => {
    const { unmount } = render(<Course1 />)
    expect(screen.getByText(/Unlocks when you finish all 12 lessons. 8 to go./)).toBeInTheDocument()
    unmount()
    render(<Course1 modules={[{ id: "m", title: "Only", lessons: [{ id: "x", title: "One", kind: "video", minutes: 3, done: true }] }]} />)
    expect(screen.getByText(/Course complete/)).toBeInTheDocument()
    expect(screen.getByText(/You finished every lesson/)).toBeInTheDocument()
    expect(screen.getByText(/Nothing left/)).toBeInTheDocument()
  })

  it("starts rather than continues when nothing is done", () => {
    render(<Course1 modules={[{ id: "m", title: "Only", lessons: [{ id: "x", title: "First lesson", kind: "video", minutes: 3 }] }]} />)
    expect(screen.getByRole("button", { name: /^Start: First lesson/ })).toBeInTheDocument()
  })

  it("shows loading, empty and error states", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const { rerender } = render(<Course1 state="loading" />)
    expect(screen.getByRole("status")).toBeInTheDocument()
    rerender(<Course1 state="empty" />)
    expect(screen.getByRole("heading", { name: "No lessons yet" })).toBeInTheDocument()
    rerender(<Course1 state="error" onRetry={onRetry} />)
    await user.click(screen.getByRole("button", { name: /try again/i }))
    expect(onRetry).toHaveBeenCalled()
  })
})
