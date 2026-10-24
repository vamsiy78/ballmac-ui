import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ReviewCenter, type ReviewItem } from "@/components/ballmac/review-center"

const items: ReviewItem[] = [
  { id: "1", title: "Release notes for 2.4", agent: "Writer", summary: "Eight changes, grouped by area.", confidence: 0.91, status: "pending", preview: <p>Preview one</p> },
  { id: "2", title: "Refund of $340 to Maria Lopez", agent: "Payments", summary: "Within policy but above the limit.", confidence: 0.48, status: "pending" },
  { id: "3", title: "Reply to the press enquiry", agent: "Support", summary: "A short holding reply.", status: "approved" },
]

describe("ReviewCenter", () => {
  it("counts what is waiting, approved and sent back", () => {
    render(<ReviewCenter items={[...items, { id: "4", title: "x", summary: "y", status: "changes", feedback: "Shorter." }]} />)
    expect(screen.getByText(/2 to review · 1 approved · 1 sent back/)).toBeInTheDocument()
  })

  it("is a listbox with each item's state in words, and starts on the first one waiting", () => {
    render(<ReviewCenter items={items} />)
    const options = within(screen.getByRole("listbox", { name: "Items to review" })).getAllByRole("option")
    expect(options).toHaveLength(3)
    expect(options[0]).toHaveAttribute("aria-selected", "true")
    expect(options[0]).toHaveTextContent("To review: Release notes for 2.4")
    expect(options[2]).toHaveTextContent("Approved: Reply to the press enquiry")
    expect(options[0]).toHaveTextContent("91% sure")
  })

  it("shows the chosen item with its summary, preview and how sure the agent is, and warns on low confidence", async () => {
    const user = userEvent.setup()
    render(<ReviewCenter items={items} />)
    expect(screen.getByText("Preview one")).toBeInTheDocument()
    expect(screen.getByRole("meter", { name: "Agent confidence" })).toHaveAttribute("aria-valuenow", "91")
    await user.click(screen.getByRole("option", { name: /Refund of \$340/ }))
    expect(screen.getByText("Within policy but above the limit.")).toBeInTheDocument()
    expect(screen.getByText(/worth a close look/)).toBeInTheDocument()
  })

  it("moves with J and K and the arrow keys", async () => {
    const user = userEvent.setup()
    render(<ReviewCenter items={items} />)
    screen.getAllByRole("option")[0].focus()
    await user.keyboard("j")
    expect(screen.getAllByRole("option")[1]).toHaveAttribute("aria-selected", "true")
    await user.keyboard("k")
    expect(screen.getAllByRole("option")[0]).toHaveAttribute("aria-selected", "true")
    await user.keyboard("{ArrowDown}{ArrowDown}")
    expect(screen.getAllByRole("option")[2]).toHaveAttribute("aria-selected", "true")
  })

  it("approves with A, shows it at once and moves on to the next one waiting", async () => {
    const user = userEvent.setup()
    const onApprove = vi.fn().mockResolvedValue(undefined)
    render(<ReviewCenter items={items} onApprove={onApprove} onRequestChanges={() => {}} />)
    screen.getAllByRole("option")[0].focus()
    await user.keyboard("a")
    expect(onApprove).toHaveBeenCalledWith("1")
    expect(await screen.findByText("Approved: Release notes for 2.4")).toBeInTheDocument()
    expect(screen.getAllByRole("option")[1]).toHaveAttribute("aria-selected", "true")
    expect(screen.getByText(/1 to review · 2 approved/)).toBeInTheDocument()
  })

  it("asks for changes with R and a comment, and refuses an empty one", async () => {
    const user = userEvent.setup()
    const onRequestChanges = vi.fn().mockResolvedValue(undefined)
    render(<ReviewCenter items={items} onApprove={() => {}} onRequestChanges={onRequestChanges} />)
    screen.getAllByRole("option")[0].focus()
    await user.keyboard("r")
    expect(await screen.findByLabelText("What should change?")).toHaveFocus()
    await user.click(screen.getByRole("button", { name: "Send it back" }))
    expect(screen.getByRole("alert")).toHaveTextContent("Say what should change first.")
    await user.type(screen.getByLabelText("What should change?"), "Make it shorter")
    await user.click(screen.getByRole("button", { name: "Send it back" }))
    expect(onRequestChanges).toHaveBeenCalledWith("1", "Make it shorter")
  })

  it("ignores the shortcuts while typing a comment", async () => {
    const user = userEvent.setup()
    const onApprove = vi.fn()
    render(<ReviewCenter items={items} onApprove={onApprove} onRequestChanges={() => {}} />)
    await user.click(screen.getByRole("button", { name: "Request changes" }))
    await user.type(screen.getByLabelText("What should change?"), "a j k r")
    expect(onApprove).not.toHaveBeenCalled()
    expect(screen.getByLabelText("What should change?")).toHaveValue("a j k r")
  })

  it("takes a decision back and says why when saving fails", async () => {
    const user = userEvent.setup()
    render(<ReviewCenter items={items} onApprove={() => Promise.reject(new Error("The item was already changed."))} />)
    await user.click(screen.getByRole("button", { name: "Approve" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("The item was already changed.")
    expect(screen.getAllByRole("option")[0]).toHaveTextContent("To review")
    expect(screen.getByText(/2 to review/)).toBeInTheDocument()
  })

  it("says so when there is nothing to review", () => {
    render(<ReviewCenter items={[]} />)
    expect(screen.getByText("Nothing to review.")).toBeInTheDocument()
  })
})
