import * as React from "react"
import { renderToString } from "react-dom/server"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { useReducedMotionSafe } from "@/lib/ballmac/motion"

// The visitor asks for reduced motion.
vi.mock("motion/react", async (orig) => ({ ...(await orig<typeof import("motion/react")>()), useReducedMotion: () => true }))

function Probe() {
  return <span data-testid="probe">{useReducedMotionSafe() ? "reduce" : "motion"}</span>
}

describe("useReducedMotionSafe", () => {
  it("is false on the server, so server HTML never depends on the visitor's setting", () => {
    expect(renderToString(<Probe />)).toContain("motion")
  })

  it("reports the visitor's preference once mounted on the client", () => {
    render(<Probe />)
    expect(screen.getByTestId("probe")).toHaveTextContent("reduce")
  })
})
