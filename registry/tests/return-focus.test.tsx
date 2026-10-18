import * as React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ballmac/dialog"
import { useReturnFocus } from "@/lib/ballmac/return-focus"

function WithHook() {
  const [open, setOpen] = React.useState(false)
  const returnFocus = useReturnFocus(open)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Open it</button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent {...returnFocus}>
          <DialogTitle>Hello</DialogTitle>
          <DialogDescription>A dialog opened from state.</DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  )
}

function WithoutHook() {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Open it</button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>Hello</DialogTitle>
          <DialogDescription>A dialog opened from state.</DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  )
}

describe("useReturnFocus", () => {
  it("returns focus to the button that opened a dialog with no trigger", async () => {
    const user = userEvent.setup()
    render(<WithHook />)
    const button = screen.getByRole("button", { name: "Open it" })
    await user.click(button)
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    await waitFor(() => expect(button).toHaveFocus())
  })

  it("is needed: without it focus is not returned", async () => {
    const user = userEvent.setup()
    render(<WithoutHook />)
    const button = screen.getByRole("button", { name: "Open it" })
    await user.click(button)
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    await new Promise((r) => setTimeout(r, 50))
    // Radix UI leaves focus behind when a dialog has no trigger; Base UI returns it to the element that was focused on its own.
    if (process.env.BALLMAC_BASE === "1") expect(button).toHaveFocus()
    else expect(button).not.toHaveFocus()
  })
})
