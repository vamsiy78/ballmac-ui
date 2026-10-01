import * as React from "react"
import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"

import { Testimonials2 } from "@/components/ballmac/blocks/testimonials-2/testimonials-2"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})
afterEach(() => vi.useRealTimers())

describe("Testimonials2", () => {
  it("shows the first quote and lists every person as a tab", () => {
    render(<Testimonials2 />)
    expect(screen.getByRole("tablist", { name: "Choose a testimonial" })).toBeInTheDocument()
    expect(screen.getAllByRole("tab")).toHaveLength(4)
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Month-end close went from five days to one")
  })

  it("moves with arrow keys, the buttons and wraps around", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Testimonials2 onValueChange={onValueChange} />)
    await user.click(screen.getByRole("tab", { name: /Priya Raman/ }))
    await user.keyboard("{ArrowRight}")
    expect(onValueChange).toHaveBeenLastCalledWith(1)
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Marcus Webb")
    await user.click(screen.getByRole("button", { name: "Previous testimonial" }))
    await user.click(screen.getByRole("button", { name: "Previous testimonial" }))
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Tomás Herrera")
  })

  it("advances on a timer only when autoplay is set, and pauses while hovered", () => {
    vi.useFakeTimers()
    const { container } = render(<Testimonials2 autoplay={1000} />)
    act(() => void vi.advanceTimersByTime(1100))
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Marcus Webb")
    const section = container.querySelector("section")!
    act(() => void section.dispatchEvent(new MouseEvent("mouseover", { bubbles: true })))
    // React's onMouseEnter listens to mouseover.
    act(() => void vi.advanceTimersByTime(3000))
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Marcus Webb")
  })

  it("stays put without autoplay", () => {
    vi.useFakeTimers()
    render(<Testimonials2 />)
    act(() => void vi.advanceTimersByTime(20000))
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Priya Raman")
  })
})
