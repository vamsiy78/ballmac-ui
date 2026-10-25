import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Ecommerce3 } from "@/components/ballmac/blocks/ecommerce-3/ecommerce-3"

describe("Ecommerce3", () => {
  it("shows the lines, the count and a summary with every amount as text", () => {
    render(<Ecommerce3 />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Your bag")
    expect(screen.getByText("4 items")).toBeInTheDocument()
    expect(screen.getAllByText("$281.00").length).toBe(2)
    expect(screen.getAllByText("Free").length).toBeGreaterThan(0)
  })

  it("says how far you are from free shipping with a meter", () => {
    render(<Ecommerce3 freeShippingFrom={400} />)
    expect(screen.getByText("Add $119.00 more for free shipping")).toBeInTheDocument()
    expect(screen.getByRole("meter", { name: "Progress to free shipping" })).toHaveAttribute("aria-valuetext", "$119.00 to go")
  })

  it("changes a quantity at once and takes it back with the reason", async () => {
    const user = userEvent.setup()
    render(<Ecommerce3 onChangeQuantity={() => Promise.reject(new Error("Only 2 left."))} />)
    await user.click(screen.getByRole("button", { name: "One more Ember ceramic mug" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("Only 2 left.")
    expect(screen.getByRole("group", { name: "Quantity of Ember ceramic mug" })).toHaveTextContent("2")
  })

  it("stops at the most that can be bought", async () => {
    const user = userEvent.setup()
    render(<Ecommerce3 />)
    expect(screen.getByRole("button", { name: "One fewer Glow desk lamp" })).toBeDisabled()
    await user.click(screen.getByRole("button", { name: "One more Glow desk lamp" }))
    expect(screen.getByRole("button", { name: "One more Glow desk lamp" })).toBeDisabled()
  })

  it("applies a promo code and shows why a wrong one fails", async () => {
    const user = userEvent.setup()
    render(<Ecommerce3 />)
    await user.type(screen.getByLabelText("Promo code"), "nope")
    await user.click(screen.getByRole("button", { name: "Apply" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("That code is not valid")
    await user.clear(screen.getByLabelText("Promo code"))
    await user.type(screen.getByLabelText("Promo code"), "welcome10")
    await user.click(screen.getByRole("button", { name: "Apply" }))
    expect(await screen.findByText("Welcome offer, 10 off")).toBeInTheDocument()
    expect(screen.getByText("−$10.00")).toBeInTheDocument()
  })

  it("passes a rejected promo message through", async () => {
    const user = userEvent.setup()
    render(<Ecommerce3 onApplyPromo={() => Promise.reject(new Error("That code has expired."))} />)
    await user.type(screen.getByLabelText("Promo code"), "old")
    await user.click(screen.getByRole("button", { name: "Apply" }))
    expect(await screen.findByText("That code has expired.")).toBeInTheDocument()
  })

  it("starts checkout", async () => {
    const user = userEvent.setup()
    const onCheckout = vi.fn()
    render(<Ecommerce3 onCheckout={onCheckout} />)
    await user.click(screen.getByRole("button", { name: /Check out/ }))
    expect(onCheckout).toHaveBeenCalled()
  })

  it("renders the loading, empty and error states", () => {
    const { rerender } = render(<Ecommerce3 state="loading" />)
    expect(screen.getByRole("status")).toBeInTheDocument()
    rerender(<Ecommerce3 state="error" onRetry={() => {}} />)
    expect(screen.getByRole("alert")).toBeInTheDocument()
  })

  it("says the bag is empty", () => {
    render(<Ecommerce3 lines={[]} />)
    expect(screen.getByText("Your bag is empty")).toBeInTheDocument()
  })
})

describe("Ecommerce3 removing", () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }))
  afterEach(() => vi.useRealTimers())

  it("offers Undo for the whole window and cancels the removal", async () => {
    const onRemove = vi.fn()
    render(<Ecommerce3 onRemove={onRemove} undoMs={3000} />)
    await act(async () => screen.getByRole("button", { name: "Remove Glow desk lamp" }).click())
    expect(screen.getByText("Glow desk lamp was removed")).toBeInTheDocument()
    expect(screen.getByText("3 items")).toBeInTheDocument()
    await act(async () => screen.getByRole("button", { name: "Undo" }).click())
    await act(async () => void vi.advanceTimersByTime(4000))
    expect(onRemove).not.toHaveBeenCalled()
    expect(screen.getByText("4 items")).toBeInTheDocument()
  })

  it("removes after the window", async () => {
    const onRemove = vi.fn().mockResolvedValue(undefined)
    render(<Ecommerce3 onRemove={onRemove} undoMs={3000} />)
    await act(async () => screen.getByRole("button", { name: "Remove Glow desk lamp" }).click())
    await act(async () => void vi.advanceTimersByTime(3100))
    expect(onRemove).toHaveBeenCalledWith("3")
    expect(screen.queryByText("Glow desk lamp")).not.toBeInTheDocument()
  })
})
