import * as React from "react"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { Org1 } from "@/components/ballmac/blocks/orgchart-1/orgchart-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

describe("Org1", () => {
  it("is a tree whose cards say role, team and how large their organization is", () => {
    render(<Org1 />)
    expect(screen.getByRole("tree", { name: "Organization chart" })).toBeInTheDocument()
    const ceo = screen.getByRole("treeitem", { name: /Mara Ellison, Chief Executive, \d+ people in their organization/ })
    expect(ceo).toHaveAttribute("aria-level", "1")
    expect(ceo).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("treeitem", { name: /Theo Nakamura, Chief Technology Officer, Engineering/ })).toHaveAttribute("aria-level", "2")
  })

  it("opens and closes a team with Right and Left, and moves with Up and Down", async () => {
    const user = userEvent.setup()
    render(<Org1 defaultExpandedDepth={1} />)
    expect(screen.queryByRole("treeitem", { name: /Priya Shah/ })).toBeNull()
    const theo = screen.getByRole("treeitem", { name: /Theo Nakamura/ })
    theo.focus()
    await user.keyboard("{ArrowRight}")
    expect(screen.getByRole("treeitem", { name: /Priya Shah/ })).toBeInTheDocument()
    await user.keyboard("{ArrowRight}")
    await waitFor(() => expect(screen.getByRole("treeitem", { name: /Priya Shah/ })).toHaveFocus())
    await user.keyboard("{ArrowLeft}")
    await waitFor(() => expect(screen.getByRole("treeitem", { name: /Theo Nakamura/ })).toHaveFocus())
    await user.keyboard("{ArrowLeft}")
    expect(screen.getByRole("treeitem", { name: /Theo Nakamura/ })).toHaveAttribute("aria-expanded", "false")
    await user.keyboard("{ArrowDown}")
    await waitFor(() => expect(screen.getByRole("treeitem", { name: /Noor Haddad/ })).toHaveFocus())
  })

  it("chooses a person with Enter and shows their manager and reports", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<Org1 onSelect={onSelect} />)
    screen.getByRole("treeitem", { name: /Noor Haddad/ }).focus()
    await user.keyboard("{Enter}")
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "noor" }))
    const panel = screen.getByRole("complementary")
    expect(within(panel).getByRole("heading", { name: "Noor Haddad" })).toBeInTheDocument()
    expect(within(panel).getByText("3 direct reports")).toBeInTheDocument()
    expect(within(panel).getByRole("button", { name: /Mara Ellison/ })).toBeInTheDocument()
  })

  it("finds a person deep in a closed branch and opens the path to them", async () => {
    const user = userEvent.setup()
    render(<Org1 />)
    expect(screen.queryByRole("treeitem", { name: /Kofi Mensah/ })).toBeNull()
    await user.type(screen.getByRole("searchbox", { name: "Find a person" }), "kofi")
    await user.click(within(screen.getByRole("list", { name: "Matches" })).getByRole("button", { name: /Kofi Mensah/ }))
    expect(await screen.findByRole("treeitem", { name: /Kofi Mensah/ })).toHaveAttribute("aria-selected", "true")
    expect(screen.getByRole("treeitem", { name: /Priya Shah/ })).toHaveAttribute("aria-expanded", "true")
  })

  it("says so when nobody matches, and expands or collapses everything", async () => {
    const user = userEvent.setup()
    render(<Org1 />)
    await user.type(screen.getByRole("searchbox", { name: "Find a person" }), "zzz")
    expect(screen.getByText(/Nobody matches/)).toBeInTheDocument()
    await user.clear(screen.getByRole("searchbox", { name: "Find a person" }))
    await user.click(screen.getByRole("button", { name: "Expand all" }))
    expect(screen.getByRole("treeitem", { name: /Kofi Mensah/ })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Collapse" }))
    expect(screen.queryByRole("treeitem", { name: /Theo Nakamura/ })).toBeNull()
  })

  it("shows loading, empty and error states", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const { rerender } = render(<Org1 state="loading" />)
    expect(screen.getByRole("status")).toBeInTheDocument()
    rerender(<Org1 state="empty" emptyState={{ title: "Nobody yet" }} />)
    expect(screen.getByRole("heading", { name: "Nobody yet" })).toBeInTheDocument()
    rerender(<Org1 state="error" onRetry={onRetry} />)
    await user.click(screen.getByRole("button", { name: /try again/i }))
    expect(onRetry).toHaveBeenCalled()
  })
})
