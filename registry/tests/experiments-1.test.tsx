import * as React from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { Experiments1 } from "@/components/ballmac/blocks/experiments-1/experiments-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

const v = (id: string, visitors: number, conversions: number, control = false) => ({ id, name: id.toUpperCase(), visitors, conversions, control })

describe("Experiments1", () => {
  it("calls a winner when the gap is unlikely to be chance, and says how sure", () => {
    render(<Experiments1 variants={[v("a", 6420, 385, true), v("b", 6388, 471)]} />)
    expect(screen.getByRole("status")).toHaveTextContent("B is winning")
    expect(screen.getByRole("status")).toHaveTextContent("chance it truly beats A")
    expect(screen.getByText("Winning")).toBeInTheDocument()
  })

  it("works out rates and lift from the counts", () => {
    render(<Experiments1 variants={[v("a", 1000, 100, true), v("b", 1000, 120)]} />)
    expect(screen.getByText("10.00%")).toBeInTheDocument()
    expect(screen.getByText("12.00%")).toBeInTheDocument()
    expect(screen.getByText(/\+20\.0%/)).toBeInTheDocument()
  })

  it("will not call it early, and says how much more traffic it needs", () => {
    render(<Experiments1 variants={[v("a", 812, 41, true), v("b", 798, 52)]} />)
    expect(screen.getByRole("status")).toHaveTextContent("Not enough data to call it yet")
    expect(screen.getByRole("status")).toHaveTextContent(/more visitors/)
    expect(screen.queryByText("Winning")).toBeNull()
  })

  it("says there is no clear difference when the versions match", () => {
    render(<Experiments1 variants={[v("a", 21480, 1934, true), v("b", 21512, 1934)]} />)
    expect(screen.getByRole("status")).toHaveTextContent(/No clear difference|Not enough data/)
    expect(screen.queryByText("Winning")).toBeNull()
  })

  it("says so when the control is still the best", () => {
    render(<Experiments1 variants={[v("a", 5000, 500, true), v("b", 5000, 380)]} />)
    expect(screen.getByRole("status")).toHaveTextContent("A is still the best")
    expect(screen.getByText(/-24\.0%/)).toBeInTheDocument()
  })

  it("gives every interval a text equivalent", () => {
    render(<Experiments1 variants={[v("a", 1000, 100, true), v("b", 1000, 120)]} />)
    expect(screen.getByRole("img", { name: /^A: 10\.00%, likely between 8\.\d+% and 12\.\d+%$/ })).toBeInTheDocument()
  })

  it("offers to ship a variant", async () => {
    const user = userEvent.setup()
    const onShip = vi.fn()
    render(<Experiments1 variants={[v("a", 6420, 385, true), v("b", 6388, 471)]} onShip={onShip} />)
    await user.click(screen.getByRole("button", { name: "Ship B" }))
    expect(onShip).toHaveBeenCalledWith(expect.objectContaining({ id: "b" }))
    expect(within(screen.getByText("A").closest("li")!).queryByRole("button")).toBeNull()
  })

  it("shows loading, empty and error states", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const { rerender } = render(<Experiments1 state="loading" />)
    expect(screen.getByRole("status")).toBeInTheDocument()
    rerender(<Experiments1 state="empty" />)
    expect(screen.getByRole("heading", { name: "No results yet" })).toBeInTheDocument()
    rerender(<Experiments1 state="error" onRetry={onRetry} />)
    await user.click(screen.getByRole("button", { name: /try again/i }))
    expect(onRetry).toHaveBeenCalled()
  })
})
