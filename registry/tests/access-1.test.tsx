import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Access1 } from "@/components/ballmac/blocks/access-1/access-1"

const submitBtn = () => screen.getByRole("button", { name: "Submit review" })

describe("Access1", () => {
  it("shows progress as a meter and flags people who have not been seen for months, in words", () => {
    render(<Access1 />)
    expect(screen.getByRole("meter", { name: "Review progress" })).toHaveAttribute("aria-valuetext", "0 of 7 reviewed")
    expect(screen.getAllByText(/not used lately/).length).toBeGreaterThanOrEqual(2)
    expect(submitBtn()).toBeDisabled()
  })

  it("keeps everyone who is active and leaves the flagged people to decide", async () => {
    const user = userEvent.setup()
    render(<Access1 />)
    await user.click(screen.getByRole("button", { name: "Keep everyone who is active" }))
    expect(screen.getByText("5 of 7 reviewed")).toBeInTheDocument()
    expect(within(screen.getByRole("group", { name: "Decision for Theo Nakamura" })).getByLabelText("Keep")).toBeChecked()
    expect(within(screen.getByRole("group", { name: "Decision for Noor Haddad" })).getByLabelText("Keep")).not.toBeChecked()
    expect(screen.getByText("2 still to review.")).toBeInTheDocument()
  })

  it("offers only lower roles when reducing, and remembers the choice", async () => {
    const user = userEvent.setup()
    render(<Access1 />)
    const group = screen.getByRole("group", { name: "Decision for Theo Nakamura" })
    await user.click(within(group).getByLabelText("Reduce"))
    const select = screen.getByRole("combobox", { name: "New role for Theo Nakamura" })
    expect(within(select).getAllByRole("option").map((o) => o.textContent)).toEqual(["Member", "Viewer"])
    await user.selectOptions(select, "Viewer")
    expect(select).toHaveValue("Viewer")
  })

  it("asks before removing anyone, names them, and submits every decision", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<Access1 people={[{ id: "a", name: "Ana Souza", email: "ana@x.example", role: "Member", lastUsed: "Never", idleDays: 999 }, { id: "b", name: "Mei Tanaka", email: "mei@x.example", role: "Viewer", lastUsed: "Today", idleDays: 0 }]} onSubmit={onSubmit} />)
    await user.click(within(screen.getByRole("group", { name: "Decision for Ana Souza" })).getByLabelText("Remove"))
    await user.click(within(screen.getByRole("group", { name: "Decision for Mei Tanaka" })).getByLabelText("Keep"))
    await user.click(submitBtn())
    const dialog = await screen.findByRole("alertdialog")
    expect(dialog).toHaveTextContent("Ana Souza")
    expect(onSubmit).not.toHaveBeenCalled()
    await user.click(within(dialog).getByRole("button", { name: "Submit and remove" }))
    expect(onSubmit).toHaveBeenCalledWith({ a: { action: "remove" }, b: { action: "keep" } })
    expect(await screen.findByText(/Review submitted\. 1 kept, 0 reduced, 1 removed\./)).toBeInTheDocument()
  })

  it("says when the review could not be saved", async () => {
    const user = userEvent.setup()
    render(<Access1 people={[{ id: "a", name: "Mei Tanaka", email: "mei@x.example", role: "Viewer", lastUsed: "Today", idleDays: 0 }]} onSubmit={() => Promise.reject(new Error("The directory is unavailable."))} />)
    await user.click(screen.getByLabelText("Keep"))
    await user.click(submitBtn())
    expect(await screen.findByRole("alert")).toHaveTextContent("The directory is unavailable.")
  })

  it("shows loading, empty and error states", () => {
    const { rerender } = render(<Access1 state="loading" />)
    expect(screen.getByRole("status")).toHaveTextContent("Loading people")
    rerender(<Access1 people={[]} />)
    expect(screen.getByText("Nobody to review")).toBeInTheDocument()
    rerender(<Access1 state="error" onRetry={() => {}} />)
    expect(screen.getByRole("alert")).toHaveTextContent("The review could not be loaded")
  })
})
