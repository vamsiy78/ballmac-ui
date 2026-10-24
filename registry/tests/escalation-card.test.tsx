import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { EscalationCard } from "@/components/ballmac/escalation-card"

const base = { customer: "Maria Lopez", channel: "Chat", reason: "Over the refund limit." }

describe("EscalationCard", () => {
  it("is an article named for the customer, with how they seem to feel and how long they have waited in words", () => {
    render(<EscalationCard {...base} sentiment="frustrated" waiting="4 min" />)
    expect(screen.getByRole("article", { name: "Maria Lopez" })).toBeInTheDocument()
    expect(screen.getByText("Frustrated")).toBeInTheDocument()
    expect(screen.getByText("Seems")).toBeInTheDocument()
    expect(screen.getByText("Waiting 4 min")).toBeInTheDocument()
    expect(screen.getByText("Over the refund limit.")).toBeInTheDocument()
  })
  it("shows the summary and the last messages, and leaves out what it is not given", () => {
    const { rerender } = render(<EscalationCard {...base} summary={["Order A-9914"]} messages={[{ from: "customer", text: "Help.", time: "2:09 pm" }]} />)
    expect(screen.getByRole("region", { name: "What the agent understood" })).toHaveTextContent("Order A-9914")
    expect(screen.getByRole("region", { name: "Last messages" })).toHaveTextContent("Maria Lopez · 2:09 pm")
    rerender(<EscalationCard {...base} />)
    expect(screen.queryByRole("region", { name: "What the agent understood" })).toBeNull()
    expect(screen.queryByRole("textbox")).toBeNull()
  })
  it("lets the person edit the suggested reply and sends what they wrote", async () => {
    const user = userEvent.setup()
    const onSendReply = vi.fn().mockResolvedValue(undefined)
    render(<EscalationCard {...base} suggestedReply="Hello Maria." onSendReply={onSendReply} />)
    const box = screen.getByLabelText("Suggested reply, edit before sending")
    expect(box).toHaveValue("Hello Maria.")
    await user.clear(box)
    await user.type(box, "Hi Maria, a refund is on its way.")
    await user.click(screen.getByRole("button", { name: "Send reply" }))
    expect(onSendReply).toHaveBeenCalledWith("Hi Maria, a refund is on its way.")
    expect(await screen.findByText("Reply sent to Maria Lopez.")).toBeInTheDocument()
  })
  it("does not send an empty reply", async () => {
    const user = userEvent.setup()
    render(<EscalationCard {...base} suggestedReply="Draft." />)
    await user.clear(screen.getByLabelText("Suggested reply, edit before sending"))
    expect(screen.getByRole("button", { name: "Send reply" })).toBeDisabled()
  })
  it("takes over and then closes the actions, or reports a failure plainly", async () => {
    const user = userEvent.setup()
    const onTakeOver = vi.fn().mockResolvedValue(undefined)
    const { unmount } = render(<EscalationCard {...base} onTakeOver={onTakeOver} />)
    await user.click(screen.getByRole("button", { name: "Take over" }))
    expect(onTakeOver).toHaveBeenCalled()
    expect(await screen.findByText("You have taken over from the agent.")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Take over" })).toBeNull()
    unmount()
    render(<EscalationCard {...base} onSnooze={() => Promise.reject(new Error("The inbox is unavailable."))} />)
    await user.click(screen.getByRole("button", { name: "Snooze" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("The inbox is unavailable.")
    expect(screen.getByRole("button", { name: "Take over" })).toBeInTheDocument()
  })
})

describe("EscalationCard time-to-reply meter", () => {
  it("says how long is left and fills as the wait grows", () => {
    render(<EscalationCard {...base} waitedMinutes={2} slaMinutes={5} />)
    const meter = screen.getByRole("meter", { name: "Time to reply" })
    expect(meter).toHaveAttribute("aria-valuenow", "2")
    expect(meter).toHaveAttribute("aria-valuemax", "5")
    expect(screen.getByText("3 min left to reply")).toBeInTheDocument()
  })

  it("says how late it is once the target has passed, and stays full", () => {
    render(<EscalationCard {...base} waitedMinutes={8} slaMinutes={5} />)
    expect(screen.getByText("Late by 3 min")).toBeInTheDocument()
    expect(screen.getByRole("meter", { name: "Time to reply" })).toHaveAttribute("aria-valuenow", "5")
  })

  it("has no meter without both numbers", () => {
    render(<EscalationCard {...base} waitedMinutes={2} />)
    expect(screen.queryByRole("meter")).not.toBeInTheDocument()
  })
})
