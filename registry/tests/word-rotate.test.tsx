import { act, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { WordRotate } from "@/components/ballmac/word-rotate"

describe("WordRotate", () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it("gives assistive tech one stable sentence and hides the animation", () => {
    render(
      <h1>
        Ship <WordRotate words={["faster", "safer", "together"]} />
      </h1>
    )
    expect(screen.getByRole("heading", { level: 1, name: "Ship faster, safer, together" })).toBeInTheDocument()
    const viewport = document.querySelector("[data-slot=word-rotate-viewport]")!
    expect(viewport).toHaveAttribute("aria-hidden", "true")
    expect(document.querySelector("[aria-live]")).toBeNull()
  })

  it("uses srText when given", () => {
    render(
      <p>
        Built for <WordRotate words={["teams", "you"]} srText="teams like yours" />
      </p>
    )
    expect(screen.getByText("teams like yours")).toHaveClass("sr-only")
  })

  it("advances on the interval and stops when paused", () => {
    const { rerender } = render(<WordRotate words={["one", "two", "three"]} interval={1000} />)
    const current = () => Array.from(document.querySelectorAll("[data-slot=word-rotate-word]")).at(-1)?.textContent
    expect(current()).toBe("one")
    act(() => vi.advanceTimersByTime(1000))
    expect(current()).toBe("two")
    rerender(<WordRotate words={["one", "two", "three"]} interval={1000} paused />)
    act(() => vi.advanceTimersByTime(3000))
    expect(current()).toBe("two")
  })
})
