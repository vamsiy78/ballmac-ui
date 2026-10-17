import * as React from "react"
import { fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { Inbox1 } from "@/components/ballmac/blocks/inbox-1/inbox-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

describe("Inbox1", () => {
  it("groups by day and counts what is unread", () => {
    render(<Inbox1 />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Notifications3 unread")
    expect(screen.getByRole("heading", { name: "Today" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Yesterday" })).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: "Unread 3" })).toBeInTheDocument()
  })

  it("answers a request inline and shows the outcome straight away", async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    render(<Inbox1 onAction={onAction} />)
    await user.click(screen.getByRole("button", { name: "Approve" }))
    expect(onAction).toHaveBeenCalledWith("n1", "primary")
    expect(screen.getByText("Approved")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Approve" })).toBeNull()
    await user.click(screen.getByRole("button", { name: "Decline" }))
    expect(onAction).toHaveBeenLastCalledWith("n4", "secondary")
    expect(screen.getByText("Declined")).toBeInTheDocument()
  })

  it("marks read when opened and toggles read state", async () => {
    const user = userEvent.setup()
    const onOpen = vi.fn()
    const onMarkRead = vi.fn()
    render(<Inbox1 onOpen={onOpen} onMarkRead={onMarkRead} />)
    await user.click(screen.getByRole("button", { name: /Priya Shah mentioned you in Launch checklist/ }))
    expect(onOpen).toHaveBeenCalledWith(expect.objectContaining({ id: "n2" }))
    expect(onMarkRead).toHaveBeenCalledWith("n2", true)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("2 unread")
    const row = document.querySelector("[data-inbox-row=n2]") as HTMLElement
    await user.click(within(row).getByRole("button", { name: "Mark as unread" }))
    expect(onMarkRead).toHaveBeenLastCalledWith("n2", false)
  })

  it("archives with Undo and puts the item back in place", async () => {
    const user = userEvent.setup()
    const onArchive = vi.fn()
    const onRestore = vi.fn()
    render(<Inbox1 onArchive={onArchive} onRestore={onRestore} />)
    const row = document.querySelector("[data-inbox-row=n3]") as HTMLElement
    await user.click(within(row).getByRole("button", { name: "Archive" }))
    expect(onArchive).toHaveBeenCalledWith("n3")
    expect(document.querySelector("[data-inbox-row=n3]")).toBeNull()
    await user.click(screen.getByRole("button", { name: "Undo" }))
    expect(onRestore).toHaveBeenCalledWith(expect.objectContaining({ id: "n3" }))
    expect(document.querySelector("[data-inbox-row=n3]")).not.toBeNull()
  })

  it("moves with J and K and archives with E", async () => {
    const user = userEvent.setup()
    render(<Inbox1 />)
    const first = document.querySelector("[data-inbox-main=n1]") as HTMLElement
    first.focus()
    await user.keyboard("j")
    expect(document.querySelector("[data-inbox-main=n2]")).toHaveFocus()
    await user.keyboard("k")
    expect(first).toHaveFocus()
    await user.keyboard("j")
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: "e" })
    expect(document.querySelector("[data-inbox-row=n2]")).toBeNull()
  })

  it("marks everything read and filters to mentions with a matching empty message", async () => {
    const user = userEvent.setup()
    const onMarkAllRead = vi.fn()
    render(<Inbox1 onMarkAllRead={onMarkAllRead} />)
    await user.click(screen.getByRole("button", { name: /Mark all as read/ }))
    expect(onMarkAllRead).toHaveBeenCalled()
    expect(screen.queryByText("3 unread")).toBeNull()
    await user.click(screen.getByRole("radio", { name: "Unread" }))
    expect(screen.getByText("No unread notifications")).toBeInTheDocument()
    await user.click(screen.getByRole("radio", { name: "Mentions" }))
    expect(screen.getAllByText(/mentioned you in/).length).toBe(2)
  })
})
