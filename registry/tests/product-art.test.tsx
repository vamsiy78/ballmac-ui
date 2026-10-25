import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { ProductArt } from "@/components/ballmac/product-art"

describe("ProductArt", () => {
  it("is hidden from screen readers without a label", () => {
    const { container } = render(<ProductArt kind="mug" />)
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true")
    expect(screen.queryByRole("img")).not.toBeInTheDocument()
  })

  it("is an image with a name when labelled", () => {
    render(<ProductArt kind="speaker" label="Speaker in sand" />)
    expect(screen.getByRole("img", { name: "Speaker in sand" })).toBeInTheDocument()
  })

  it("draws every kind and tints with the chosen chart color", () => {
    for (const k of ["speaker", "mug", "bag", "lamp", "bottle", "headphones"] as const) {
      const { container, unmount } = render(<ProductArt kind={k} tone={4} />)
      expect(container.querySelector("svg")?.children.length).toBeGreaterThan(1)
      expect((container.firstElementChild as HTMLElement).style.background).toContain("--chart-4")
      unmount()
    }
  })
})
