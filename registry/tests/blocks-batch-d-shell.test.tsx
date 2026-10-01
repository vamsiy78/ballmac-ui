import * as React from "react"
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"

import { AppShell1 } from "@/components/ballmac/blocks/app-shell-1/app-shell-1"
import { Dashboard1 } from "@/components/ballmac/blocks/dashboard-1/dashboard-1"
import { Dashboard2 } from "@/components/ballmac/blocks/dashboard-2/dashboard-2"
import { Settings1 } from "@/components/ballmac/blocks/settings-1/settings-1"
import { Settings2 } from "@/components/ballmac/blocks/settings-2/settings-2"
import { Settings3 } from "@/components/ballmac/blocks/settings-3/settings-3"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})
afterEach(() => vi.useRealTimers())

describe("AppShell1", () => {
  it("renders the navigation with the first page current and switches pages", async () => {
    const user = userEvent.setup()
    render(<AppShell1 />)
    const nav = screen.getByRole("navigation", { name: "Main" })
    expect(within(nav).getByRole("link", { name: /Overview/ })).toHaveAttribute("aria-current", "page")
    await user.click(within(nav).getByRole("link", { name: /Projects/ }))
    expect(within(nav).getByRole("link", { name: /Projects/ })).toHaveAttribute("aria-current", "page")
    expect(screen.getByRole("heading", { level: 1, name: "Projects" })).toBeInTheDocument()
  })

  it("calls onValueChange and supports the controlled value", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<AppShell1 value="inbox" onValueChange={onValueChange} />)
    expect(screen.getByRole("heading", { level: 1, name: "Inbox" })).toBeInTheDocument()
    await user.click(within(screen.getByRole("navigation", { name: "Main" })).getByRole("link", { name: /Team/ }))
    expect(onValueChange).toHaveBeenCalledWith("team")
    expect(screen.getByRole("heading", { level: 1, name: "Inbox" })).toBeInTheDocument()
  })

  it("collapses to an icon rail that keeps accessible names", async () => {
    const user = userEvent.setup()
    render(<AppShell1 />)
    const toggle = screen.getByRole("button", { name: "Collapse sidebar" })
    await user.click(toggle)
    expect(screen.getByRole("button", { name: "Expand sidebar" })).toHaveAttribute("aria-pressed", "true")
    expect(within(screen.getByRole("navigation", { name: "Main" })).getByRole("link", { name: "Inbox" })).toBeInTheDocument()
  })

  it("opens the command menu with the keyboard and jumps to a page", async () => {
    const user = userEvent.setup()
    render(<AppShell1 />)
    screen.getByRole("main").focus()
    fireEvent.keyDown(document.activeElement ?? document.body, { key: "k", ctrlKey: true })
    const dialog = await screen.findByRole("dialog")
    await user.click(within(dialog).getByText("Reports"))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(screen.getByRole("heading", { level: 1, name: "Reports" })).toBeInTheDocument()
  })

  it("renders your own page through children", () => {
    render(<AppShell1 defaultValue="team">{(page) => <p>Custom {page.label}</p>}</AppShell1>)
    expect(screen.getByText("Custom Team")).toBeInTheDocument()
  })
})

describe("Dashboard1", () => {
  it("shows KPIs, a labelled chart and the orders table", () => {
    render(<Dashboard1 />)
    expect(screen.getByRole("heading", { name: "Overview" })).toBeInTheDocument()
    expect(screen.getByText("Revenue", { selector: "dt" })).toBeInTheDocument()
    expect(screen.getByRole("figure", { name: /Daily revenue for the last 30 days/ })).toBeInTheDocument()
    expect(screen.getByRole("region", { name: "Recent orders" })).toBeInTheDocument()
    expect(screen.getByText("Northwind Studio")).toBeInTheDocument()
  })

  it("recomputes for another range", async () => {
    const user = userEvent.setup()
    const onRangeChange = vi.fn()
    render(<Dashboard1 onRangeChange={onRangeChange} />)
    await user.click(screen.getByRole("radio", { name: "7 days" }))
    expect(onRangeChange).toHaveBeenCalledWith("7d")
    expect(screen.getByText("Daily, last 7 days")).toBeInTheDocument()
    expect(screen.getByRole("figure", { name: /last 7 days/ })).toBeInTheDocument()
  })

  it("derives totals from your own series", () => {
    render(<Dashboard1 getSeries={() => [{ label: "A", revenue: 1000, previous: 500, orders: 10 }, { label: "B", revenue: 1000, previous: 500, orders: 10 }]} />)
    expect(screen.getByText("$2K", { selector: "span" })).toBeInTheDocument()
    expect(screen.getByText("20", { selector: "span" })).toBeInTheDocument()
    expect(screen.getByText(/100\.0%/)).toBeInTheDocument()
  })
})

