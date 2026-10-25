import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Ecommerce4 } from "@/components/ballmac/blocks/ecommerce-4/ecommerce-4"

async function throughContact(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Email"), "sam@example.com")
  await user.click(screen.getByRole("button", { name: "Continue" }))
}
async function throughDelivery(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Full name"), "Sam Rivera")
  await user.type(screen.getByLabelText("Address"), "12 Quay Street")
  await user.type(screen.getByLabelText("City"), "Bristol")
  await user.type(screen.getByLabelText("Postal code"), "BS1 4DJ")
  await user.click(screen.getByRole("button", { name: "Continue" }))
}
async function fillCard(user: ReturnType<typeof userEvent.setup>, number = "4242 4242 4242 4242") {
  await user.type(screen.getByLabelText("Name on card"), "Sam Rivera")
  await user.type(screen.getByLabelText("Card number"), number)
  await user.type(screen.getByLabelText("Expires"), "12 / 39")
  await user.type(screen.getByLabelText("Security code"), "123")
}

describe("Ecommerce4", () => {
  it("opens only the first step and shows the order total", () => {
    render(<Ecommerce4 />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Checkout")
    expect(screen.getByLabelText("Email")).toBeInTheDocument()
    expect(screen.queryByLabelText("Full name")).not.toBeInTheDocument()
    expect(screen.getAllByText("$185.00").length).toBeGreaterThan(0)
  })

  it("names the mistake beside the field and focuses it", async () => {
    const user = userEvent.setup()
    render(<Ecommerce4 />)
    await user.type(screen.getByLabelText("Email"), "nope")
    await user.click(screen.getByRole("button", { name: "Continue" }))
    expect(screen.getByRole("alert")).toHaveTextContent("Enter an email address")
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true")
    await vi.waitFor(() => expect(screen.getByLabelText("Email")).toHaveFocus())
  })

  it("folds finished steps into a summary with Edit", async () => {
    const user = userEvent.setup()
    render(<Ecommerce4 />)
    await throughContact(user)
    expect(screen.getByText("sam@example.com")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Edit contact" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Edit contact" }))
    expect(screen.getByLabelText("Email")).toHaveValue("sam@example.com")
  })

  it("adds the delivery price to the total", async () => {
    const user = userEvent.setup()
    render(<Ecommerce4 />)
    await throughContact(user)
    await user.click(screen.getByRole("radio", { name: /Express/ }))
    expect(screen.getAllByText("$199.00").length).toBeGreaterThan(0)
  })

  it("rejects a card number that fails the checksum", async () => {
    const user = userEvent.setup()
    render(<Ecommerce4 />)
    await throughContact(user)
    await throughDelivery(user)
    await fillCard(user, "4242 4242 4242 4241")
    await user.click(screen.getByRole("button", { name: /Pay/ }))
    expect(await screen.findByText(/does not look right/)).toBeInTheDocument()
  })

  it("rejects an expired card", async () => {
    const user = userEvent.setup()
    render(<Ecommerce4 />)
    await throughContact(user)
    await throughDelivery(user)
    await fillCard(user)
    await user.clear(screen.getByLabelText("Expires"))
    await user.type(screen.getByLabelText("Expires"), "01 / 20")
    await user.click(screen.getByRole("button", { name: /Pay/ }))
    expect(await screen.findByText(/has not passed/)).toBeInTheDocument()
  })

  it("places the order and shows the confirmation with the order number", async () => {
    const user = userEvent.setup()
    const onPlaceOrder = vi.fn().mockResolvedValue("BM-1")
    render(<Ecommerce4 onPlaceOrder={onPlaceOrder} />)
    await throughContact(user)
    await throughDelivery(user)
    await fillCard(user)
    await user.click(screen.getByRole("button", { name: /Pay/ }))
    expect(onPlaceOrder).toHaveBeenCalledWith(expect.objectContaining({ email: "sam@example.com", city: "Bristol", cardLast4: "4242", method: "std" }))
    expect(await screen.findByRole("status")).toHaveTextContent("BM-1")
  })

  it("shows a declined card as an alert and charges nothing", async () => {
    const user = userEvent.setup()
    render(<Ecommerce4 onPlaceOrder={() => Promise.reject(new Error("Your card was declined."))} />)
    await throughContact(user)
    await throughDelivery(user)
    await fillCard(user)
    await user.click(screen.getByRole("button", { name: /Pay/ }))
    expect(await screen.findByText("Your card was declined.")).toBeInTheDocument()
    expect(screen.queryByRole("status")).not.toBeInTheDocument()
  })

  it("renders the loading, empty and error states", () => {
    const { rerender } = render(<Ecommerce4 state="loading" />)
    expect(screen.getByRole("status")).toBeInTheDocument()
    rerender(<Ecommerce4 lines={[]} />)
    expect(screen.getByText("Your bag is empty")).toBeInTheDocument()
    rerender(<Ecommerce4 state="error" onRetry={() => {}} />)
    expect(screen.getByRole("alert")).toBeInTheDocument()
  })
})
