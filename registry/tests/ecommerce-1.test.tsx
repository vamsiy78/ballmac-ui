import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Ecommerce1 } from "@/components/ballmac/blocks/ecommerce-1/ecommerce-1"

describe("Ecommerce1", () => {
  it("shows the heading, the products and a count", () => {
    render(<Ecommerce1 />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Everyday essentials")
    expect(screen.getByText("8 products")).toBeInTheDocument()
    expect(screen.getByText("Aria portable speaker")).toBeInTheDocument()
  })

  it("says the old price as 'was'", () => {
    render(<Ecommerce1 />)
    expect(screen.getAllByText("was", { exact: false }).length).toBeGreaterThan(0)
  })

  it("filters by category, shows a removable chip and counts the results", async () => {
    const user = userEvent.setup()
    render(<Ecommerce1 />)
    await user.click(screen.getByRole("checkbox", { name: /Audio/ }))
    expect(screen.getByText("3 products")).toBeInTheDocument()
    expect(screen.queryByText("Ember ceramic mug")).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /Audio.*Remove this filter/ }))
    expect(screen.getByText("8 products")).toBeInTheDocument()
  })

  it("filters by price and on sale, and offers Clear all", async () => {
    const user = userEvent.setup()
    render(<Ecommerce1 />)
    await user.click(screen.getByRole("radio", { name: "Under $50" }))
    await user.click(screen.getByRole("checkbox", { name: "On sale" }))
    expect(screen.getByText("1 product")).toBeInTheDocument()
    expect(screen.getByText("Drift insulated bottle")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Clear all" }))
    expect(screen.getByText("8 products")).toBeInTheDocument()
  })

  it("sorts by price", async () => {
    const user = userEvent.setup()
    render(<Ecommerce1 />)
    await user.selectOptions(screen.getByRole("combobox"), "low")
    const names = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)
    expect(names[0]).toBe("Ember ceramic mug")
  })

  it("explains when nothing matches", async () => {
    const user = userEvent.setup()
    render(<Ecommerce1 />)
    await user.click(screen.getByRole("checkbox", { name: /Bags/ }))
    await user.click(screen.getByRole("radio", { name: "Under $50" }))
    expect(screen.getByText("Nothing matches those filters")).toBeInTheDocument()
  })

  it("adds with the chosen color, and shows why when it fails", async () => {
    const user = userEvent.setup()
    const onAddToCart = vi.fn().mockRejectedValueOnce(new Error("Out of stock in Sky."))
    render(<Ecommerce1 onAddToCart={onAddToCart} />)
    const card = screen.getByText("Aria portable speaker").closest("li") as HTMLElement
    await user.click(within(card).getByRole("radio", { name: "Sky" }))
    await user.click(within(card).getByRole("button", { name: "Add Aria portable speaker to the bag" }))
    expect(onAddToCart).toHaveBeenCalledWith("aria", "sky")
    expect(await within(card).findByRole("alert")).toHaveTextContent("Out of stock in Sky.")
  })

  it("saves with a toggle that goes back if it fails", async () => {
    const user = userEvent.setup()
    render(<Ecommerce1 onToggleSaved={() => Promise.reject(new Error("no"))} />)
    const heart = screen.getByRole("button", { name: "Save Aria portable speaker" })
    await user.click(heart)
    await vi.waitFor(() => expect(heart).toHaveAttribute("aria-pressed", "false"))
  })

  it("renders the loading, empty and error states", () => {
    const { rerender } = render(<Ecommerce1 state="loading" />)
    expect(screen.getByRole("status")).toBeInTheDocument()
    rerender(<Ecommerce1 products={[]} />)
    expect(screen.getByText("Nothing here yet")).toBeInTheDocument()
    rerender(<Ecommerce1 state="error" onRetry={() => {}} />)
    expect(screen.getByRole("alert")).toBeInTheDocument()
  })
})
