import { fireEvent, render, screen } from "@testing-library/react"
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest"

const destroy = vi.fn()
const toggle = vi.fn()
const createGlobe = vi.fn((_canvas: HTMLCanvasElement, _opts: Record<string, unknown>) => ({ destroy, toggle }))
vi.mock("cobe", () => ({ default: (canvas: HTMLCanvasElement, opts: Record<string, unknown>) => createGlobe(canvas, opts) }))

import { Globe } from "@/components/ballmac/globe"

// jsdom has no canvas implementation; the color helpers fall back gracefully when getContext returns null.
const originalGetContext = HTMLCanvasElement.prototype.getContext
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as unknown as typeof originalGetContext
  Element.prototype.setPointerCapture ??= () => {}
})
afterAll(() => {
  HTMLCanvasElement.prototype.getContext = originalGetContext
})
beforeEach(() => {
  createGlobe.mockClear()
  destroy.mockClear()
})

describe("Globe", () => {
  it("renders a labelled, focusable canvas image", () => {
    render(<Globe label="Globe with our regions" />)
    const canvas = screen.getByRole("img", { name: /Globe with our regions/ })
    expect(canvas.tagName).toBe("CANVAS")
    expect(canvas).toHaveAttribute("tabindex", "0")
    expect(canvas.getAttribute("aria-label")).toMatch(/arrow keys/)
  })

  it("is not focusable when not interactive", () => {
    render(<Globe interactive={false} label="Decorative globe" />)
    const canvas = screen.getByRole("img", { name: "Decorative globe" })
    expect(canvas).not.toHaveAttribute("tabindex")
  })

  it("starts cobe with the markers once visible and destroys it on unmount", () => {
    const { unmount } = render(<Globe markers={[{ location: [51.5, -0.1], size: 0.05 }]} />)
    expect(createGlobe).toHaveBeenCalledTimes(1)
    const opts = createGlobe.mock.calls[0]![1]
    expect(opts.markers).toEqual([{ location: [51.5, -0.1], size: 0.05 }])
    unmount()
    expect(destroy).toHaveBeenCalled()
  })

  it("handles keyboard and pointer input without crashing", () => {
    render(<Globe />)
    const canvas = screen.getByRole("img")
    fireEvent.keyDown(canvas, { key: "ArrowRight" })
    fireEvent.keyDown(canvas, { key: "ArrowUp" })
    fireEvent.pointerDown(canvas, { clientX: 10, clientY: 10, pointerId: 1 })
    fireEvent.pointerMove(canvas, { clientX: 40, clientY: 12, pointerId: 1 })
    fireEvent.pointerUp(canvas, { pointerId: 1 })
    expect(canvas).toBeInTheDocument()
  })
})
