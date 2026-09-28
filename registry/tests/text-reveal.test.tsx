import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { TextReveal } from "@/components/ballmac/text-reveal"

describe("TextReveal", () => {
  it("exposes the full text once to assistive tech", () => {
    render(<TextReveal as="h2">Ship the interface today</TextReveal>)
    expect(screen.getByRole("heading", { level: 2, name: "Ship the interface today" })).toBeInTheDocument()
    // The animated copy is hidden from the accessibility tree.
    const animated = document.querySelector("[data-slot=text-reveal-content]")
    expect(animated).toHaveAttribute("aria-hidden", "true")
    expect(screen.getAllByText("Ship the interface today")).toHaveLength(1)
  })

  it("splits by word or by character", () => {
    const { rerender } = render(<TextReveal>Two words</TextReveal>)
    const content = () => document.querySelector("[data-slot=text-reveal-content]")!
    expect(content().querySelectorAll(":scope > span")).toHaveLength(2)
    rerender(<TextReveal by="char">Two words</TextReveal>)
    // Two word groups holding 3 + 5 characters.
    expect(content().querySelectorAll(":scope > span > span")).toHaveLength(8)
    expect(content().textContent).toBe("Two words")
  })

  it("renders plain text under reduced motion", () => {
    const original = window.matchMedia
    window.matchMedia = ((query: string) => ({ ...original(query), matches: query.includes("reduce") })) as typeof window.matchMedia
    try {
      render(<TextReveal as="p">Calm text</TextReveal>)
      const el = document.querySelector("[data-slot=text-reveal]")!
      expect(el.textContent).toBe("Calm text")
      expect(el.querySelector("[aria-hidden]")).toBeNull()
    } finally {
      window.matchMedia = original
    }
  })
})
