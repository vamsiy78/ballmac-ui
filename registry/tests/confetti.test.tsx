import { act, render, renderHook, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const confettiMock = vi.hoisted(() => vi.fn(() => Promise.resolve(undefined)))
vi.mock("canvas-confetti", () => ({ default: confettiMock }))
vi.mock("@/lib/ballmac/color", () => ({ cssColorToRgba: () => [1, 0.5, 0, 1] }))

import { ConfettiButton, fireConfetti, useConfetti } from "@/components/ballmac/confetti"

const original = window.matchMedia
function setReducedMotion(reduce: boolean) {
  window.matchMedia = ((query: string) => ({ ...original(query), matches: reduce && query.includes("reduce") })) as typeof window.matchMedia
}

describe("Confetti", () => {
  beforeEach(() => confettiMock.mockClear())
  afterEach(() => {
    window.matchMedia = original
  })

  it("ConfettiButton fires from the button and still calls onClick", async () => {
    const onClick = vi.fn()
    render(<ConfettiButton onClick={onClick}>Celebrate</ConfettiButton>)
    const button = screen.getByRole("button", { name: "Celebrate" })
    expect(button).toHaveAttribute("type", "button")
    await userEvent.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(confettiMock).toHaveBeenCalled()
    const options = (confettiMock.mock.calls as unknown as [{ colors: string[]; origin: { x: number; y: number } }][])[0]![0]
    // Theme colors are converted to hex for canvas-confetti.
    expect(options.colors[0]).toBe("#ff8000")
    expect(options.origin).toEqual({ x: expect.any(Number), y: expect.any(Number) })
  })

  it("does not fire when onClick prevents default", async () => {
    render(<ConfettiButton onClick={(e) => e.preventDefault()}>Nope</ConfettiButton>)
    await userEvent.click(screen.getByRole("button", { name: "Nope" }))
    expect(confettiMock).not.toHaveBeenCalled()
  })

  it("is a no-op under reduced motion", async () => {
    setReducedMotion(true)
    await expect(fireConfetti({ preset: "sides" })).resolves.toBeUndefined()
    render(<ConfettiButton>Quiet</ConfettiButton>)
    await userEvent.click(screen.getByRole("button", { name: "Quiet" }))
    expect(confettiMock).not.toHaveBeenCalled()
  })

  it("useConfetti returns stable helpers and presets fire multiple shots", async () => {
    const { result, rerender } = renderHook(() => useConfetti())
    const first = result.current
    rerender()
    expect(result.current).toBe(first)
    await act(() => result.current.fire({ preset: "sides" }))
    expect(confettiMock).toHaveBeenCalledTimes(2)
  })
})
