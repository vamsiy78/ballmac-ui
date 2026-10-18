import * as React from "react"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { Webhooks1 } from "@/components/ballmac/blocks/webhooks-1/webhooks-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

describe("Webhooks1", () => {
  it("works out each endpoint's health from its recent deliveries, in words", () => {
    render(<Webhooks1 />)
    const list = screen.getByRole("list", { name: "Endpoints" })
    // Endpoint 1: 4 of 6 succeeded (67%) is Some failing. Endpoint 2: 0 of 4 is Failing. Endpoint 3 is disabled.
    expect(within(list).getByText("Some failing")).toBeInTheDocument()
    expect(within(list).getByText("Failing")).toBeInTheDocument()
    expect(within(list).getByText("Disabled")).toBeInTheDocument()
  })

  it("chooses an endpoint and shows its events and masked secret", async () => {
    const user = userEvent.setup()
    render(<Webhooks1 />)
    await user.click(screen.getByRole("button", { name: /slack-relay/ }))
    expect(screen.getByRole("heading", { name: "https://hooks.slack-relay.io/T0482/B9921" })).toBeInTheDocument()
    expect(screen.getByText("customer.created", { selector: "li" })).toBeInTheDocument()
    expect(screen.getByText(/whsec_/)).toHaveTextContent("•")
    await user.click(screen.getByRole("button", { name: "Show the secret" }))
    expect(screen.getByText(/whsec_c1a29b/)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Hide the secret" })).toHaveAttribute("aria-pressed", "true")
  })

  it("filters to failed deliveries", async () => {
    const user = userEvent.setup()
    render(<Webhooks1 />)
    expect(screen.getAllByRole("button", { expanded: false }).length).toBeGreaterThanOrEqual(6)
    await user.click(screen.getByRole("checkbox", { name: "Failed only" }))
    expect(screen.queryByText("200")).toBeNull()
    expect(screen.getAllByText("500")).toHaveLength(2)
  })

  it("opens a delivery to show payload and response, and resends it", async () => {
    const user = userEvent.setup()
    const onResend = vi.fn().mockResolvedValue(undefined)
    render(<Webhooks1 onResend={onResend} defaultOpenDeliveryId="d2order.paid500" />)
    expect(screen.getByText("Internal Server Error")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Send again" }))
    expect(onResend).toHaveBeenCalledWith(expect.objectContaining({ id: "w1" }), expect.objectContaining({ id: "d2order.paid500" }))
    expect(await screen.findByText(/Sent again\. Check the log/)).toBeInTheDocument()
  })

  it("shows a failed resend in place", async () => {
    const user = userEvent.setup()
    render(<Webhooks1 onResend={() => Promise.reject(new Error("Endpoint is disabled."))} defaultOpenDeliveryId="d2order.paid500" />)
    await user.click(screen.getByRole("button", { name: "Send again" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("Endpoint is disabled.")
  })

  it("asks for a secure address and at least one event, then adds the endpoint", async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn().mockResolvedValue(undefined)
    render(<Webhooks1 onCreate={onCreate} />)
    await user.click(screen.getByRole("button", { name: "Add endpoint" }))
    const dialog = await screen.findByRole("dialog")
    await user.type(within(dialog).getByLabelText("Endpoint address"), "http://insecure.dev/x")
    await user.click(within(dialog).getByRole("button", { name: "Add endpoint" }))
    expect(within(dialog).getByRole("alert")).toHaveTextContent("secure address")
    await user.clear(within(dialog).getByLabelText("Endpoint address"))
    await user.type(within(dialog).getByLabelText("Endpoint address"), "https://new.example.com/hooks")
    await user.click(within(dialog).getByRole("button", { name: "Add endpoint" }))
    expect(within(dialog).getByRole("alert")).toHaveTextContent("Choose at least one event")
    await user.click(within(dialog).getByRole("checkbox", { name: "order.paid" }))
    await user.click(within(dialog).getByRole("button", { name: "Add endpoint" }))
    expect(onCreate).toHaveBeenCalledWith({ url: "https://new.example.com/hooks", events: ["order.paid"] })
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    expect(screen.getByRole("heading", { name: "https://new.example.com/hooks" })).toBeInTheDocument()
  })

  it("returns focus to the Add endpoint button when the dialog closes", async () => {
    const user = userEvent.setup()
    render(<Webhooks1 />)
    const add = screen.getByRole("button", { name: "Add endpoint" })
    await user.click(add)
    await screen.findByRole("dialog")
    await user.keyboard("{Escape}")
    await waitFor(() => expect(add).toHaveFocus())
  })

  it("tells the host when an endpoint is switched off", async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(<Webhooks1 onToggle={onToggle} />)
    await user.click(screen.getByRole("switch", { name: /Send events to https:\/\/api.northwind.com/ }))
    expect(onToggle).toHaveBeenCalledWith(expect.objectContaining({ id: "w1" }), false)
  })

  it("shows loading, empty and error states", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const { rerender } = render(<Webhooks1 state="loading" />)
    expect(screen.getByRole("status")).toBeInTheDocument()
    rerender(<Webhooks1 state="empty" />)
    expect(screen.getByRole("button", { name: "Add an endpoint" })).toBeInTheDocument()
    rerender(<Webhooks1 state="error" onRetry={onRetry} />)
    await user.click(screen.getByRole("button", { name: /try again/i }))
    expect(onRetry).toHaveBeenCalled()
  })
})
