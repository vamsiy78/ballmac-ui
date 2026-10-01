import * as React from "react"
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"

import { AiChat2 } from "@/components/ballmac/blocks/ai-chat-2/ai-chat-2"
import { Billing1 } from "@/components/ballmac/blocks/billing-1/billing-1"
import { Billing2 } from "@/components/ballmac/blocks/billing-2/billing-2"
import { Calendar1 } from "@/components/ballmac/blocks/calendar-1/calendar-1"
import { Kanban1 } from "@/components/ballmac/blocks/kanban-1/kanban-1"
import { Mail1 } from "@/components/ballmac/blocks/mail-1/mail-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})
afterEach(() => vi.useRealTimers())

describe("Billing1", () => {
  it("shows the plan cost, usage and a warning near the limit", () => {
    render(<Billing1 />)
    expect(screen.getAllByText("$224").length).toBeGreaterThan(0)
    expect(screen.getByRole("img", { name: "Storage: 64 percent of the limit used" })).toBeInTheDocument()
    expect(screen.getByRole("img", { name: /API requests this month: 82 percent/ })).toBeInTheDocument()
    expect(screen.getAllByText(/Approaching your limit/)).toHaveLength(1)
    expect(screen.getByText(/unlimited/)).toBeInTheDocument()
  })

  it("lists invoices with named download links and statuses", () => {
    render(<Billing1 />)
    expect(screen.getByRole("link", { name: "Download invoice INV-1042" })).toBeInTheDocument()
    expect(screen.getByText("Failed")).toBeInTheDocument()
  })

  it("validates the new card, formats it and updates the card on file", async () => {
    const user = userEvent.setup()
    const onUpdateCard = vi.fn().mockResolvedValue(undefined)
    render(<Billing1 onUpdateCard={onUpdateCard} />)
    await user.click(screen.getByRole("button", { name: "Update card" }))
    const dialog = await screen.findByRole("dialog")
    await user.click(within(dialog).getByRole("button", { name: "Save card" }))
    expect(within(dialog).getByText("Enter the full card number.")).toBeInTheDocument()
    expect(within(dialog).getByText("Use MM/YY.")).toBeInTheDocument()
    await user.type(within(dialog).getByRole("textbox", { name: "Card number" }), "5555555555554444")
    expect(within(dialog).getByRole("textbox", { name: "Card number" })).toHaveValue("5555 5555 5555 4444")
    await user.type(within(dialog).getByRole("textbox", { name: "Expiry" }), "1129")
    expect(within(dialog).getByRole("textbox", { name: "Expiry" })).toHaveValue("11/29")
    await user.type(within(dialog).getByRole("textbox", { name: "Security code" }), "123")
    await user.click(within(dialog).getByRole("button", { name: "Save card" }))
    await waitFor(() => expect(onUpdateCard).toHaveBeenCalledWith({ number: "5555555555554444", expiry: "11/29", cvc: "123" }))
    expect(await screen.findByText(/•••• 4444/)).toBeInTheDocument()
  })
})