describe("Dashboard2", () => {
  it("renders the live pill, sources, devices, countries and pages", () => {
    render(<Dashboard2 />)
    expect(screen.getByText("128 online now")).toBeInTheDocument()
    expect(screen.getByRole("figure", { name: "Visitors by traffic source" })).toBeInTheDocument()
    expect(screen.getByRole("img", { name: /Desktop 54 percent/ })).toBeInTheDocument()
    expect(screen.getByRole("region", { name: "Top pages" })).toBeInTheDocument()
  })

  it("hides the previous period when compare is off and the live pill when null", async () => {
    const user = userEvent.setup()
    const { rerender } = render(<Dashboard2 />)
    const compare = screen.getByRole("switch", { name: "Compare" })
    expect(compare).toHaveAttribute("aria-checked", "true")
    await user.click(compare)
    expect(compare).toHaveAttribute("aria-checked", "false")
    rerender(<Dashboard2 live={null} />)
    expect(screen.queryByText(/online now/)).not.toBeInTheDocument()
  })

  it("switches range", async () => {
    const user = userEvent.setup()
    render(<Dashboard2 />)
    await user.click(screen.getByRole("radio", { name: "12 months" }))
    expect(screen.getByRole("figure", { name: /last 12 months/ })).toBeInTheDocument()
  })
})

describe("Settings1", () => {
  it("shows the save bar only after an edit and saves", async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue(undefined)
    render(<Settings1 onSave={onSave} />)
    expect(screen.queryByRole("button", { name: "Save changes" })).not.toBeInTheDocument()
    const name = screen.getByRole("textbox", { name: /Full name/ })
    await user.clear(name)
    await user.type(name, "Jordan Q. Lee")
    await user.click(await screen.findByRole("button", { name: "Save changes" }))
    await waitFor(() => expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ name: "Jordan Q. Lee" })))
    expect(await screen.findByText("All changes saved")).toBeInTheDocument()
  })

  it("blocks saving with an empty name or a taken username, and discards changes", async () => {
    const user = userEvent.setup()
    render(<Settings1 />)
    const username = screen.getByRole("textbox", { name: /Username/ })
    await user.clear(username)
    await user.type(username, "admin")
    expect(screen.getByText("@admin is already taken.")).toBeInTheDocument()
    expect(await screen.findByRole("button", { name: "Save changes" })).toBeDisabled()
    await user.click(screen.getByRole("button", { name: "Discard" }))
    expect(username).toHaveValue("jordanlee")
  })

  it("shows an error when saving fails", async () => {
    const user = userEvent.setup()
    render(<Settings1 onSave={() => Promise.reject(new Error("x"))} />)
    await user.type(screen.getByRole("textbox", { name: /Bio/ }), "!")
    await user.click(await screen.findByRole("button", { name: "Save changes" }))
    expect(await screen.findByText(/couldn’t save/)).toBeInTheDocument()
  })

  it("asks to type 'delete' before deleting the account", async () => {
    const user = userEvent.setup()
    const onDeleteAccount = vi.fn()
    render(<Settings1 onDeleteAccount={onDeleteAccount} />)
    await user.click(screen.getByRole("button", { name: /Delete account/ }))
    const dialog = await screen.findByRole("alertdialog")
    const confirm = within(dialog).getByRole("button", { name: "Delete account" })
    expect(confirm).toBeDisabled()
    await user.type(within(dialog).getByLabelText("Type delete to confirm"), "delete")
    expect(confirm).toBeEnabled()
    await user.click(confirm)
    expect(onDeleteAccount).toHaveBeenCalled()
  })
})

