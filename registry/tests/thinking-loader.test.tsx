import { act, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { ThinkingLoader } from "@/components/ballmac/thinking-loader"

describe("ThinkingLoader", () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it("tells screen readers it is working, once, and hides the rolling phases", () => {
    render(<ThinkingLoader phases={["One", "Two"]} />)
    expect(screen.getByRole("status")).toHaveTextContent("Working")
    expect(document.querySelector("[aria-hidden=true] [aria-hidden=true], span[aria-hidden=true]")).not.toBeNull()
  })

  it("rolls through the phases and wraps around", () => {
    render(<ThinkingLoader phases={["One", "Two", "Three"]} interval={1000} />)
    const text = () => document.querySelector("[data-slot=thinking-loader]")!.textContent
    expect(text()).toContain("One")
    act(() => { vi.advanceTimersByTime(1000) })
    expect(text()).toContain("Two")
    act(() => { vi.advanceTimersByTime(2000) })
    expect(text()).toContain("One")
  })

  it("settles on the finished text, announces it, and stops rolling", () => {
    const { rerender } = render(<ThinkingLoader phases={["One", "Two"]} interval={1000} />)
    rerender(<ThinkingLoader phases={["One", "Two"]} interval={1000} done doneLabel="Answered with 3 sources" />)
    expect(screen.getByRole("status")).toHaveTextContent("Answered with 3 sources")
    act(() => { vi.advanceTimersByTime(5000) })
    expect(document.querySelector("[data-slot=thinking-loader]")!.textContent).toContain("Answered with 3 sources")
    expect(document.querySelector("[data-slot=thinking-loader]")).toHaveAttribute("data-done")
  })

  it("falls back to four general phases and a plain Done", () => {
    const { rerender } = render(<ThinkingLoader />)
    expect(document.querySelector("[data-slot=thinking-loader]")!.textContent).toContain("Thinking")
    rerender(<ThinkingLoader done />)
    expect(screen.getByRole("status")).toHaveTextContent("Done")
  })
})
