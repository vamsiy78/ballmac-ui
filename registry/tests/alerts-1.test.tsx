import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Alerts1 } from "@/components/ballmac/blocks/alerts-1/alerts-1"

describe("Alerts1", () => {
  it("lists firing rules first, critical before warning, and writes status in words", () => {
    render(<Alerts1 />)
    const items = screen.getAllByRole("listitem")
    expect(items[0]).toHaveTextContent("Checkout error rate")
    expect(items[0]).toHaveTextContent("Firing since 14:02")
    expect(items[1]).toHaveTextContent("Queue depth: email")
    expect(screen.getByText(/2 rules are firing\./)).toBeInTheDocument()
    expect(screen.getByText(/Muted until tomorrow 09:00/)).toBeInTheDocument()
    expect(screen.getAllByText("Switched off").length).toBeGreaterThan(0)
  })

  it("filters with counts, and the switched-off ones have no actions", async () => {
    const user = userEvent.setup()
    render(<Alerts1 />)
    await user.click(screen.getByRole("button", { name: /^Switched off 1/ }))
    const item = screen.getByRole("listitem")
    expect(item).toHaveTextContent("Signup drop")
    expect(within(item).queryByRole("button", { name: /Mute/ })).toBeNull()
  })

  it("mutes for the chosen time, shows it muted, then unmutes", async () => {
    const user = userEvent.setup()
    const onMute = vi.fn().mockResolvedValue(undefined)
    render(<Alerts1 onMute={onMute} />)
    await user.selectOptions(screen.getByLabelText("Mute API latency (p95) for"), "4")
    await user.click(screen.getByRole("button", { name: "Mute API latency (p95)" }))
    expect(onMute).toHaveBeenCalledWith(expect.objectContaining({ id: "a2" }), 4)
    expect(await screen.findByText("API latency (p95) is muted for 4 hours.")).toBeInTheDocument()
    await user.click(screen.getAllByRole("button", { name: "Unmute" })[0])
    expect(onMute).toHaveBeenLastCalledWith(expect.objectContaining({ id: expect.any(String) }), 0)
  })

  it("sends a test and says where", async () => {
    const user = userEvent.setup()
    const onTest = vi.fn().mockResolvedValue(undefined)
    render(<Alerts1 onTest={onTest} />)
    await user.click(screen.getByRole("button", { name: "Send a test for Certificate expires soon" }))
    expect(onTest).toHaveBeenCalledWith(expect.objectContaining({ id: "a5" }))
    expect(await screen.findByText("A test was sent to Email.")).toBeInTheDocument()
  })

  it("goes back and says why when a switch fails", async () => {
    const user = userEvent.setup()
    render(<Alerts1 onToggle={() => Promise.reject(new Error("The rules service is unreachable."))} />)
    await user.click(screen.getByRole("switch", { name: "API latency (p95) is on" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("The rules service is unreachable.")
    expect(screen.getByRole("switch", { name: "API latency (p95) is on" })).toBeChecked()
  })

  it("shows loading, empty and error states", () => {
    const { rerender } = render(<Alerts1 state="loading" />)
    expect(screen.getByRole("status")).toHaveTextContent("Loading alert rules")
    rerender(<Alerts1 rules={[]} />)
    expect(screen.getByText("No alert rules yet")).toBeInTheDocument()
    rerender(<Alerts1 state="error" onRetry={() => {}} />)
    expect(screen.getByRole("alert")).toHaveTextContent("Alert rules could not be loaded")
  })
})
