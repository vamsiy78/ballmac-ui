import * as React from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { Dev1 } from "@/components/ballmac/blocks/dev-1/dev-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

describe("Dev1", () => {
  it("summarises usage in words and in a table for screen readers", () => {
    render(<Dev1 />)
    expect(screen.getByRole("img", { name: /requests in 14 days. The busiest day was Oct 17/ })).toBeInTheDocument()
    expect(screen.getByRole("table", { name: "Requests per day" })).toBeInTheDocument()
    expect(screen.getByText("99.1%")).toBeInTheDocument()
  })

  it("creates a key, shows the secret once, and keeps only its last four characters", async () => {
    const user = userEvent.setup()
    const onCreateKey = vi.fn().mockResolvedValue({ id: "k9", secret: "sk_test_ABCDEFGHIJ1234wxyz" })
    render(<Dev1 onCreateKey={onCreateKey} />)
    await user.click(screen.getByRole("button", { name: "Create key" }))
    await user.type(screen.getByLabelText("Name"), "Worker")
    await user.click(screen.getByRole("radio", { name: "Write" }))
    await user.click(screen.getAllByRole("button", { name: "Create key" }).at(-1)!)
    expect(onCreateKey).toHaveBeenCalledWith({ name: "Worker", scope: "write", env: "test" })
    const banner = await screen.findByRole("alert")
    expect(banner).toHaveTextContent("sk_test_ABCDEFGHIJ1234wxyz")
    expect(banner).toHaveTextContent("only time")
    expect(screen.getByText("sk_test_••••••••wxyz")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "I have saved it" }))
    expect(screen.queryByText("sk_test_ABCDEFGHIJ1234wxyz")).toBeNull()
  })

  it("asks for a name and shows a failure from the server", async () => {
    const user = userEvent.setup()
    render(<Dev1 onCreateKey={() => Promise.reject(new Error("You have reached the limit of 5 keys."))} />)
    await user.click(screen.getByRole("button", { name: "Create key" }))
    await user.click(screen.getAllByRole("button", { name: "Create key" }).at(-1)!)
    expect(screen.getByRole("alert")).toHaveTextContent("Give the key a name")
    await user.type(screen.getByLabelText("Name"), "Extra")
    await user.click(screen.getAllByRole("button", { name: "Create key" }).at(-1)!)
    expect(await screen.findByText("You have reached the limit of 5 keys.")).toBeInTheDocument()
  })

  it("revokes only after confirming", async () => {
    const user = userEvent.setup()
    const onRevokeKey = vi.fn()
    render(<Dev1 onRevokeKey={onRevokeKey} />)
    await user.click(screen.getByRole("button", { name: "Revoke CI deploy" }))
    expect(onRevokeKey).not.toHaveBeenCalled()
    await user.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Revoke key" }))
    expect(onRevokeKey).toHaveBeenCalledWith("k3")
    expect(screen.queryByText("CI deploy")).toBeNull()
  })

  it("switches to live mode with a warning and live key prefixes", async () => {
    const user = userEvent.setup()
    const onEnvChange = vi.fn()
    render(<Dev1 onEnvChange={onEnvChange} />)
    await user.click(screen.getByRole("radio", { name: /Live mode/ }))
    expect(onEnvChange).toHaveBeenCalledWith("live")
    expect(screen.getByRole("note")).toHaveTextContent("live mode")
    expect(screen.getByText("sk_live_••••••••a1b2")).toBeInTheDocument()
  })

  it("filters the log to errors and opens a request to show its response", async () => {
    const user = userEvent.setup()
    render(<Dev1 />)
    await user.click(screen.getByRole("radio", { name: /Errors 3/ }))
    const log = screen.getByRole("list", { name: "Requests" })
    expect(within(log).getAllByRole("listitem")).toHaveLength(3)
    await user.click(within(log).getByRole("button", { name: /\/v1\/refunds/ }))
    expect(screen.getByText(/charge_already_refunded/)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Copy as curl" })).toBeInTheDocument()
  })

  it("gives a ready curl command when there are no requests", () => {
    render(<Dev1 state="empty" />)
    expect(screen.getByText("No requests yet")).toBeInTheDocument()
    expect(screen.getByText(/curl https:\/\/api.acme.com\/v1\/charges/)).toBeInTheDocument()
  })
})