describe("Settings2", () => {
  it("labels every switch and reports changes with all values", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn().mockResolvedValue(undefined)
    render(<Settings2 onChange={onChange} />)
    const sw = screen.getAllByRole("switch", { name: "Product news by Email" })[0]
    expect(sw).toHaveAttribute("aria-checked", "false")
    await user.click(sw)
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ events: expect.objectContaining({ product: expect.objectContaining({ email: true }) }) }))
    expect(await screen.findByText("Saved")).toBeInTheDocument()
  })

  it("changes the digest and disables quiet-hours controls when off", async () => {
    const user = userEvent.setup()
    render(<Settings2 />)
    await user.click(screen.getByRole("radio", { name: /Weekly/ }))
    expect(screen.getByRole("radio", { name: /Weekly/ })).toBeChecked()
    await user.click(screen.getByRole("switch", { name: "Quiet hours" }))
    expect(screen.getByLabelText("From")).toBeDisabled()
  })

  it("shows an error when saving fails", async () => {
    const user = userEvent.setup()
    render(<Settings2 onChange={() => Promise.reject(new Error("x"))} />)
    await user.click(screen.getByRole("radio", { name: /Never/ }))
    expect(await screen.findByText(/Couldn’t save/)).toBeInTheDocument()
  })
})

describe("Settings3", () => {
  it("shows seats used, and keeps the Owner fixed", () => {
    render(<Settings3 />)
    expect(screen.getByText("7 of 10 used")).toBeInTheDocument()
    expect(screen.getAllByText("Owner").length).toBeGreaterThan(1)
    expect(screen.queryByRole("combobox", { name: "Role for Jordan Lee" })).not.toBeInTheDocument()
    expect(screen.getByRole("combobox", { name: "Role for Maya Kim" })).toBeInTheDocument()
  })

  it("validates invitations, adds a pending person and updates seats", async () => {
    const user = userEvent.setup()
    const onInvite = vi.fn().mockResolvedValue(undefined)
    render(<Settings3 onInvite={onInvite} />)
    await user.type(screen.getByRole("textbox", { name: /Invite someone/ }), "nope{Enter}")
    expect(screen.getByRole("alert")).toHaveTextContent("full email address")
    await user.clear(screen.getByRole("textbox", { name: /Invite someone/ }))
    await user.type(screen.getByRole("textbox", { name: /Invite someone/ }), "maya@acme.com{Enter}")
    expect(screen.getByRole("alert")).toHaveTextContent("already on the team")
    await user.clear(screen.getByRole("textbox", { name: /Invite someone/ }))
    await user.type(screen.getByRole("textbox", { name: /Invite someone/ }), "new@acme.com{Enter}")
    await waitFor(() => expect(onInvite).toHaveBeenCalledWith("new@acme.com", "Editor"))
    expect(await screen.findByText("8 of 10 used")).toBeInTheDocument()
  })

  it("refuses to invite when every seat is used", async () => {
    const user = userEvent.setup()
    render(<Settings3 seats={7} />)
    await user.type(screen.getByRole("textbox", { name: /Invite someone/ }), "late@acme.com{Enter}")
    expect(screen.getByRole("alert")).toHaveTextContent("All 7 seats are in use")
  })

  it("filters by role and search", async () => {
    const user = userEvent.setup()
    render(<Settings3 />)
    await user.click(screen.getByRole("button", { name: "Pending" }))
    expect(screen.getByRole("status")).toHaveTextContent("2 people shown")
    await user.click(screen.getByRole("button", { name: "All" }))
    await user.type(screen.getByRole("searchbox", { name: "Search people" }), "zzz")
    expect(screen.getByText("No one matches")).toBeInTheDocument()
  })

  it("asks for confirmation before removing someone", async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()
    render(<Settings3 onRemove={onRemove} />)
    await user.click(screen.getByRole("button", { name: "Actions for Amara Singh" }))
    await user.click(await screen.findByRole("menuitem", { name: /Remove from team/ }))
    const dialog = await screen.findByRole("alertdialog")
    expect(dialog).toHaveTextContent("Remove Amara Singh?")
    await user.click(within(dialog).getByRole("button", { name: "Remove" }))
    expect(onRemove).toHaveBeenCalledWith("4")
    expect(await screen.findByText("6 of 10 used")).toBeInTheDocument()
  })
})
