import * as React from "react"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { Tickets1 } from "@/components/ballmac/blocks/tickets-1/tickets-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

describe("Tickets1", () => {
  it("shows the reply timer in words, and how late when it is late", () => {
    const { rerender } = render(<Tickets1 now="2026-10-18T10:42:00Z" />)
    expect(screen.getByRole("status")).toHaveTextContent("Reply due in 48 min")
    rerender(<Tickets1 now="2026-10-18T12:05:00Z" />)
    expect(screen.getByRole("status")).toHaveTextContent("Reply is 35 min late")
  })

  it("hides the timer once the agent has answered last", () => {
    const t = { ...({} as object) }
    void t
    render(
      <Tickets1
        ticket={{
          id: "x", number: "#1", subject: "S", status: "open", priority: "normal", assignee: "Sam Okafor", replyDueAt: "2026-10-18T11:30:00Z",
          requester: { name: "A B", email: "a@b.co" },
          messages: [{ id: "1", from: "customer", author: "A B", time: "t", body: "Hi" }, { id: "2", from: "agent", author: "Sam Okafor", time: "t", body: "Hello" }],
        }}
      />
    )
    expect(screen.queryByText(/Reply due/)).toBeNull()
  })

  it("marks internal notes in words so they are never mistaken for replies", () => {
    render(<Tickets1 />)
    expect(screen.getByText("Internal note, only your team sees this")).toBeInTheDocument()
  })

  it("sends a reply, shows it at once, and moves the status to waiting", async () => {
    const user = userEvent.setup()
    const onSend = vi.fn().mockResolvedValue(undefined)
    const onStatusChange = vi.fn()
    render(<Tickets1 onSend={onSend} onStatusChange={onStatusChange} />)
    await user.type(screen.getByLabelText("Write a reply to the customer"), "Receipt is on its way.")
    await user.click(screen.getByRole("button", { name: /Send reply/ }))
    expect(onSend).toHaveBeenCalledWith({ kind: "reply", body: "Receipt is on its way." })
    expect(screen.getByText("Receipt is on its way.")).toBeInTheDocument()
    await waitFor(() => expect(onStatusChange).toHaveBeenCalledWith("pending"))
    expect(screen.getByLabelText("Write a reply to the customer")).toHaveValue("")
  })

  it("adds an internal note without changing the status", async () => {
    const user = userEvent.setup()
    const onSend = vi.fn().mockResolvedValue(undefined)
    const onStatusChange = vi.fn()
    render(<Tickets1 onSend={onSend} onStatusChange={onStatusChange} />)
    await user.click(screen.getByRole("tab", { name: "Internal note" }))
    expect(screen.getByText("Not sent to the customer")).toBeInTheDocument()
    await user.type(screen.getByLabelText("Write an internal note"), "Will refund tomorrow")
    await user.click(screen.getByRole("button", { name: /Add note/ }))
    expect(onSend).toHaveBeenCalledWith({ kind: "note", body: "Will refund tomorrow" })
    expect(onStatusChange).not.toHaveBeenCalled()
  })

  it("keeps a failed message with Not sent and Retry, and retries it", async () => {
    const user = userEvent.setup()
    const onSend = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValue(undefined)
    render(<Tickets1 onSend={onSend} />)
    await user.type(screen.getByLabelText("Write a reply to the customer"), "Hello again")
    await user.click(screen.getByRole("button", { name: /Send reply/ }))
    const alert = await screen.findByRole("alert")
    expect(alert).toHaveTextContent("Not sent.")
    await user.click(within(alert).getByRole("button", { name: /Retry/ }))
    await waitFor(() => expect(screen.queryByRole("alert")).toBeNull())
    expect(onSend).toHaveBeenCalledTimes(2)
  })

  it("inserts a canned reply into the draft without replacing it", async () => {
    const user = userEvent.setup()
    render(<Tickets1 />)
    await user.type(screen.getByLabelText("Write a reply to the customer"), "Hi Hannah,")
    await user.click(screen.getByRole("combobox", { name: "Insert a canned reply" }))
    await user.click(await screen.findByRole("option", { name: "Refund started" }))
    const field = screen.getByLabelText("Write a reply to the customer") as HTMLTextAreaElement
    expect(field.value.startsWith("Hi Hannah,")).toBe(true)
    expect(field.value).toContain("I have started a full refund")
  })

  it("tells the host about status, priority and assignee changes", async () => {
    const user = userEvent.setup()
    const onPriorityChange = vi.fn()
    const onAssign = vi.fn()
    render(<Tickets1 onPriorityChange={onPriorityChange} onAssign={onAssign} />)
    await user.click(screen.getByRole("combobox", { name: "Priority" }))
    await user.click(await screen.findByRole("option", { name: "Urgent" }))
    expect(onPriorityChange).toHaveBeenCalledWith("urgent")
    await user.click(screen.getByRole("combobox", { name: "Assigned to" }))
    await user.click(await screen.findByRole("option", { name: "Mia Laurent" }))
    expect(onAssign).toHaveBeenCalledWith("Mia Laurent")
  })

  it("shows loading, empty and error states", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const { rerender } = render(<Tickets1 state="loading" />)
    expect(screen.getByRole("status")).toBeInTheDocument()
    rerender(<Tickets1 state="empty" />)
    expect(screen.getByRole("heading", { name: "This ticket is not here" })).toBeInTheDocument()
    rerender(<Tickets1 state="error" onRetry={onRetry} />)
    await user.click(screen.getByRole("button", { name: /try again/i }))
    expect(onRetry).toHaveBeenCalled()
  })
})
