import * as React from "react"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { Gallery1 } from "@/components/ballmac/blocks/gallery-1/gallery-1"
import { DirectionProvider } from "@/lib/ballmac/direction"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

const tiles = (c: HTMLElement) => c.querySelectorAll("button[aria-haspopup=dialog]")

describe("Gallery1", () => {
  it("filters by category with counts in the labels", async () => {
    const user = userEvent.setup()
    const { container } = render(<Gallery1 />)
    expect(tiles(container)).toHaveLength(12)
    expect(screen.getByRole("radio", { name: /All 12/ })).toBeChecked()
    await user.click(screen.getByRole("radio", { name: /Team 3/ }))
    expect(tiles(container)).toHaveLength(3)
  })

  it("opens a lightbox that is a named dialog with its position", async () => {
    const user = userEvent.setup()
    const onOpen = vi.fn()
    render(<Gallery1 onOpen={onOpen} />)
    await user.click(screen.getByRole("button", { name: /Launch day/ }))
    const dialog = screen.getByRole("dialog", { name: "Launch day" })
    expect(onOpen).toHaveBeenCalledWith(expect.objectContaining({ id: "g2" }))
    expect(dialog).toHaveAccessibleDescription(/Picture 2 of 12/)
    expect(within(dialog).getAllByRole("button", { name: /^Picture \d+:/ })).toHaveLength(12)
  })

  it("moves with the arrow keys, Home and End, wrapping around", async () => {
    const user = userEvent.setup()
    render(<Gallery1 defaultOpenId="g2" />)
    const dialog = screen.getByRole("dialog")
    // Focus moves into the dialog a moment after it opens (Base UI); wait for it before using the keys.
    await waitFor(() => expect(dialog).toContainElement(document.activeElement as HTMLElement))
    await user.keyboard("{ArrowRight}")
    expect(dialog).toHaveAccessibleName("The first prototype")
    await user.keyboard("{ArrowLeft}{ArrowLeft}")
    expect(dialog).toHaveAccessibleName("The Lisbon studio")
    await user.keyboard("{ArrowLeft}")
    expect(dialog).toHaveAccessibleName("The whole team")
    await user.keyboard("{Home}")
    expect(dialog).toHaveAccessibleName("The Lisbon studio")
    await user.keyboard("{End}")
    expect(dialog).toHaveAccessibleName("The whole team")
  })

  it("swaps the arrow keys in right-to-left", async () => {
    const user = userEvent.setup()
    render(
      <DirectionProvider dir="rtl">
        <Gallery1 defaultOpenId="g2" />
      </DirectionProvider>
    )
    await user.keyboard("{ArrowLeft}")
    expect(screen.getByRole("dialog")).toHaveAccessibleName("The first prototype")
  })

  it("jumps with a thumbnail and closes with Escape, returning focus to the tile", async () => {
    const user = userEvent.setup()
    render(<Gallery1 />)
    const tile = screen.getByRole("button", { name: /Launch day/ })
    await user.click(tile)
    await user.click(screen.getByRole("button", { name: "Picture 5: Standing desks" }))
    expect(screen.getByRole("dialog")).toHaveAccessibleName("Standing desks")
    await user.keyboard("{Escape}")
    expect(screen.queryByRole("dialog")).toBeNull()
    await waitFor(() => expect(tile).toHaveFocus())
  })

  it("explains an empty gallery and offers the way back from an empty category", async () => {
    const user = userEvent.setup()
    const { rerender } = render(<Gallery1 items={[{ id: "a", title: "A", category: "One" }, { id: "b", title: "B", category: "Two" }]} defaultCategory="Two" />)
    await user.click(screen.getByRole("radio", { name: /One/ }))
    expect(screen.getAllByRole("button", { name: /^A/ }).length).toBeGreaterThan(0)
    rerender(<Gallery1 state="empty" />)
    expect(screen.getByText("No pictures yet")).toBeInTheDocument()
  })
})
