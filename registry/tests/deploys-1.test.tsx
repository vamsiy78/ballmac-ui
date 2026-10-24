import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Deploys1 } from "@/components/ballmac/blocks/deploys-1/deploys-1"

describe("Deploys1", () => {
  it("lists the first environment's deploys newest first with how each ended in words, and marks the live one", () => {
    render(<Deploys1 />)
    const items = within(screen.getByRole("list", { name: "Deploys to production, newest first" })).getAllByRole("listitem")
    expect(items).toHaveLength(5)
    expect(items[0]).toHaveTextContent("v2.18.4")
    expect(items[0]).toHaveTextContent("Live")
    expect(items[0]).toHaveTextContent("Succeeded · 3 min 12 s")
    expect(items[1]).toHaveTextContent("Failed")
    expect(items[3]).toHaveTextContent("Rolled back")
  })

  it("switches environment", async () => {
    const user = userEvent.setup()
    render(<Deploys1 />)
    await user.click(screen.getByRole("button", { name: "staging" }))
    const items = within(screen.getByRole("list", { name: "Deploys to staging, newest first" })).getAllByRole("listitem")
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent("Running")
  })

  it("offers a rollback only for earlier successful deploys, not the live one, a failed one or a rolled-back one", () => {
    render(<Deploys1 />)
    expect(screen.getAllByRole("button", { name: /^Roll back production to/ })).toHaveLength(2)
    expect(screen.queryByRole("button", { name: "Roll back production to v2.18.4" })).toBeNull()
    expect(screen.queryByRole("button", { name: "Roll back production to v2.18.3" })).toBeNull()
    expect(screen.queryByRole("button", { name: "Roll back production to v2.18.1" })).toBeNull()
  })

  it("asks before rolling back, names both versions, then makes the older one live", async () => {
    const user = userEvent.setup()
    const onRollback = vi.fn().mockResolvedValue(undefined)
    render(<Deploys1 onRollback={onRollback} />)
    await user.click(screen.getByRole("button", { name: "Roll back production to v2.18.2" }))
    const dialog = await screen.findByRole("alertdialog")
    expect(dialog).toHaveTextContent("production goes from v2.18.4 to v2.18.2")
    expect(onRollback).not.toHaveBeenCalled()
    await user.click(within(dialog).getByRole("button", { name: "Roll back" }))
    expect(onRollback).toHaveBeenCalledWith(expect.objectContaining({ id: "d3" }))
    expect(await screen.findByText("production is now on v2.18.2.")).toBeInTheDocument()
    const items = within(screen.getByRole("list", { name: "Deploys to production, newest first" })).getAllByRole("listitem")
    expect(items[0]).toHaveTextContent("Rolled back to v2.18.2")
    expect(items[0]).toHaveTextContent("Live")
  })

  it("leaves things as they are and says why when the rollback does not start", async () => {
    const user = userEvent.setup()
    render(<Deploys1 onRollback={() => Promise.reject(new Error("A deploy is already running."))} />)
    await user.click(screen.getByRole("button", { name: "Roll back production to v2.18.2" }))
    await user.click(within(await screen.findByRole("alertdialog")).getByRole("button", { name: "Roll back" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("A deploy is already running.")
  })

  it("shows loading, empty and error states", () => {
    const { rerender } = render(<Deploys1 state="loading" />)
    expect(screen.getByRole("status")).toHaveTextContent("Loading deploys")
    rerender(<Deploys1 deploys={[]} />)
    expect(screen.getByText("Nothing deployed yet")).toBeInTheDocument()
    rerender(<Deploys1 state="error" onRetry={() => {}} />)
    expect(screen.getByRole("alert")).toHaveTextContent("Deploys could not be loaded")
  })
})
