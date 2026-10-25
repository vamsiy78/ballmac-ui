import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Ecommerce2 } from "@/components/ballmac/blocks/ecommerce-2/ecommerce-2"

describe("Ecommerce2", () => {
  it("shows the product, its rating and price in words", () => {
    render(<Ecommerce2 />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Aria portable speaker")
    expect(screen.getByRole("link", { name: /4\.7 out of 5, 1,284 reviews/ })).toBeInTheDocument()
    expect(screen.getByText("Save $30")).toBeInTheDocument()
  })

  it("writes the chosen color next to its legend and changes the picture name", async () => {
    const user = userEvent.setup()
    render(<Ecommerce2 />)
    expect(screen.getByRole("group", { name: /Color/ })).toHaveTextContent("Sand")
    await user.click(screen.getByRole("radio", { name: "Moss" }))
    expect(screen.getByRole("group", { name: /Color/ })).toHaveTextContent("Moss")
    expect(screen.getByRole("img", { name: "Aria portable speaker, Moss" })).toBeInTheDocument()
  })

  it("disables an unavailable option and says it is sold out", () => {
    render(<Ecommerce2 />)
    expect(screen.getByRole("radio", { name: /Pair/ })).toBeDisabled()
    expect(screen.getByText("(sold out)")).toBeInTheDocument()
  })

  it("steps through the gallery with the arrow keys", async () => {
    const user = userEvent.setup()
    render(<Ecommerce2 />)
    const first = screen.getByRole("radio", { name: /Picture 1 of 4/ })
    first.focus()
    await user.keyboard("{ArrowRight}")
    expect(screen.getByRole("radio", { name: /Picture 2 of 4/ })).toHaveAttribute("aria-checked", "true")
    expect(screen.getByRole("radio", { name: /Picture 2 of 4/ })).toHaveFocus()
  })

  it("changes the quantity and the total on the button, within limits", async () => {
    const user = userEvent.setup()
    render(<Ecommerce2 />)
    expect(screen.getByRole("button", { name: "One fewer" })).toBeDisabled()
    await user.click(screen.getByRole("button", { name: "One more" }))
    expect(screen.getByRole("button", { name: /Add to bag, \$258/ })).toBeInTheDocument()
  })

  it("adds with the choices and shows success, or the reason it failed", async () => {
    const user = userEvent.setup()
    const onAddToBag = vi.fn().mockRejectedValueOnce(new Error("Sold out in Sand.")).mockResolvedValue(undefined)
    render(<Ecommerce2 onAddToBag={onAddToBag} />)
    await user.click(screen.getByRole("button", { name: /Add to bag/ }))
    expect(onAddToBag).toHaveBeenCalledWith({ color: "sand", option: "solo", quantity: 1 })
    expect(await screen.findByRole("alert")).toHaveTextContent("Sold out in Sand.")
    await user.click(screen.getByRole("button", { name: /Add to bag/ }))
    expect(await screen.findByText(/Added to your bag/)).toBeInTheDocument()
  })

  it("has the fine print and the reviews", () => {
    render(<Ecommerce2 />)
    expect(screen.getByText("Returns and warranty")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "What people say" })).toBeInTheDocument()
  })

  it("renders the loading, empty and error states", () => {
    const { rerender } = render(<Ecommerce2 state="loading" />)
    expect(screen.getByRole("status")).toBeInTheDocument()
    rerender(<Ecommerce2 state="empty" />)
    expect(screen.getByText("This product is no longer available")).toBeInTheDocument()
    rerender(<Ecommerce2 state="error" onRetry={() => {}} />)
    expect(screen.getByRole("alert")).toBeInTheDocument()
  })
})
