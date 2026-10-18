import * as React from "react"
import { act, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"

import { Settings6 } from "@/components/ballmac/blocks/settings-6/settings-6"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})
afterEach(() => vi.useRealTimers())

describe("Settings6", () => {
  it("requests an export of the chosen data in the chosen format", async () => {
    const user = userEvent.setup()
    const onRequestExport = vi.fn().mockResolvedValue(undefined)
    render(<Settings6 onRequestExport={onRequestExport} />)
    await user.click(screen.getByRole("checkbox", { name: /Billing history/ }))
    await user.click(screen.getByRole("radio", { name: "CSV" }))
    await user.click(screen.getByRole("button", { name: "Request export" }))
    expect(onRequestExport).toHaveBeenCalledWith({ scope: ["profile", "projects", "billing"], format: "csv" })
  })

  it("will not request nothing, and says why", async () => {
    const user = userEvent.setup()
    render(<Settings6 />)
    await user.click(screen.getByRole("checkbox", { name: /Profile and settings/ }))
    await user.click(screen.getByRole("checkbox", { name: /Projects and files/ }))
    expect(screen.getByRole("button", { name: "Request export" })).toBeDisabled()
    expect(screen.getByText("Choose at least one thing to include.")).toBeInTheDocument()
  })

  it("shows a failed request in place", async () => {
    const user = userEvent.setup()
    render(<Settings6 onRequestExport={() => Promise.reject(new Error("You can only export once an hour."))} />)
    await user.click(screen.getByRole("button", { name: "Request export" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("once an hour")
  })

  it("simulates a job from preparing to ready when there is no server", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<Settings6 />)
    await user.click(screen.getByRole("button", { name: "Request export" }))
    expect(screen.getByRole("progressbar", { name: /Preparing/ })).toBeInTheDocument()
    await act(async () => {
      vi.advanceTimersByTime(700 * 7)
    })
    await waitFor(() => expect(screen.queryByRole("progressbar")).toBeNull())
    expect(screen.getAllByRole("button", { name: "Download" })).toHaveLength(2)
  })

  it("lets a ready export be downloaded", async () => {
    const user = userEvent.setup()
    const onDownload = vi.fn()
    render(<Settings6 onDownload={onDownload} />)
    await user.click(screen.getByRole("button", { name: "Download" }))
    expect(onDownload).toHaveBeenCalledWith(expect.objectContaining({ id: "e2" }))
  })

  it("deletes only after the email is typed, then offers a way back", async () => {
    const user = userEvent.setup()
    const onDeleteAccount = vi.fn().mockResolvedValue(undefined)
    const onCancelDeletion = vi.fn()
    render(<Settings6 email="priya@acme.com" onDeleteAccount={onDeleteAccount} onCancelDeletion={onCancelDeletion} />)
    await user.click(screen.getByRole("button", { name: "Delete account" }))
    const dialog = await screen.findByRole("alertdialog")
    const confirm = within(dialog).getByRole("button", { name: "Delete account" })
    expect(confirm).toBeDisabled()
    await user.type(within(dialog).getByLabelText("Type your email to confirm"), "priya@acme.com")
    expect(confirm).toBeEnabled()
    await user.click(confirm)
    expect(onDeleteAccount).toHaveBeenCalled()
    expect(await screen.findByText(/scheduled for deletion/)).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Keep my account" }))
    expect(onCancelDeletion).toHaveBeenCalled()
    expect(screen.queryByText(/scheduled for deletion/)).toBeNull()
  })

  it("returns focus to the trigger when the dialog is cancelled", async () => {
    const user = userEvent.setup()
    render(<Settings6 />)
    const trigger = screen.getByRole("button", { name: "Delete account" })
    await user.click(trigger)
    await user.click(within(await screen.findByRole("alertdialog")).getByRole("button", { name: "Keep my account" }))
    await waitFor(() => expect(trigger).toHaveFocus())
  })

  it("keeps the dialog open and says so when deleting fails", async () => {
    const user = userEvent.setup()
    render(<Settings6 email="a@b.co" onDeleteAccount={() => Promise.reject(new Error("Try again in a minute."))} />)
    await user.click(screen.getByRole("button", { name: "Delete account" }))
    const dialog = await screen.findByRole("alertdialog")
    await user.type(within(dialog).getByLabelText("Type your email to confirm"), "a@b.co")
    await user.click(within(dialog).getByRole("button", { name: "Delete account" }))
    expect(await within(dialog).findByRole("alert")).toHaveTextContent("Try again in a minute.")
  })

  it("reports retention and analytics choices", async () => {
    const user = userEvent.setup()
    const onAnalyticsChange = vi.fn()
    render(<Settings6 onAnalyticsChange={onAnalyticsChange} />)
    await user.click(screen.getByRole("switch", { name: "Share anonymous usage data" }))
    expect(onAnalyticsChange).toHaveBeenCalledWith(false)
  })

  it("shows loading and error states", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const { rerender } = render(<Settings6 state="loading" />)
    expect(screen.getByRole("status")).toBeInTheDocument()
    rerender(<Settings6 state="error" onRetry={onRetry} />)
    await user.click(screen.getByRole("button", { name: /try again/i }))
    expect(onRetry).toHaveBeenCalled()
  })
})
