import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { ParticleTree } from "@/components/ballmac/particle-tree"

describe("ParticleTree", () => {
  it("is decoration: hidden from assistive technology, ignoring the pointer, with a canvas inside", () => {
    const { container } = render(<ParticleTree />)
    const root = container.firstElementChild as HTMLElement
    expect(root).toHaveAttribute("aria-hidden", "true")
    expect(root).toHaveAttribute("data-slot", "particle-tree")
    expect(root.className).toContain("pointer-events-none")
    expect(root.querySelector("canvas")).toBeInTheDocument()
  })

  it("passes a class name through and fills its container", () => {
    const { container } = render(<ParticleTree className="-z-10" />)
    const root = container.firstElementChild as HTMLElement
    expect(root.className).toContain("-z-10")
    expect(root.className).toContain("absolute")
  })
})
