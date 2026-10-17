import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { Help1 } from "@/components/ballmac/blocks/help-1/help-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

describe("Help1", () => {
  it("suggests matching articles with the match highlighted, ranked by title", async () => {
    const user = userEvent.setup()
    render(<Help1 />)
    await user.type(screen.getByRole("combobox", { name: "Search the help center" }), "key")
    const list = screen.getByRole("listbox", { name: "Matching articles" })
    expect(screen.getAllByRole("option")[0]).toHaveTextContent("Create and rotate an API key")
    expect(list.querySelectorAll("mark").length).toBeGreaterThan(0)
    expect(screen.getByText("2 articles found")).toBeInTheDocument()
  })

  it("moves with the arrow keys and opens with Enter", async () => {
    const user = userEvent.setup()
    const onOpenArticle = vi.fn()
    render(<Help1 onOpenArticle={onOpenArticle} />)
    await user.type(screen.getByRole("combobox"), "invoice")
    await user.keyboard("{Enter}")
    expect(onOpenArticle).toHaveBeenCalledWith(expect.objectContaining({ id: "a2" }))
  })

  it("closes on Escape, then clears", async () => {
    const user = userEvent.setup()
    render(<Help1 />)
    const box = screen.getByRole("combobox")
    await user.type(box, "password")
    await user.keyboard("{Escape}")
    expect(screen.queryByRole("listbox")).toBeNull()
    expect(box).toHaveValue("password")
    await user.keyboard("{Escape}")
    expect(box).toHaveValue("")
  })

  it("offers a way to reach a person when nothing matches", async () => {
    const user = userEvent.setup()
    const onContact = vi.fn()
    render(<Help1 onContact={onContact} />)
    await user.type(screen.getByRole("combobox"), "zzzz")
    expect(screen.getByText(/No articles match/)).toBeInTheDocument()
    // the first one is in the empty search panel, the second in the contact strip below
    await user.click(screen.getAllByRole("button", { name: "Start a chat" })[0]!)
    expect(onContact).toHaveBeenCalledWith(expect.objectContaining({ id: "chat" }))
  })

  it("jumps to the search with the slash key and fills it from a popular search", async () => {
    const user = userEvent.setup()
    render(<Help1 />)
    await user.keyboard("/")
    expect(screen.getByRole("combobox")).toHaveFocus()
    await user.keyboard("{Escape}")
    await user.click(screen.getByRole("button", { name: "Invoices" }))
    expect(screen.getByRole("combobox")).toHaveValue("Invoices")
  })

  it("opens a category and keeps the contact strip when guides fail to load", async () => {
    const user = userEvent.setup()
    const onOpenCategory = vi.fn()
    const { rerender } = render(<Help1 onOpenCategory={onOpenCategory} />)
    await user.click(screen.getByRole("button", { name: "Billing and plans" }))
    expect(onOpenCategory).toHaveBeenCalledWith(expect.objectContaining({ id: "billing" }))
    rerender(<Help1 state="error" />)
    expect(screen.getByRole("alert")).toHaveTextContent("The help center could not be loaded")
    expect(screen.getByRole("button", { name: "Start a chat" })).toBeInTheDocument()
  })
})
