import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Ecommerce5, type Ecommerce5Order } from "@/components/ballmac/blocks/ecommerce-5/ecommerce-5"

const base: Ecommerce5Order = { number: "BM-1", placed: "Oct 1", total: "$10.00", stage: "shipped", eta: "Arriving Thursday", carrier: "Parcel", tracking: "PX 1", address: ["Sam", "1 Road"], items: [{ id: "1", name: "Mug", variant: "Clay", quantity: 1, kind: "mug", tone: 4 }], events: [{ id: "e", when: "Today", text: "Left the sorting centre" }] }

describe("Ecommerce5", () => {
  it("leads with the arrival sentence", () => {
    render(<Ecommerce5 />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Arriving today between 10:00 and 14:00")
  })

  it("marks the current stage and says done, now and not yet in words", () => {
    render(<Ecommerce5 />)
    const list = screen.getByRole("list", { name: "Delivery progress" })
    expect(list.querySelector('[aria-current="step"]')).toHaveTextContent("Out for delivery (now)")
    expect(list).toHaveTextContent("Shipped (done)")
    expect(list).toHaveTextContent("Delivered (not yet)")
  })

  it("shows the log newest first with place and time", () => {
    render(<Ecommerce5 />)
    expect(screen.getByText("Out for delivery with the driver")).toBeInTheDocument()
    expect(screen.getByText(/Today, 07:42 · Bristol depot/)).toBeInTheDocument()
  })

  it("copies the tracking number and says so", async () => {
    const user = userEvent.setup()
    const write = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined)
    render(<Ecommerce5 />)
    await user.click(screen.getByRole("button", { name: "Copy the tracking number" }))
    expect(write).toHaveBeenCalledWith("PX 7741 0098 2231")
    expect(await screen.findByText("Tracking number copied")).toBeInTheDocument()
  })

  it("offers Change delivery only before it ships", async () => {
    const user = userEvent.setup()
    const onChangeDelivery = vi.fn().mockResolvedValue(undefined)
    const { rerender } = render(<Ecommerce5 order={{ ...base, stage: "packed" }} onChangeDelivery={onChangeDelivery} />)
    await user.click(screen.getByRole("button", { name: "Change delivery" }))
    expect(onChangeDelivery).toHaveBeenCalledWith("BM-1")
    rerender(<Ecommerce5 order={base} onChangeDelivery={onChangeDelivery} />)
    expect(screen.queryByRole("button", { name: "Change delivery" })).not.toBeInTheDocument()
  })

  it("offers Start a return once delivered, and says why if it fails", async () => {
    const user = userEvent.setup()
    render(<Ecommerce5 order={{ ...base, stage: "delivered" }} onStartReturn={() => Promise.reject(new Error("The return window has closed."))} />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Your order has arrived")
    await user.click(screen.getByRole("button", { name: /Start a return/ }))
    expect(await screen.findByRole("alert")).toHaveTextContent("The return window has closed.")
  })

  it("renders the loading, empty and error states", () => {
    const { rerender } = render(<Ecommerce5 state="loading" />)
    expect(screen.getByRole("status")).toBeInTheDocument()
    rerender(<Ecommerce5 state="empty" />)
    expect(screen.getByText("We could not find that order")).toBeInTheDocument()
    rerender(<Ecommerce5 state="error" onRetry={() => {}} />)
    expect(screen.getByRole("alert")).toBeInTheDocument()
  })
})
