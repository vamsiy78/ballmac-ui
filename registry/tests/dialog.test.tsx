import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

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
})
