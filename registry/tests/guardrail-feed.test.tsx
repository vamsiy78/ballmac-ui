import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { GuardrailFeed, type GuardEvent } from "@/components/ballmac/guardrail-feed"

const events: GuardEvent[] = [
  { id: "1", time: "2:14 pm", rule: "No emails", action: "redacted", target: "Reply 1", reason: "It quoted an email.", match: "a@b.com" },
  { id: "2", time: "2:13 pm", rule: "Refund limit", action: "blocked", target: "Refund tool", reason: "Over the limit." },
  { id: "3", time: "2:12 pm", rule: "On topic", action: "allowed", target: "Reply 3" },
]

describe("GuardrailFeed", () => {
  it("is a named section with every check, each action written as a word", () => {
    render(<GuardrailFeed events={events} />)
    expect(screen.getByRole("region", { name: "Guardrail activity" })).toBeInTheDocument()
    const list = screen.getByRole("list")
    expect(within(list).getAllByRole("listitem")).toHaveLength(3)
    expect(within(list).getByText("Redacted")).toBeInTheDocument()
    expect(within(list).getByText("Blocked")).toBeInTheDocument()
    expect(screen.getByText("3 checks shown")).toBeInTheDocument()
  })
  it("filters by action with counts, and disables an action with no events", async () => {
    const user = userEvent.setup()
    render(<GuardrailFeed events={events} />)
    expect(screen.getByRole("button", { name: /Flagged 0/ })).toBeDisabled()
    await user.click(screen.getByRole("button", { name: /Blocked 1/ }))
    expect(screen.getByRole("button", { name: /Blocked 1/ })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByText("1 checks shown")).toBeInTheDocument()
    expect(screen.queryByText("Reply 3")).toBeNull()
  })
  it("opens a row to show why and what matched, and only rows with detail can open", async () => {
    const user = userEvent.setup()
    render(<GuardrailFeed events={events} />)
    const first = screen.getByRole("button", { name: /No emails/ })
    expect(first).toHaveAttribute("aria-expanded", "false")
    await user.click(first)
    expect(first).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByText("It quoted an email.")).toBeInTheDocument()
    expect(screen.getByText("a@b.com")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /On topic/ })).toBeDisabled()
  })
  it("can start with a row open and shows an empty message when nothing matches", () => {
    const { rerender } = render(<GuardrailFeed events={events} defaultOpenId="2" />)
    expect(screen.getByText("Over the limit.")).toBeInTheDocument()
    rerender(<GuardrailFeed events={[]} />)
    expect(screen.getByText("Nothing here yet.")).toBeInTheDocument()
  })
})
