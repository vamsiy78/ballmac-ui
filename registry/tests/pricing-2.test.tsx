import * as React from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { Pricing2 } from "@/components/ballmac/blocks/pricing-2/pricing-2"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

describe("Pricing2", () => {
  it("shows yearly prices first and the billed total", () => {
    render(<Pricing2 />)
    expect(screen.getByRole("radio", { name: "Yearly" })).toHaveAttribute("aria-checked", "true")
    expect(screen.getAllByText("Billed $300 per year")).toHaveLength(1)
    expect(screen.getByRole("status")).toHaveTextContent("Showing yearly prices")
  })

  it("switches to monthly with a click and with the arrow keys, and reports the change", async () => {
    const user = userEvent.setup()
    const onIntervalChange = vi.fn()
    render(<Pricing2 onIntervalChange={onIntervalChange} />)
    await user.click(screen.getByRole("radio", { name: "Monthly" }))
    expect(onIntervalChange).toHaveBeenLastCalledWith("monthly")
    expect(screen.getAllByText("Billed monthly")).toHaveLength(3)
    expect(screen.getByRole("status")).toHaveTextContent("Showing monthly prices")
    await user.keyboard("{ArrowRight}")
    await user.keyboard(" ")
    expect(onIntervalChange).toHaveBeenLastCalledWith("yearly")
  })

  it("marks the featured plan, renders string prices and can hide the enterprise strip", () => {
    render(
      <Pricing2
        enterprise={null}
        plans={[
          { name: "Solo", description: "One", price: { monthly: 9, yearly: 7 }, features: ["A"], cta: { label: "Buy", href: "#" } },
          { name: "Custom", description: "Two", price: "Talk to us", features: ["B"], cta: { label: "Contact", href: "#" }, featured: true },
        ]}
      />
    )
    expect(screen.getByText("Talk to us")).toBeInTheDocument()
    expect(screen.getByText("Most popular")).toBeInTheDocument()
    expect(screen.queryByText("Need something custom?")).not.toBeInTheDocument()
    expect(within(screen.getByRole("link", { name: "Contact" }).closest("div")!).getByText("B")).toBeInTheDocument()
  })

  it("can be controlled", () => {
    render(<Pricing2 interval="monthly" />)
    expect(screen.getByRole("radio", { name: "Monthly" })).toHaveAttribute("aria-checked", "true")
  })
})
