import * as React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Desktop5, type Desktop5Permission } from "@/components/ballmac/blocks/desktop-5/desktop-5"

const permissions: Desktop5Permission[] = [
  { id: "mic", title: "Microphone", description: "Records voice notes.", required: true, status: "prompt" },
  { id: "screen", title: "Screen recording", description: "Shares a window.", status: "denied", settingsPath: { macos: "Privacy & Security › Screen Recording", windows: "Privacy & security › Screenshots" } },
]

describe("Desktop5", () => {
  it("keeps Continue disabled until the required permission is allowed", async () => {
    const user = userEvent.setup()
    const onRequest = vi.fn().mockResolvedValue("granted")
    const onContinue = vi.fn()
    render(<Desktop5 feel="macos" permissions={permissions} onRequest={onRequest} onContinue={onContinue} />)
    const next = screen.getByRole("button", { name: "Continue" })
    expect(next).toBeDisabled()
    expect(screen.getByText(/Allow Microphone to continue/)).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Allow Microphone" }))
    expect(onRequest).toHaveBeenCalledWith("mic")
    expect(await screen.findByText("Allowed")).toBeInTheDocument()
    expect(next).toBeEnabled()
    await user.click(next)
    expect(onContinue).toHaveBeenCalled()
  })

  it("sends a denied permission to the right settings app, per platform", async () => {
    const user = userEvent.setup()
    const onOpenSettings = vi.fn()
    const { unmount } = render(<Desktop5 feel="macos" permissions={permissions} onOpenSettings={onOpenSettings} />)
    expect(screen.getByText("Privacy & Security › Screen Recording")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Open System Settings for Screen recording" }))
    expect(onOpenSettings).toHaveBeenCalledWith("screen")
    unmount()
    render(<Desktop5 feel="windows" permissions={permissions} />)
    expect(screen.getByRole("button", { name: "Open Settings for Screen recording" })).toBeInTheDocument()
    expect(screen.getByText("Privacy & security › Screenshots")).toBeInTheDocument()
  })

  it("re-checks when the window gets focus again", () => {
    const onRecheck = vi.fn()
    render(<Desktop5 permissions={permissions} onRecheck={onRecheck} />)
    fireEvent.focus(window)
    expect(onRecheck).toHaveBeenCalledTimes(1)
  })
})
