import * as React from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Desktop3 } from "@/components/ballmac/blocks/desktop-3/desktop-3"

const actionLabels = () =>
  within(document.querySelector("[data-slot=desktop-3-actions] > div:last-child") as HTMLElement)
    .getAllByRole("button")
    .map((b) => b.textContent)

describe("Desktop3", () => {
  it("puts the default button last on macOS and first on Windows", () => {
    const { unmount } = render(<Desktop3 feel="macos" />)
    expect(actionLabels()).toEqual(["Remind Me Later", "Install Update"])
    unmount()
    render(<Desktop3 feel="windows" />)
    expect(actionLabels()).toEqual(["Install now", "Remind me later"])
  })

  it("runs the flow: install reports progress, then offers to relaunch", async () => {
    const user = userEvent.setup()
    const onRelaunch = vi.fn()
    let finish!: () => void
    const onInstall = vi.fn((report: (p: number) => void) => new Promise<void>((r) => { report(0.5); finish = r }))
    render(<Desktop3 feel="macos" onInstall={onInstall} onRelaunch={onRelaunch} size={10_000_000} />)
    await user.click(screen.getByRole("button", { name: /Install Update/ }))
    expect(await screen.findByText("5.0 MB of 10.0 MB")).toBeInTheDocument()
    expect(screen.getByRole("progressbar")).toBeInTheDocument()
    finish()
    await user.click(await screen.findByRole("button", { name: /Install and Relaunch/ }))
    expect(onRelaunch).toHaveBeenCalled()
  })

  it("shows the error when install throws, and Try Again starts over", async () => {
    const user = userEvent.setup()
    const onInstall = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(undefined)
    render(<Desktop3 feel="macos" onInstall={onInstall} />)
    await user.click(screen.getByRole("button", { name: /Install Update/ }))
    expect(await screen.findByText("The update could not be downloaded")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Try Again" }))
    expect(await screen.findByRole("button", { name: /Install and Relaunch/ })).toBeInTheDocument()
  })

  it("passes the skipped version and says when it is up to date", async () => {
    const user = userEvent.setup()
    const onSkip = vi.fn()
    const { rerender } = render(<Desktop3 feel="macos" onSkip={onSkip} />)
    await user.click(screen.getByRole("button", { name: "Skip This Version" }))
    expect(onSkip).toHaveBeenCalledWith("2.5.0")
    rerender(<Desktop3 feel="macos" state="empty" />)
    expect(screen.getByRole("heading", { name: /Acme is up to date/ })).toBeInTheDocument()
  })
})
