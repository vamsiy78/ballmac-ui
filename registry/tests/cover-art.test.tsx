import * as React from "react"
import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { CoverArt } from "@/components/ballmac/cover-art"

const html = (seed: string | number, variant?: React.ComponentProps<typeof CoverArt>["variant"]) => render(<CoverArt seed={seed} variant={variant} />).container.innerHTML

describe("CoverArt", () => {
  it("draws the same picture for the same seed and a different one for another", () => {
    expect(html("launch")).toBe(html("launch"))
    expect(html("launch")).not.toBe(html("design"))
  })

  it("draws each variant and reports it", () => {
    for (const variant of ["mesh", "rings", "bars", "dots", "waves"] as const) {
      const { container } = render(<CoverArt seed="x" variant={variant} />)
      expect(container.querySelector("[data-slot=cover-art]")).toHaveAttribute("data-variant", variant)
    }
  })

  it("is hidden from assistive technology and takes no pointer events", () => {
    const { container } = render(<CoverArt seed={7} grid />)
    const root = container.firstElementChild as HTMLElement
    expect(root).toHaveAttribute("aria-hidden", "true")
    expect(root.className).toContain("pointer-events-none")
    expect(container.querySelectorAll("svg").length).toBeGreaterThanOrEqual(1)
  })

  it("lets the seed choose the variant when it is auto", () => {
    const kinds = new Set(Array.from({ length: 30 }, (_, i) => render(<CoverArt seed={`s${i}`} />).container.firstElementChild?.getAttribute("data-variant")))
    expect(kinds.size).toBeGreaterThan(2)
  })
})
