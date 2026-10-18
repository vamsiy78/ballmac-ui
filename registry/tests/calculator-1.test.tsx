import * as React from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { Calculator1 } from "@/components/ballmac/blocks/calculator-1/calculator-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

const summary = () => screen.getByRole("complementary")

describe("Calculator1", () => {
  it("picks the cheapest plan that fits and itemizes the sum", () => {
    render(<Calculator1 />)
    expect(within(summary()).getByText("Team")).toBeInTheDocument()
    // 12 seats × $12 × 0.8 (yearly), no extra requests or storage on Team at the default sliders.
    expect(within(summary()).getByText(/12 seats × \$9\.60/)).toBeInTheDocument()
    expect(within(summary()).getAllByText("$115")[0]).toBeInTheDocument()
    expect(within(summary()).getByRole("button", { name: "Continue with Team" })).toBeInTheDocument()
  })

  it("switches to monthly and the price follows", async () => {
    const user = userEvent.setup()
    render(<Calculator1 />)
    await user.click(screen.getByRole("radio", { name: "Monthly" }))
    expect(within(summary()).getAllByText("$144")[0]).toBeInTheDocument()
    expect(within(summary()).getByText("Billed monthly")).toBeInTheDocument()
  })

  it("adds add-ons to the sum", async () => {
    const user = userEvent.setup()
    render(<Calculator1 />)
    await user.click(screen.getByRole("checkbox", { name: /Single sign-on/ }))
    expect(within(summary()).getByText("Single sign-on")).toBeInTheDocument()
    expect(within(summary()).getAllByText("$79")[0]).toBeInTheDocument()
  })

  it("moves with the keyboard and reads the value with its unit", async () => {
    const user = userEvent.setup()
    render(<Calculator1 />)
    const seats = screen.getByRole("slider", { name: /Team members/ })
    seats.focus()
    await user.keyboard("{ArrowRight}")
    expect(seats).toHaveAttribute("aria-valuenow", "13")
    expect(screen.getByRole("slider", { name: /API requests/ })).toHaveAttribute("aria-valuetext", "250K")
  })

  it("offers Talk to us when no plan fits, never a made-up price", async () => {
    const user = userEvent.setup()
    const onTalk = vi.fn()
    render(<Calculator1 onTalk={onTalk} />)
    const seats = screen.getByRole("slider", { name: /Team members/ })
    seats.focus()
    await user.keyboard("{End}")
    expect(within(summary()).getByText("Let us build this one with you")).toBeInTheDocument()
    expect(within(summary()).queryByText("/month")).toBeNull()
    await user.click(within(summary()).getByRole("button", { name: "Talk to us" }))
    expect(onTalk).toHaveBeenCalledWith(expect.objectContaining({ seats: 300 }))
  })

  it("tells the host exactly what was chosen", async () => {
    const user = userEvent.setup()
    const onContinue = vi.fn()
    render(<Calculator1 onContinue={onContinue} />)
    await user.click(within(summary()).getByRole("button", { name: "Continue with Team" }))
    expect(onContinue).toHaveBeenCalledWith({ plan: "team", seats: 12, requests: 250_000, storage: 100, yearly: true, addons: [], monthly: expect.closeTo(115.2, 1) })
  })

  it("says Free when the free plan covers everything", async () => {
    const user = userEvent.setup()
    render(<Calculator1 />)
    const seats = screen.getByRole("slider", { name: /Team members/ })
    seats.focus()
    await user.keyboard("{Home}")
    await user.keyboard("{ArrowRight}")
    for (const name of [/API requests/, /Storage/]) {
      screen.getByRole("slider", { name }).focus()
      await user.keyboard("{Home}")
    }
    expect(within(summary()).getByText("Starter")).toBeInTheDocument()
    expect(within(summary()).getByText(/Free, with room/)).toBeInTheDocument()
  })
})
