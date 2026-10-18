import * as React from "react"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { Flags1 } from "@/components/ballmac/blocks/flags-1/flags-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

describe("Flags1", () => {
  it("names every switch for its flag and environment, and marks stale flags in words", () => {
    render(<Flags1 />)
    expect(screen.getByRole("switch", { name: "checkout-v2 in Production" })).toBeChecked()
    expect(screen.getByRole("switch", { name: "ai-summaries in Production" })).not.toBeChecked()
    expect(within(screen.getByRole("list")).getAllByText("Ready to remove")).toHaveLength(2)
  })

  it("changes a non-production environment at once", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn().mockResolvedValue(undefined)
    render(<Flags1 onChange={onChange} />)
    await user.click(screen.getByRole("switch", { name: "bulk-export in Staging" }))
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ key: "bulk-export", enabled: expect.objectContaining({ staging: true }) }))
    expect(screen.queryByRole("alertdialog")).toBeNull()
  })

  it("asks before changing production and says who it affects", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn().mockResolvedValue(undefined)
    render(<Flags1 onChange={onChange} />)
    await user.click(screen.getByRole("switch", { name: "ai-summaries in Production" }))
    const dialog = await screen.findByRole("alertdialog")
    expect(dialog).toHaveTextContent("ai-summaries will switch on in Production for 0% of users")
    expect(onChange).not.toHaveBeenCalled()
    await user.click(within(dialog).getByRole("button", { name: "Switch on" }))
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ enabled: expect.objectContaining({ production: true }) }))
  })

  it("warns that switching off loses it for users, and returns focus", async () => {
    const user = userEvent.setup()
    render(<Flags1 />)
    const sw = screen.getByRole("switch", { name: "checkout-v2 in Production" })
    await user.click(sw)
    const dialog = await screen.findByRole("alertdialog")
    expect(dialog).toHaveTextContent("25% of users")
    expect(dialog).toHaveTextContent("lose it")
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }))
    await waitFor(() => expect(sw).toHaveFocus())
    expect(sw).toBeChecked()
  })

  it("undoes a change that fails to save and says why", async () => {
    const user = userEvent.setup()
    render(<Flags1 onChange={() => Promise.reject(new Error("The flag service is unavailable."))} />)
    await user.click(screen.getByRole("switch", { name: "bulk-export in Staging" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("The flag service is unavailable.")
    expect(screen.getByRole("switch", { name: "bulk-export in Staging" })).not.toBeChecked()
  })

  it("changes the rollout only after Save, with a labelled slider", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn().mockResolvedValue(undefined)
    render(<Flags1 onChange={onChange} defaultOpenId="f1" />)
    const slider = screen.getByRole("slider", { name: "Production rollout" })
    slider.focus()
    await user.keyboard("{ArrowRight}")
    expect(slider).toHaveAttribute("aria-valuenow", "30")
    expect(onChange).not.toHaveBeenCalled()
    await user.click(screen.getByRole("button", { name: "Save rollout" }))
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ key: "checkout-v2", rollout: 30 }))
  })

  it("filters, searches and counts", async () => {
    const user = userEvent.setup()
    render(<Flags1 />)
    expect(screen.getByText("6 flags")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /Ready to remove/ }))
    expect(screen.getByText("2 flags")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /^All/ }))
    await user.type(screen.getByRole("searchbox", { name: "Search flags" }), "zzzz")
    expect(screen.getByText("No flags match")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Clear filters" }))
    expect(screen.getByText("6 flags")).toBeInTheDocument()
  })

  it("shows loading, empty and error states", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const { rerender } = render(<Flags1 state="loading" />)
    expect(screen.getByRole("status")).toBeInTheDocument()
    rerender(<Flags1 state="empty" />)
    expect(screen.getByRole("heading", { name: "No flags yet" })).toBeInTheDocument()
    rerender(<Flags1 state="error" onRetry={onRetry} />)
    await user.click(screen.getByRole("button", { name: /try again/i }))
    expect(onRetry).toHaveBeenCalled()
  })
})
