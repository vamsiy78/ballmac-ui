import * as React from "react"
import { act, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"

import { AtlasCustomers } from "@/components/ballmac/templates/atlas/atlas-customers"
import { AtlasDashboard } from "@/components/ballmac/templates/atlas/atlas-dashboard"
import { AtlasOrder } from "@/components/ballmac/templates/atlas/atlas-order"
import { AtlasOrders } from "@/components/ballmac/templates/atlas/atlas-orders"
import { AtlasProducts } from "@/components/ballmac/templates/atlas/atlas-products"
import { AtlasSettings } from "@/components/ballmac/templates/atlas/atlas-settings"
import { AuthKitPage, AuthKitPlayground } from "@/components/ballmac/templates/auth-kit/auth-kit-pages"
import { MuseChat } from "@/components/ballmac/templates/muse/muse-chat"
import { MuseLibrary } from "@/components/ballmac/templates/muse/muse-library"
import { MuseProjects } from "@/components/ballmac/templates/muse/muse-projects"
import { MuseSettings } from "@/components/ballmac/templates/muse/muse-settings"
import { WorkspaceBoard } from "@/components/ballmac/templates/workspace/workspace-board"
import { WorkspaceCalendar } from "@/components/ballmac/templates/workspace/workspace-calendar"
import { WorkspaceMail } from "@/components/ballmac/templates/workspace/workspace-mail"
import { WorkspaceSettings } from "@/components/ballmac/templates/workspace/workspace-settings"
import { WorkspaceToday } from "@/components/ballmac/templates/workspace/workspace-today"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})
afterEach(() => vi.useRealTimers())

