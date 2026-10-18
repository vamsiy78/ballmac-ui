import * as React from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { Funnel1 } from "@/components/ballmac/blocks/funnel-1/funnel-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

const seg = [{ id: "all", label: "Everyone", steps: [{ id: "a", name: "Visited", count: 1000 }, { id: "b", name: "Signed up", count: 500 }, { id: "c", name: "Paid", count: 50 }] }]

describe("Funnel1", () => {
  it("works out overall conversion and says it", () => {
    render(<Funnel1 segments={seg} />)
    expect(screen.getByText("5.0%")).toBeInTheDocument()
    expect(screen.getByText("50 of 1,000")).toBeInTheDocument()
  })

  it("names each step with its count, share of the first and of the step before", () => {
    render(<Funnel1 segments={seg} />)
    expect(screen.getByRole("button", { name: "Signed up: 500 people, 50.0% of the first step, 50.0% of the step before" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Paid: 50 people, 5.0% of the first step, 10.0% of the step before" })).toBeInTheDocument()
  })

  it("writes the biggest leak as a sentence", () => {
    render(<Funnel1 segments={seg} />)
    const leak = screen.getByRole("heading", { name: "Biggest leak" }).closest("div")!
    expect(leak).toHaveTextContent("Between Signed up and Paid, 90% of people stop: 450 people")
  })

  it("shows what was lost between steps", () => {
    render(<Funnel1 segments={seg} />)
    expect(screen.getByText("500 lost · 50%")).toBeInTheDocument()
    expect(screen.getByText("450 lost · 90%")).toBeInTheDocument()
  })

  it("shows a chosen step's details and switches groups", async () => {
    const user = userEvent.setup()
    const segments = [...seg, { id: "m", label: "Mobile", steps: [{ id: "a", name: "Visited", count: 200 }, { id: "b", name: "Signed up", count: 20 }] }]
    render(<Funnel1 segments={segments} />)
    await user.click(screen.getByRole("button", { name: /^Signed up/ }))
    const panel = screen.getByRole("heading", { name: "Signed up", level: 2 }).closest("div")!
    expect(within(panel).getByText("Lost on the way in").nextSibling).toHaveTextContent("500")
    await user.click(screen.getByRole("radio", { name: "Mobile" }))
    expect(screen.getByText("10%")).toBeInTheDocument()
    expect(screen.getByText("Choose a step to see what happened there.")).toBeInTheDocument()
  })

  it("hides the switch with a single group", () => {
    render(<Funnel1 segments={seg} />)
    expect(screen.queryByRole("radiogroup")).toBeNull()
  })

  it("shows loading, empty and error states", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const { rerender } = render(<Funnel1 state="loading" />)
    expect(screen.getByRole("status")).toBeInTheDocument()
    rerender(<Funnel1 state="empty" />)
    expect(screen.getByRole("heading", { name: "No funnel data yet" })).toBeInTheDocument()
    rerender(<Funnel1 state="error" onRetry={onRetry} />)
    await user.click(screen.getByRole("button", { name: /try again/i }))
    expect(onRetry).toHaveBeenCalled()
  })
})
