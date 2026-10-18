import * as React from "react"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { Integrations1 } from "@/components/ballmac/blocks/integrations-1/integrations-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

describe("Integrations1", () => {
  it("lists every integration and shows what is connected in words", () => {
    render(<Integrations1 />)
    expect(screen.getByRole("button", { name: /Slack.*Connected/ })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /GitHub/ })).not.toHaveTextContent("Connected")
  })

  it("filters by category and keeps the counts honest", async () => {
    const user = userEvent.setup()
    render(<Integrations1 />)
    await user.click(screen.getByRole("button", { name: /^Developer/ }))
    expect(screen.getByRole("button", { name: /^Developer/ })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("button", { name: /GitHub/ })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /Slack/ })).toBeNull()
    await user.type(screen.getByRole("searchbox", { name: "Search integrations" }), "linear")
    expect(screen.getByRole("button", { name: /^All 1$/ })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Linear/ })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /GitHub/ })).toBeNull()
  })

  it("says nothing matches and clears the filters", async () => {
    const user = userEvent.setup()
    render(<Integrations1 />)
    await user.type(screen.getByRole("searchbox", { name: "Search integrations" }), "zzzz")
    expect(screen.getByText(/Nothing matches/)).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Clear filters" }))
    expect(screen.getByRole("button", { name: /GitHub/ })).toBeInTheDocument()
  })

  it("connects from the sheet and says so", async () => {
    const user = userEvent.setup()
    const onConnect = vi.fn().mockResolvedValue(undefined)
    render(<Integrations1 onConnect={onConnect} />)
    await user.click(screen.getByRole("button", { name: /GitHub/ }))
    const sheet = await screen.findByRole("dialog")
    expect(within(sheet).getByText("Close on merge")).toBeInTheDocument()
    await user.click(within(sheet).getByRole("button", { name: "Connect GitHub" }))
    expect(onConnect).toHaveBeenCalledWith(expect.objectContaining({ id: "github" }))
    expect(await within(sheet).findByRole("button", { name: "Disconnect" })).toBeInTheDocument()
  })

  it("shows a failed connection in the sheet and changes nothing", async () => {
    const user = userEvent.setup()
    render(<Integrations1 defaultOpenId="stripe" onConnect={() => Promise.reject(new Error("Stripe asked us to wait a minute."))} />)
    const sheet = await screen.findByRole("dialog")
    await user.click(within(sheet).getByRole("button", { name: "Connect Stripe" }))
    expect(await within(sheet).findByRole("alert")).toHaveTextContent("wait a minute")
    expect(within(sheet).getByRole("button", { name: "Connect Stripe" })).toBeEnabled()
  })

  it("returns focus to the card when the sheet closes", async () => {
    const user = userEvent.setup()
    render(<Integrations1 />)
    const card = screen.getByRole("button", { name: /Zoom/ })
    await user.click(card)
    await screen.findByRole("dialog")
    await user.keyboard("{Escape}")
    await waitFor(() => expect(card).toHaveFocus())
  })

  it("shows loading, empty and error states", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const { rerender } = render(<Integrations1 state="loading" />)
    expect(screen.getByRole("status")).toBeInTheDocument()
    rerender(<Integrations1 state="empty" emptyState={{ title: "Nothing here yet" }} />)
    expect(screen.getByRole("heading", { name: "Nothing here yet" })).toBeInTheDocument()
    rerender(<Integrations1 state="error" onRetry={onRetry} />)
    await user.click(screen.getByRole("button", { name: /try again/i }))
    expect(onRetry).toHaveBeenCalled()
  })
})
