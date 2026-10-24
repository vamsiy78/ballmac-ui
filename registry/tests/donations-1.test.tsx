import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Donations1 } from "@/components/ballmac/blocks/donations-1/donations-1"

async function fill(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Name"), "Ada Lovelace")
  await user.type(screen.getByLabelText("Email for the receipt"), "ada@example.com")
}

describe("Donations1", () => {
  it("says what the chosen amount does and shows the raised progress", async () => {
    const user = userEvent.setup()
    render(<Donations1 />)
    expect(screen.getByRole("progressbar", { name: "Raised so far" })).toHaveAttribute("aria-valuenow", "77")
    expect(screen.getByText("$25 stocks a school library shelf.")).toBeInTheDocument()
    await user.click(screen.getByLabelText("$100"))
    expect(screen.getByText("$100 trains a community health worker.")).toBeInTheDocument()
  })

  it("adds the card fees to the total, and drops them when unticked", async () => {
    const user = userEvent.setup()
    render(<Donations1 />)
    expect(screen.getByText("$25.75")).toBeInTheDocument()
    await user.click(screen.getByLabelText(/to cover card fees/))
    expect(screen.getByText("You give").parentElement).toHaveTextContent("You give$25")
  })

  it("says every month in the total and on the button when monthly", async () => {
    const user = userEvent.setup()
    render(<Donations1 />)
    await user.click(screen.getByLabelText("Every month"))
    expect(screen.getByRole("button", { name: /Give every month/ })).toBeInTheDocument()
    expect(screen.getByText("$25.75 a month")).toBeInTheDocument()
  })

  it("checks a custom amount, the name and the email, field by field", async () => {
    const user = userEvent.setup()
    const onDonate = vi.fn()
    render(<Donations1 onDonate={onDonate} />)
    await user.click(screen.getByLabelText("Other"))
    await user.type(screen.getByLabelText("Your amount"), "0")
    await user.click(screen.getByRole("button", { name: /Give now/ }))
    expect(screen.getByText(/Enter an amount of at least \$1/)).toBeInTheDocument()
    expect(screen.getByText("Enter your name, or give anonymously.")).toBeInTheDocument()
    expect(screen.getByText(/Enter an email address like/)).toBeInTheDocument()
    expect(onDonate).not.toHaveBeenCalled()
  })

  it("does not need a name when giving anonymously, and sends none", async () => {
    const user = userEvent.setup()
    const onDonate = vi.fn()
    render(<Donations1 onDonate={onDonate} />)
    await user.click(screen.getByLabelText(/Give anonymously/))
    await user.type(screen.getByLabelText("Email for the receipt"), "ada@example.com")
    await user.click(screen.getByRole("button", { name: /Give now/ }))
    expect(onDonate).toHaveBeenCalledWith({ amount: 25, cause: "water", monthly: false, coverFees: true, name: "", email: "ada@example.com", anonymous: true })
  })

  it("thanks the donor with exactly what was given, or keeps the form with the reason", async () => {
    const user = userEvent.setup()
    const { unmount } = render(<Donations1 onDonate={vi.fn().mockResolvedValue(undefined)} />)
    await fill(user)
    await user.click(screen.getByRole("button", { name: /Give now/ }))
    expect(await screen.findByText(/Thank you\. \$25\.75 is on its way, and it stocks a school library shelf\. A receipt is coming to ada@example\.com\./)).toBeInTheDocument()
    unmount()
    render(<Donations1 onDonate={() => Promise.reject(new Error("Your card was declined."))} />)
    await fill(user)
    await user.click(screen.getByRole("button", { name: /Give now/ }))
    expect(await screen.findByRole("alert")).toHaveTextContent("Your card was declined.")
    expect(screen.getByLabelText("Name")).toHaveValue("Ada Lovelace")
  })

  it("shows loading, not-open and error states", () => {
    const { rerender } = render(<Donations1 state="loading" />)
    expect(screen.getByRole("status")).toHaveTextContent("Loading the donation page")
    rerender(<Donations1 presets={[]} />)
    expect(screen.getByText("Giving is not open yet")).toBeInTheDocument()
    rerender(<Donations1 state="error" onRetry={() => {}} />)
    expect(screen.getByRole("alert")).toHaveTextContent("The donation page could not be loaded")
  })
})