describe("Billing2", () => {
  it("starts on an upgrade and works out the prorated amount", () => {
    render(<Billing2 />)
    expect(screen.getByRole("radio", { name: /Scale/ })).toBeChecked()
    const summary = screen.getByRole("complementary", { name: "Order summary" })
    expect(within(summary).getByText("Scale × 7 seats")).toBeInTheDocument()
    expect(within(summary).getByRole("button", { name: "Upgrade to Scale" })).toBeEnabled()
    expect(within(summary).getByText("−$201.60")).toBeInTheDocument()
    expect(within(summary).getByText(/Due today/).nextSibling).toHaveTextContent("$")
  })

  it("disables confirm when nothing changed and respects the minimum seats", async () => {
    const user = userEvent.setup()
    render(<Billing2 defaultPlan="pro" />)
    expect(screen.getByRole("button", { name: "Choose a change" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Remove a seat" })).toBeDisabled()
    await user.click(screen.getByRole("button", { name: "Add a seat" }))
    expect(screen.getByRole("status", { name: "8 seats" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Add seats" })).toBeEnabled()
  })

  it("confirms the change and reports it, or shows an error", async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn().mockResolvedValue(undefined)
    const { unmount } = render(<Billing2 onConfirm={onConfirm} />)
    await user.click(screen.getByRole("radio", { name: "Yearly · save 20%" }))
    await user.click(screen.getByRole("button", { name: "Upgrade to Scale" }))
    await waitFor(() => expect(onConfirm).toHaveBeenCalledWith({ plan: "scale", seats: 7, interval: "yearly" }))
    expect(await screen.findByRole("heading", { name: "You’re on Scale" })).toBeInTheDocument()
    unmount()
    render(<Billing2 onConfirm={() => Promise.reject(new Error("x"))} />)
    await user.click(screen.getByRole("button", { name: "Upgrade to Scale" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("couldn’t update")
  })
})

describe("Mail1", () => {
  it("opens the first message and shows the unread count", () => {
    render(<Mail1 />)
    expect(screen.getByRole("heading", { name: /Q4 budget/ })).toBeInTheDocument()
    expect(screen.getByRole("navigation", { name: "Folders" })).toHaveTextContent("1 unread")
  })

  it("marks a message read when opened and unread again on request", async () => {
    const user = userEvent.setup()
    render(<Mail1 />)
    const folders = screen.getByRole("navigation", { name: "Folders" })
    await user.click(screen.getByRole("button", { name: /Stripe/ }))
    expect(screen.getByRole("heading", { name: /payout of \$12,480/ })).toBeInTheDocument()
    expect(folders).not.toHaveTextContent("unread")
    await user.click(screen.getByRole("button", { name: "Mark as unread" }))
    expect(folders).toHaveTextContent("1 unread")
  })

  it("moves with the arrow keys and J / K", async () => {
    const user = userEvent.setup()
    render(<Mail1 />)
    const first = screen.getAllByRole("button", { name: /Maya Kim/ })[0]
    first.focus()
    await user.keyboard("{ArrowDown}")
    expect(screen.getByRole("button", { name: /Stripe/ })).toHaveFocus()
    await user.keyboard("j")
    expect(screen.getByRole("button", { name: /Jonas Ortiz/ })).toHaveFocus()
    await user.keyboard("k")
    expect(screen.getByRole("button", { name: /Stripe/ })).toHaveFocus()
  })

  it("stars, archives and announces", async () => {
    const user = userEvent.setup()
    render(<Mail1 />)
    await user.click(screen.getAllByRole("button", { name: "Star" })[0])
    await user.click(within(screen.getByRole("article")).getByRole("button", { name: "Archive" }))
    expect(screen.getByRole("status")).toHaveTextContent("Conversation archived.")
    expect(screen.queryByRole("button", { name: /Maya Kim/ })).not.toBeInTheDocument()
  })

  it("searches, and shows an empty state", async () => {
    const user = userEvent.setup()
    render(<Mail1 />)
    await user.type(screen.getByRole("searchbox", { name: "Search mail" }), "payout")
    expect(screen.getByRole("button", { name: /Stripe/ })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /Jonas Ortiz/ })).not.toBeInTheDocument()
    await user.clear(screen.getByRole("searchbox"))
    await user.type(screen.getByRole("searchbox"), "zzzz")
    expect(screen.getByText("No messages match")).toBeInTheDocument()
  })

  it("replies and composes, adding messages to Sent", async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(<Mail1 onSend={onSend} />)
    await user.click(screen.getByRole("button", { name: /Reply/ }))
    await user.type(screen.getByRole("textbox", { name: "Reply to Maya Kim" }), "Looks good.")
    await user.click(screen.getByRole("button", { name: /^Send$/ }))
    expect(onSend).toHaveBeenCalledWith("maya@northwind.co", "Re: Q4 budget: can you review before Friday?", "Looks good.")
    await user.click(screen.getByRole("button", { name: /Sent/ }))
    expect(screen.getByRole("button", { name: /Re: Q4 budget/ })).toBeInTheDocument()
  })
})

describe("Kanban1", () => {
  it("renders columns with counts and rich cards", () => {
    render(<Kanban1 />)
    expect(screen.getByRole("group", { name: "To do, 3 tasks" })).toBeInTheDocument()
    expect(screen.getByText("SAML SSO for Pro plans")).toBeInTheDocument()
  })

  it("picks a card up with Space, moves it with the arrows and drops it, announcing each step", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Kanban1 onChange={onChange} />)
    const card = screen.getByRole("button", { name: /^Redraw empty states/ })
    card.focus()
    await user.keyboard(" ")
    expect(screen.getByRole("status")).toHaveTextContent("Picked up Redraw empty states")
    await user.keyboard("{ArrowRight}")
    expect(screen.getByRole("status")).toHaveTextContent("moved to In progress")
    const progress = screen.getByRole("group", { name: /In progress, 3 tasks/ })
    expect(within(progress).getByText("Redraw empty states")).toBeInTheDocument()
    await user.keyboard(" ")
    expect(screen.getByRole("status")).toHaveTextContent("Dropped Redraw empty states")
    expect(onChange).toHaveBeenCalled()
  })

  it("cancels a move with Escape", async () => {
    const user = userEvent.setup()
    render(<Kanban1 />)
    const card = screen.getByRole("button", { name: /^Redraw empty states/ })
    card.focus()
    await user.keyboard(" {ArrowRight}{Escape}")
    expect(screen.getByRole("status")).toHaveTextContent("Cancelled")
    expect(within(screen.getByRole("group", { name: /To do, 3 tasks/ })).getByText("Redraw empty states")).toBeInTheDocument()
  })

  it("moves a card from its menu, adds a task and filters by person", async () => {
    const user = userEvent.setup()
    render(<Kanban1 />)
    await user.click(screen.getByRole("button", { name: "Actions for Audit log export as CSV" }))
    await user.click(await screen.findByRole("menuitem", { name: "Done" }))
    expect(within(screen.getByRole("group", { name: /Done, 3 tasks/ })).getByText("Audit log export as CSV")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Add a task to Done" }))
    await user.type(screen.getByRole("textbox", { name: "New task in Done" }), "Celebrate{Enter}")
    expect(within(screen.getByRole("group", { name: /Done, 4 tasks/ })).getByText("Celebrate")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Yuki" }))
    expect(screen.queryByText("SAML SSO for Pro plans")).not.toBeInTheDocument()
    expect(screen.getByText("Redraw empty states")).toBeInTheDocument()
  })
})

describe("Calendar1", () => {
  it("shows the week, today, events and the now line", () => {
    const { container } = render(<Calendar1 />)
    expect(screen.getByRole("heading", { name: "October 2026" })).toBeInTheDocument()
    expect(screen.getAllByRole("button", { name: /Thursday, October 1/ }).some((b) => b.getAttribute("aria-current") === "date")).toBe(true)
    expect(screen.getByRole("button", { name: /Pricing page working session, 10 AM to 12 PM/ })).toBeInTheDocument()
    expect(screen.getByText("Launch day")).toBeInTheDocument()
    expect(container.querySelector("[aria-hidden=true] .bg-destructive")).not.toBeNull()
  })

  it("moves by week and returns to today", async () => {
    const user = userEvent.setup()
    render(<Calendar1 />)
    await user.click(screen.getByRole("button", { name: "Next week" }))
    expect(screen.queryByRole("button", { name: /Pricing page working session/ })).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Today" }))
    expect(screen.getByRole("button", { name: /Pricing page working session/ })).toBeInTheDocument()
  })

  it("hides a calendar's events when it is switched off", async () => {
    const user = userEvent.setup()
    render(<Calendar1 />)
    await user.click(screen.getByRole("checkbox", { name: "Team" }))
    expect(screen.queryByRole("button", { name: /Roadmap sync/ })).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Lunch with Amara/ })).toBeInTheDocument()
  })

  it("opens event details in a popover", async () => {
    const user = userEvent.setup()
    render(<Calendar1 />)
    await user.click(screen.getByRole("button", { name: /Lunch with Amara/ }))
    const pop = await screen.findByRole("dialog", { name: "Lunch with Amara" })
    expect(pop).toHaveTextContent("Café Lisboa")
  })

  it("adds an event from the dialog and validates the end time", async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(<Calendar1 onAdd={onAdd} />)
    await user.click(screen.getAllByRole("button", { name: /New event/ })[0])
    const dialog = await screen.findByRole("dialog")
    await user.type(within(dialog).getByRole("textbox", { name: "Title" }), "Dentist")
    fireEvent.change(within(dialog).getByLabelText("Ends"), { target: { value: "08:00" } })
    expect(within(dialog).getByRole("alert")).toHaveTextContent("end time must be after")
    expect(within(dialog).getByRole("button", { name: "Add event" })).toBeDisabled()
    fireEvent.change(within(dialog).getByLabelText("Ends"), { target: { value: "10:00" } })
    await user.click(within(dialog).getByRole("button", { name: "Add event" }))
    expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({ title: "Dentist", start: "2026-10-01T09:00", end: "2026-10-01T10:00" }))
    expect(await screen.findByRole("button", { name: /Dentist, 9 AM to 10 AM/ })).toBeInTheDocument()
  })
})

