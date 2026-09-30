import * as React from "react"
import { act, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Countdown } from "@/components/ballmac/countdown"

describe("Countdown", () => {
  it("ticks to zero and announces completion once", () => {
    vi.useFakeTimers()
    try {
      const onComplete = vi.fn()
      render(<Countdown defaultValue={2} onComplete={onComplete} />)
      act(() => vi.advanceTimersByTime(1000))
      expect(screen.getByRole("timer")).toHaveAttribute(
        "aria-label",
        "Time remaining: 0 minutes, 1 second",
      )
      act(() => vi.advanceTimersByTime(1000))
      expect(screen.getByRole("timer")).toHaveAttribute(
        "aria-label",
        "Time remaining: 0 minutes, 0 seconds",
      )
      expect(onComplete).toHaveBeenCalledTimes(1)
      act(() => vi.advanceTimersByTime(2000))
      expect(onComplete).toHaveBeenCalledTimes(1)
    } finally {
      vi.useRealTimers()
    }
  })

  it("reports a controlled tick without changing its displayed time", () => {
    vi.useFakeTimers()
    try {
      const onValueChange = vi.fn()
      render(<Countdown value={3} onValueChange={onValueChange} />)
      act(() => vi.advanceTimersByTime(1000))
      expect(onValueChange).toHaveBeenCalledWith(2)
      expect(screen.getByRole("timer")).toHaveAttribute(
        "aria-label",
        "Time remaining: 0 minutes, 3 seconds",
      )
    } finally {
      vi.useRealTimers()
    }
  })
})
