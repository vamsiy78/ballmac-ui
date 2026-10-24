import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Listing1 } from "@/components/ballmac/blocks/listing-1/listing-1"

describe("Listing1", () => {
  it("shows the address as the page heading, the price and the three facts that matter", () => {
    render(<Listing1 />)
    expect(screen.getByRole("heading", { level: 1, name: "14 Garden Row" })).toBeInTheDocument()
    expect(screen.getByText("$485,000")).toBeInTheDocument()
    expect(screen.getByText("118 m²")).toBeInTheDocument()
    expect(within(screen.getByRole("list", { name: "Features" })).getAllByRole("listitem")).toHaveLength(6)
  })

  it("steps through the photos with the buttons, the thumbnails and the arrow keys, and says where you are", async () => {
    const user = userEvent.setup()
    render(<Listing1 />)
    expect(screen.getByText("1 of 4")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Next photo" }))
    expect(screen.getByText("2 of 4")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /Show photo 4/ }))
    expect(screen.getByText("4 of 4")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Next photo" }))
    expect(screen.getByText("1 of 4")).toBeInTheDocument()
    screen.getByRole("button", { name: "Next photo" }).focus()
    await user.keyboard("{ArrowLeft}")
    expect(screen.getByText("4 of 4")).toBeInTheDocument()
  })

  it("explains what is missing, field by field, when the form is sent empty", async () => {
    const user = userEvent.setup()
    const onRequestViewing = vi.fn()
    render(<Listing1 onRequestViewing={onRequestViewing} />)
    await user.click(screen.getByRole("button", { name: "Request viewing" }))
    expect(screen.getByText("Choose a time.")).toBeInTheDocument()
    expect(screen.getByText("Enter your name.")).toBeInTheDocument()
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true")
    expect(onRequestViewing).not.toHaveBeenCalled()
  })

  it("sends the request and says what happens next, or keeps what was typed when it fails", async () => {
    const user = userEvent.setup()
    const onRequestViewing = vi.fn().mockResolvedValue(undefined)
    const { rerender } = render(<Listing1 onRequestViewing={onRequestViewing} />)
    await user.click(screen.getByLabelText("Tue 28 Oct, 18:00"))
    await user.type(screen.getByLabelText("Your name"), "Sam Reed")
    await user.type(screen.getByLabelText("Email"), "sam@example.com")
    await user.click(screen.getByRole("button", { name: "Request viewing" }))
    expect(onRequestViewing).toHaveBeenCalledWith({ viewingId: "v3", name: "Sam Reed", email: "sam@example.com" })
    expect(await screen.findByText(/Requested for Tue 28 Oct, 18:00\. Catarina Mendes will confirm by email\./)).toBeInTheDocument()
    rerender(<Listing1 onRequestViewing={() => Promise.reject(new Error("The agent's calendar is unavailable."))} />)
    await user.click(screen.getByRole("button", { name: "Request viewing" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("The agent's calendar is unavailable.")
    expect(screen.getByLabelText("Your name")).toHaveValue("Sam Reed")
  })

  it("shows loading, no-longer-available and error states", () => {
    const { rerender } = render(<Listing1 state="loading" />)
    expect(screen.getByRole("status")).toHaveTextContent("Loading the listing")
    rerender(<Listing1 listing={null} />)
    expect(screen.getByText("This listing is no longer available")).toBeInTheDocument()
    rerender(<Listing1 state="error" onRetry={() => {}} />)
    expect(screen.getByRole("alert")).toHaveTextContent("The listing could not be loaded")
  })
})