describe("AiChat2", () => {
  it("opens with the first artifact version in the panel and lists conversations", () => {
    render(<AiChat2 />)
    expect(screen.getByRole("navigation", { name: "Conversations" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Pricing table · v1/ })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Preview" })).toBeInTheDocument()
  })

  it("streams a reply to a chip and moves the artifact to the next version", async () => {
    vi.useFakeTimers()
    render(<AiChat2 />)
    fireEvent.click(screen.getByRole("button", { name: "Add a monthly and yearly toggle" }))
    await act(async () => { await vi.advanceTimersByTimeAsync(3000) })
    expect(screen.getByText(/added a monthly and yearly toggle/)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Pricing table · v2/ })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Add a monthly and yearly toggle" })).not.toBeInTheDocument()
  })

  it("closes and reopens the artifact panel", async () => {
    const user = userEvent.setup()
    render(<AiChat2 />)
    await user.click(screen.getByRole("button", { name: /Close/ }))
    expect(screen.queryByRole("tab", { name: "Preview" })).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Open Pricing table" }))
    expect(screen.getByRole("tab", { name: "Preview" })).toBeInTheDocument()
  })

  it("uses your onSend", async () => {
    vi.useFakeTimers()
    const onSend = vi.fn().mockResolvedValue({ reply: "Sure thing." })
    render(<AiChat2 onSend={onSend} />)
    fireEvent.click(screen.getByRole("button", { name: "Explain how the code works" }))
    await act(async () => { await vi.advanceTimersByTimeAsync(1000) })
    expect(onSend).toHaveBeenCalledWith("Explain how the code works")
    expect(screen.getByText("Sure thing.")).toBeInTheDocument()
  })
})
