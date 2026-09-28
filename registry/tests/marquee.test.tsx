import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Marquee } from "@/components/ballmac/marquee"

describe("Marquee", () => {
  it("keeps one readable copy and hides the clones", () => {
    render(
      <Marquee>
        <a href="#a">Alpha</a>
        <span>Beta</span>
      </Marquee>
    )
    const copies = document.querySelectorAll("[data-slot=marquee-content]")
    expect(copies.length).toBeGreaterThanOrEqual(2)
    expect(copies[0]).not.toHaveAttribute("aria-hidden")
    for (const copy of Array.from(copies).slice(1)) {
      expect(copy).toHaveAttribute("aria-hidden", "true")
      expect(copy).toHaveAttribute("inert")
    }
    // Only the first copy is in the accessibility tree.
    expect(screen.getAllByRole("link", { name: "Alpha" })).toHaveLength(1)
  })

  it("renders a single scrollable copy under reduced motion", () => {
    const original = window.matchMedia
    window.matchMedia = ((query: string) => ({ ...original(query), matches: query.includes("reduce") })) as typeof window.matchMedia
    try {
      render(
        <Marquee>
          <span>Alpha</span>
        </Marquee>
      )
      expect(document.querySelectorAll("[data-slot=marquee-content]")).toHaveLength(1)
      expect(document.querySelector("[data-slot=marquee]")).toHaveClass("overflow-x-auto")
    } finally {
      window.matchMedia = original
    }
  })
})
