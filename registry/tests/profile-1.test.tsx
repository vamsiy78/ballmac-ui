import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { Profile1 } from "@/components/ballmac/blocks/profile-1/profile-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

describe("Profile1", () => {
  it("shows the person, the verified badge and the work", () => {
    render(<Profile1 />)
    expect(screen.getByRole("heading", { level: 1, name: /Mara Ellison/ })).toBeInTheDocument()
    expect(screen.getByRole("img", { name: "Verified" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Quiet" })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: /Work/ })).toHaveAttribute("aria-selected", "true")
  })

  it("follows straight away, updates the count, and says so", async () => {
    const user = userEvent.setup()
    const onFollow = vi.fn().mockResolvedValue(undefined)
    render(<Profile1 onFollow={onFollow} />)
    const button = screen.getByRole("button", { name: "Follow" })
    expect(button).toHaveAttribute("aria-pressed", "false")
    await user.click(button)
    expect(onFollow).toHaveBeenCalledWith(true)
    expect(screen.getByRole("button", { name: "Following" })).toHaveAttribute("aria-pressed", "true")
    expect(await screen.findByText("12,841")).toBeInTheDocument()
    expect(screen.getByText("You are following Mara Ellison")).toBeInTheDocument()
  })

  it("undoes the follow when it fails", async () => {
    const user = userEvent.setup()
    render(<Profile1 onFollow={() => Promise.reject(new Error("offline"))} />)
    await user.click(screen.getByRole("button", { name: "Follow" }))
    expect(await screen.findByRole("button", { name: "Follow" })).toHaveAttribute("aria-pressed", "false")
    expect(screen.getByText(/Could not update/)).toBeInTheDocument()
  })

  it("opens the Activity tab with the contribution graph and recent items", async () => {
    const user = userEvent.setup()
    render(<Profile1 />)
    await user.click(screen.getByRole("tab", { name: "Activity" }))
    expect(screen.getByRole("img", { name: /Contributions:/ })).toBeInTheDocument()
    expect(screen.getByText(/Published Quiet 2.0/)).toBeInTheDocument()
  })

  it("says there is no work yet, and shows the error state with retry", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const { rerender } = render(<Profile1 projects={[]} />)
    expect(screen.getByText("No projects yet")).toBeInTheDocument()
    rerender(<Profile1 state="error" onRetry={onRetry} />)
    await user.click(screen.getByRole("button", { name: "Try again" }))
    expect(onRetry).toHaveBeenCalled()
  })
})
