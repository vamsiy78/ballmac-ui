import * as React from "react"
import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { AnimatedBeam } from "@/components/ballmac/animated-beam"

function Diagram(props: Partial<React.ComponentProps<typeof AnimatedBeam>>) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const fromRef = React.useRef<HTMLDivElement>(null)
  const toRef = React.useRef<HTMLDivElement>(null)
  return (
    <div ref={containerRef}>
      <div ref={fromRef}>A</div>
      <div ref={toRef}>B</div>
      <AnimatedBeam containerRef={containerRef} fromRef={fromRef} toRef={toRef} {...props} />
    </div>
  )
}

describe("AnimatedBeam", () => {
  it("renders a decorative SVG with a resting path and a pulse", () => {
    render(<Diagram curvature={40} />)
    const svg = document.querySelector("[data-slot=animated-beam]")
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute("aria-hidden", "true")
    expect(svg).toHaveClass("pointer-events-none")
    const path = document.querySelector("[data-slot=animated-beam-path]")
    expect(path?.getAttribute("d")).toMatch(/^M [\d.-]+,[\d.-]+ Q /)
    expect(document.querySelector("[data-slot=animated-beam-pulse]")).toHaveAttribute("stroke", expect.stringMatching(/^url\(#/))
  })

  it("gives every beam its own gradient id", () => {
    render(
      <>
        <Diagram />
        <Diagram reverse />
      </>
    )
    const ids = Array.from(document.querySelectorAll("linearGradient")).map((g) => g.id)
    expect(ids).toHaveLength(2)
    expect(new Set(ids).size).toBe(2)
  })

  it("keeps the curve's control point offset by the curvature", () => {
    render(<Diagram curvature={30} />)
    // jsdom lays everything out at 0,0, so the control point sits at y = -curvature.
    expect(document.querySelector("[data-slot=animated-beam-path]")?.getAttribute("d")).toBe("M 0,0 Q 0,-30 0,0")
  })
})
