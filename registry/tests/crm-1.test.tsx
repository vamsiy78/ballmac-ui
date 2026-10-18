import * as React from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { Crm1 } from "@/components/ballmac/blocks/crm-1/crm-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

describe("Crm1", () => {
  it("says the follow-up is overdue by how many days, from the day passed in", () => {
    render(<Crm1 today="2026-10-18" locale="en-GB" />)
    expect(screen.getByText("Overdue by 2 days")).toBeInTheDocument()
    expect(screen.getByText("16 October 2026")).toBeInTheDocument()
  })

  it("says due today and due in N days", () => {
    const { rerender } = render(<Crm1 today="2026-10-16" />)
    expect(screen.getByText("Due today")).toBeInTheDocument()
    rerender(<Crm1 today="2026-10-13" />)
    expect(screen.getByText("Due in 3 days")).toBeInTheDocument()
  })

  it("works out when you last spoke", () => {
    render(<Crm1 today="2026-10-18" />)
    expect(screen.getByText("9 days ago")).toBeInTheDocument()
  })

  it("moves the stage, reports it, and says which stage is current", async () => {
    const user = userEvent.setup()
    const onStageChange = vi.fn()
    render(<Crm1 onStageChange={onStageChange} />)
    expect(screen.getByRole("button", { name: /Proposal, current stage/ })).toHaveAttribute("aria-current", "step")
    expect(screen.getByRole("button", { name: /Lead, done/ })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /Negotiation/ }))
    expect(onStageChange).toHaveBeenCalledWith(3)
    expect(screen.getByRole("button", { name: /Negotiation, current stage/ })).toBeInTheDocument()
  })

  it("shows the timeline newest first", () => {
    render(<Crm1 />)
    const items = within(screen.getByRole("heading", { name: "Activity" }).closest("div")!).getAllByRole("listitem")
    expect(items[0]).toHaveTextContent("Demo for the operations team")
    expect(items.at(-1)).toHaveTextContent("Met at the logistics summit")
  })

  it("logs an activity of the chosen type at the top, and tells the host", async () => {
    const user = userEvent.setup()
    const onLog = vi.fn().mockResolvedValue(undefined)
    render(<Crm1 onLog={onLog} today="2026-10-18" />)
    await user.click(screen.getByRole("radio", { name: "Call" }))
    await user.type(screen.getByLabelText("Write the call"), "Agreed to a start date.")
    await user.click(screen.getByRole("button", { name: "Log call" }))
    expect(onLog).toHaveBeenCalledWith({ kind: "call", summary: "Agreed to a start date.", date: "2026-10-18" })
    expect(screen.getByText("Agreed to a start date.")).toBeInTheDocument()
  })

  it("keeps a failed activity with Not saved and Retry", async () => {
    const user = userEvent.setup()
    const onLog = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValue(undefined)
    render(<Crm1 onLog={onLog} />)
    await user.type(screen.getByLabelText("Write the note"), "Will call back")
    await user.click(screen.getByRole("button", { name: "Log note" }))
    const alert = await screen.findByRole("alert")
    expect(alert).toHaveTextContent("Not saved.")
    await user.click(within(alert).getByRole("button", { name: "Retry" }))
    await screen.findByText("Will call back")
    expect(onLog).toHaveBeenCalledTimes(2)
  })

  it("changes the follow-up date and reports it", async () => {
    const user = userEvent.setup()
    const onFollowUp = vi.fn()
    render(<Crm1 today="2026-10-18" onFollowUp={onFollowUp} />)
    const field = screen.getByLabelText("Next follow-up")
    await user.clear(field)
    await user.type(field, "2026-10-25")
    expect(onFollowUp).toHaveBeenLastCalledWith("2026-10-25")
    expect(screen.getByText("Due in 7 days")).toBeInTheDocument()
  })

  it("shows loading, empty and error states", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const { rerender } = render(<Crm1 state="loading" />)
    expect(screen.getByRole("status")).toBeInTheDocument()
    rerender(<Crm1 state="empty" />)
    expect(screen.getByRole("heading", { name: "This contact is not here" })).toBeInTheDocument()
    rerender(<Crm1 state="error" onRetry={onRetry} />)
    await user.click(screen.getByRole("button", { name: /try again/i }))
    expect(onRetry).toHaveBeenCalled()
  })
})
