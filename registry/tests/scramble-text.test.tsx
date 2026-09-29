import { act, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { ScrambleText } from "@/components/ballmac/scramble-text"

const output = () => document.querySelector("[data-slot=scramble-text-output]")!

describe("ScrambleText", () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it("scrambles, then reaches the final text and calls onComplete", () => {
    const onComplete = vi.fn()
    render(
      <ScrambleText as="h2" duration={400} speed={40} characters="#" onComplete={onComplete}>
        Access granted
      </ScrambleText>
    )
    // Accessible name is always the final text.
    expect(screen.getByRole("heading", { level: 2, name: "Access granted" })).toBeInTheDocument()
    // First frame: letters are glyphs, spaces are kept.
    expect(output().textContent).toMatch(/^#+ /)
    act(() => vi.advanceTimersByTime(400))
    expect(output().textContent).toBe("Access granted")
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it("waits for the delay", () => {
    render(
      <ScrambleText delay={500} duration={200} characters="*">
        Done
      </ScrambleText>
    )
    expect(output().textContent).toBe("****")
    act(() => vi.advanceTimersByTime(700))
    expect(output().textContent).toBe("Done")
  })

  it("replays on hover", () => {
    render(
      <ScrambleText trigger="hover" duration={200} characters="*">
        Menu
      </ScrambleText>
    )
    expect(output().textContent).toBe("Menu")
    act(() => {
      document.querySelector("[data-slot=scramble-text]")!.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }))
    })
    expect(output().textContent).toBe("****")
    act(() => vi.advanceTimersByTime(200))
    expect(output().textContent).toBe("Menu")
  })

  it("shows the final text under reduced motion", () => {
    const original = window.matchMedia
    window.matchMedia = ((q: string) => ({ ...original(q), matches: q.includes("reduce") })) as typeof window.matchMedia
    try {
      render(<ScrambleText characters="*">Calm</ScrambleText>)
      expect(output().textContent).toBe("Calm")
    } finally {
      window.matchMedia = original
    }
  })
})
