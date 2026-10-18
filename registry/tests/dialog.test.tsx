import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ballmac/dialog"

function ProfileDialog({ showCloseButton }: { showCloseButton?: boolean }) {
  return (
    <Dialog>
      <DialogTrigger>Edit profile</DialogTrigger>
      <DialogContent showCloseButton={showCloseButton}>
        <DialogTitle>Edit profile</DialogTitle>
        <DialogDescription>Update your name.</DialogDescription>
        <input aria-label="Name" defaultValue="Alex" />
      </DialogContent>
    </Dialog>
  )
}

describe("Dialog", () => {
  it("opens from the trigger, moves focus inside and closes on Escape", async () => {
    const user = userEvent.setup()
    render(<ProfileDialog />)
    const trigger = screen.getByRole("button", { name: "Edit profile" })
    await user.click(trigger)
    const dialog = await screen.findByRole("dialog", { name: "Edit profile" })
    expect(dialog).toHaveAccessibleDescription("Update your name.")
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true))

    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(trigger).toHaveFocus()
  })

  it("renders a labelled close button that closes the dialog", async () => {
    const user = userEvent.setup()
    render(<ProfileDialog />)
    await user.click(screen.getByRole("button", { name: "Edit profile" }))
    await user.click(await screen.findByRole("button", { name: "Close" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
  })

  it("hides the close button with showCloseButton={false}", async () => {
    const user = userEvent.setup()
    render(<ProfileDialog showCloseButton={false} />)
    await user.click(screen.getByRole("button", { name: "Edit profile" }))
    await screen.findByRole("dialog")
    expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument()
  })
  it("lets onOpenAutoFocus and onCloseAutoFocus place focus", async () => {
    const user = userEvent.setup()
    const closed = vi.fn((e: Event) => e.preventDefault())
    render(
      <>
        <button id="elsewhere">Elsewhere</button>
        <Dialog>
          <DialogTrigger>Edit profile</DialogTrigger>
          <DialogContent
            onOpenAutoFocus={(e) => {
              e.preventDefault()
              document.getElementById("second")?.focus()
            }}
            onCloseAutoFocus={(e) => {
              closed(e)
              document.getElementById("elsewhere")?.focus()
            }}
          >
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>Update your name.</DialogDescription>
            <input aria-label="First" />
            <input id="second" aria-label="Second" />
          </DialogContent>
        </Dialog>
      </>,
    )
    await user.click(screen.getByRole("button", { name: "Edit profile" }))
    await waitFor(() => expect(screen.getByLabelText("Second")).toHaveFocus())
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    expect(closed).toHaveBeenCalled()
    await waitFor(() => expect(document.getElementById("elsewhere")).toHaveFocus())
  })
})