describe("Atlas", () => {
  it("recomputes the dashboard when the date range changes", async () => {
    const user = userEvent.setup()
    render(<AtlasDashboard />)
    const before = screen.getAllByText(/^\$\d{2,3},\d{3}$/)[0].textContent
    await user.click(screen.getByRole("radio", { name: "7 days" }))
    expect(screen.getAllByText(/^\$\d{2,3},\d{3}$/)[0].textContent).not.toBe(before)
    expect(within(screen.getByRole("navigation", { name: "Main" })).getByRole("link", { name: /Dashboard/ })).toHaveAttribute("aria-current", "page")
  })

  it("filters, searches and sorts the orders table", async () => {
    const user = userEvent.setup()
    render(<AtlasOrders />)
    expect(screen.getByRole("status")).toHaveTextContent("Showing 1–10 of 36")
    await user.click(screen.getByRole("button", { name: /^Unpaid/ }))
    expect(screen.getByRole("status")).toHaveTextContent(/of 7$/)
    await user.click(screen.getByRole("button", { name: /^All/ }))
    await user.type(screen.getByRole("searchbox", { name: "Search orders" }), "wholesale")
    expect(screen.getByRole("status").textContent).not.toContain("of 36")
    await user.clear(screen.getByRole("searchbox"))
    const total = screen.getByRole("columnheader", { name: /Total/ })
    expect(total).toHaveAttribute("aria-sort", "none")
    await user.click(within(total).getByRole("button"))
    expect(total).toHaveAttribute("aria-sort", "descending")
    await user.click(within(total).getByRole("button"))
    expect(total).toHaveAttribute("aria-sort", "ascending")
  })

  it("paginates and runs a bulk action on the selection", async () => {
    const user = userEvent.setup()
    render(<AtlasOrders />)
    await user.click(screen.getByRole("button", { name: "Next page" }))
    expect(screen.getByRole("status")).toHaveTextContent("Showing 11–20 of 36")
    await user.click(screen.getByRole("button", { name: "Previous page" }))
    await user.click(screen.getByRole("button", { name: /^Unfulfilled/ }))
    const tab = () => screen.getByRole("button", { name: /^Unfulfilled/ }).textContent
    const before = tab()
    await user.click(screen.getByRole("checkbox", { name: "Select all orders on this page" }))
    expect(screen.getByRole("region", { name: "Bulk actions" })).toHaveTextContent(/selected/)
    await user.click(screen.getByRole("button", { name: /Mark as shipped/ }))
    expect(screen.queryByRole("region", { name: "Bulk actions" })).not.toBeInTheDocument()
    expect(tab()).not.toBe(before)
  })

  it("ships an order and refunds items with validation", async () => {
    const user = userEvent.setup()
    render(<AtlasOrder />)
    await user.click(screen.getByRole("button", { name: /Mark as shipped/ }))
    expect(screen.getByText("Marked as shipped")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /^Refund$/ }))
    const dialog = screen.getByRole("dialog")
    await user.click(within(dialog).getByRole("button", { name: /^Refund/ }))
    expect(within(dialog).getByRole("alert")).toHaveTextContent("Choose at least one item")
    await user.click(within(dialog).getAllByRole("checkbox")[0])
    await user.click(within(dialog).getByRole("button", { name: /^Refund/ }))
    expect(within(dialog).getByRole("alert")).toHaveTextContent("Pick a reason")
    await user.selectOptions(within(dialog).getByLabelText("Reason"), "Damaged in transit")
    await user.click(within(dialog).getByRole("button", { name: /^Refund/ }))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(screen.getAllByText(/^Refunded \$/).length).toBeGreaterThan(0)
  })

  it("filters products and validates the add form", async () => {
    const user = userEvent.setup()
    render(<AtlasProducts />)
    await user.click(screen.getByRole("button", { name: /Low stock/ }))
    expect(screen.getByRole("status")).toHaveTextContent(/^4 products shown/)
    await user.click(screen.getAllByRole("button", { name: /Add product/ })[0])
    const dialog = screen.getByRole("dialog")
    await user.click(within(dialog).getByRole("button", { name: "Add product" }))
    expect(within(dialog).getByText("Give the product a name.")).toBeInTheDocument()
    expect(within(dialog).getByLabelText("Name")).toHaveFocus()
    await user.type(within(dialog).getByLabelText("Name"), "Pencil case")
    await user.type(within(dialog).getByLabelText("Price (USD)"), "18")
    await user.click(within(dialog).getByRole("button", { name: "Add product" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    await user.click(screen.getByRole("button", { name: /Low stock/ }))
    await user.type(screen.getByRole("searchbox", { name: "Search products" }), "pencil case")
    expect(screen.getByRole("status")).toHaveTextContent("1 products shown")
  })

  it("filters customers by segment and opens a profile", async () => {
    const user = userEvent.setup()
    render(<AtlasCustomers />)
    await user.click(screen.getByRole("button", { name: /^VIP/ }))
    expect(screen.getByRole("status")).toHaveTextContent("4 of 12 customers")
    await user.click(screen.getByRole("button", { name: /Amara Okafor/ }))
    expect(screen.getByRole("dialog")).toHaveTextContent("Recent orders")
  })

  it("shows the save bar only when settings change", async () => {
    const user = userEvent.setup()
    render(<AtlasSettings />)
    expect(screen.queryByRole("region", { name: "Save changes" })).not.toBeInTheDocument()
    await user.click(screen.getByRole("switch", { name: "Weekly digest" }))
    expect(screen.getByRole("region", { name: "Save changes" })).toHaveTextContent("unsaved changes")
    await user.click(screen.getByRole("button", { name: "Save changes" }))
    expect(screen.getByText("Changes saved")).toBeInTheDocument()
  })
})

describe("Muse", () => {
  it("sends a message and streams a reply", async () => {
    const user = userEvent.setup()
    render(<MuseChat start="empty" />)
    expect(screen.getByRole("heading", { name: /Good morning/ })).toBeInTheDocument()
    await user.type(screen.getByRole("textbox", { name: "Message Muse" }), "Plan my week{Enter}")
    expect(screen.getByText("Plan my week")).toBeInTheDocument()
    expect(await screen.findByText(/Here is a calm way/, {}, { timeout: 4000 })).toBeInTheDocument()
  })

  it("shows the finished conversation with its document and opens the model list", async () => {
    const user = userEvent.setup()
    render(<MuseChat />)
    expect(screen.getByText(/Make the risks section sharper/i)).toBeInTheDocument()
    expect(screen.getAllByText("Q4 design plan").length).toBeGreaterThan(0)
    await user.click(screen.getByRole("combobox", { name: /Muse 5/ }))
    expect(await screen.findByRole("option", { name: /Muse 5 Fast/ })).toBeInTheDocument()
  })

  it("edits project instructions, adds a file and creates a project", async () => {
    const user = userEvent.setup()
    render(<MuseProjects />)
    const box = screen.getByRole("textbox", { name: /Instructions/ })
    await user.type(box, " Be brief.")
    await user.click(screen.getByRole("button", { name: "Save instructions" }))
    expect(screen.getByText("Saved")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /Add file/ }))
    expect(screen.getByText("Upload 4.pdf")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /New project/ }))
    expect(screen.getByRole("heading", { name: "Untitled project 1" })).toBeInTheDocument()
    expect(screen.getByText(/No files yet/)).toBeInTheDocument()
  })

  it("filters the library and previews an item", async () => {
    const user = userEvent.setup()
    render(<MuseLibrary />)
    await user.click(screen.getByRole("button", { name: "Code" }))
    expect(screen.getByRole("status")).toHaveTextContent("2 items")
    await user.click(screen.getByRole("button", { name: /Debounce hook/ }))
    expect(screen.getByRole("dialog")).toHaveTextContent("useDebounce")
  })

  it("forgets a memory and gates account deletion behind typing", async () => {
    const user = userEvent.setup()
    render(<MuseSettings />)
    await user.click(screen.getByRole("button", { name: /Forget: Vegetarian/ }))
    expect(screen.getByText("4 memories saved")).toBeInTheDocument()
    const del = screen.getByRole("button", { name: "Delete account" })
    expect(del).toBeDisabled()
    await user.type(screen.getByLabelText(/Type delete my account/), "delete my account")
    expect(del).toBeEnabled()
  })
})

describe("Workspace", () => {
  it("ticks and adds tasks and archives a message", async () => {
    const user = userEvent.setup()
    render(<WorkspaceToday />)
    expect(screen.getByText("1 of 4 done")).toBeInTheDocument()
    await user.click(screen.getByRole("checkbox", { name: /Review Dev/ }))
    expect(screen.getByText("2 of 4 done")).toBeInTheDocument()
    await user.type(screen.getByLabelText("Add a task"), "Call the printer{Enter}")
    expect(screen.getByText("Call the printer")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /Archive: Lunch today/ }))
    expect(screen.queryByText("Lunch today?")).not.toBeInTheDocument()
  })

  it("counts the focus timer down", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<WorkspaceToday />)
    await user.click(screen.getByRole("button", { name: "Start" }))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000)
    })
    expect(screen.getByRole("timer")).toHaveTextContent(/24:5\d/)
    await user.click(screen.getByRole("button", { name: "Pause" }))
    expect(screen.getByRole("button", { name: "Resume" })).toBeInTheDocument()
  })

  it("renders each app inside the shell with its icon marked current", () => {
    for (const [Page, name] of [[WorkspaceMail, "Mail"], [WorkspaceCalendar, "Calendar"], [WorkspaceBoard, "Board"], [WorkspaceSettings, "Settings"]] as const) {
      const { unmount } = render(<Page />)
      expect(within(screen.getByRole("navigation", { name: "Apps" })).getByRole("link", { name })).toHaveAttribute("aria-current", "page")
      unmount()
    }
  })
})

describe("Auth Kit", () => {
  it("validates sign in, focuses the first problem and succeeds", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<AuthKitPage page="sign-in" />)
    await user.click(screen.getByRole("button", { name: "Sign in" }))
    expect(screen.getByText(/Enter an email like/)).toBeInTheDocument()
    expect(screen.getByLabelText("Email")).toHaveFocus()
    await user.type(screen.getByLabelText("Email"), "ada@acme.co")
    await user.type(screen.getByLabelText("Password"), "hunter2")
    await user.click(screen.getByRole("button", { name: "Sign in" }))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(800)
    })
    expect(screen.getByRole("status")).toHaveTextContent("You’re in")
  })

  it("scores the password live and blocks sign up until every rule passes", async () => {
    const user = userEvent.setup()
    render(<AuthKitPage page="sign-up" />)
    await user.type(screen.getByLabelText("Password"), "abc")
    expect(screen.getByText("Strength: Weak")).toBeInTheDocument()
    await user.clear(screen.getByLabelText("Password"))
    await user.type(screen.getByLabelText("Password"), "Correct-horse-9")
    expect(screen.getByText("Strength: Strong")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Create account" }))
    expect(screen.getByText("Tell us your name.")).toBeInTheDocument()
    expect(screen.getByLabelText("Full name")).toHaveFocus()
  })

  it("shows and hides the password", async () => {
    const user = userEvent.setup()
    render(<AuthKitPage page="sign-in" />)
    const input = screen.getByLabelText("Password")
    expect(input).toHaveAttribute("type", "password")
    await user.click(screen.getByRole("button", { name: "Show password" }))
    expect(input).toHaveAttribute("type", "text")
  })

  it("rejects a wrong code and accepts the right one", async () => {
    const user = userEvent.setup()
    render(<AuthKitPage page="verify" />)
    const input = screen.getByRole("textbox")
    await user.type(input, "111111")
    expect(screen.getByText(/isn’t right/)).toBeInTheDocument()
    await user.clear(input)
    await user.type(input, "123456")
    expect(screen.getByRole("status")).toHaveTextContent("Email verified")
  })

  it("walks through onboarding and catches a bad invite address", async () => {
    const user = userEvent.setup()
    render(<AuthKitPage page="onboarding" />)
    await user.click(screen.getByRole("button", { name: /Continue/ }))
    expect(screen.getByRole("heading", { name: "Name your workspace" })).toBeInTheDocument()
    expect(screen.getByText("Your address: fieldnote-goods.keystone.app")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /Continue/ }))
    // Focus moves to the new step's heading on the next frame; let it settle before typing.
    await waitFor(() => expect(screen.getByRole("heading", { name: "Invite your team" })).toHaveFocus())
    await user.type(screen.getByLabelText("Email addresses"), "not-an-email")
    await user.click(screen.getByRole("button", { name: /Send invitations/ }))
    expect(screen.getByText(/doesn’t look like an email/)).toBeInTheDocument()
    await user.clear(screen.getByLabelText("Email addresses"))
    await user.type(screen.getByLabelText("Email addresses"), "dev@acme.co")
    await user.click(screen.getByRole("button", { name: /Send invitations/ }))
    expect(screen.getByRole("status")).toHaveTextContent("You’re all set")
  })

  it("switches page and layout in the playground", async () => {
    const user = userEvent.setup()
    const { container } = render(<AuthKitPlayground />)
    const root = container.querySelector("[data-slot='auth-kit']")!
    expect(root).toHaveAttribute("data-layout", "split")
    await user.click(screen.getByRole("radio", { name: "Glass" }))
    expect(root).toHaveAttribute("data-layout", "glass")
    await user.click(screen.getByRole("button", { name: "Forgot" }))
    expect(screen.getByRole("heading", { name: "Forgot your password?" })).toBeInTheDocument()
  })
})
