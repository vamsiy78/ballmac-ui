import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Settings5, type Settings5Event } from "@/components/ballmac/blocks/settings-5/settings-5"

const events: Settings5Event[] = [
  { id: "1", actor: { name: "Priya Shah", kind: "user" }, action: "member.role_changed", summary: "Made Alex an admin", day: "Today", time: "09:42", ip: "203.0.113.24", changes: { before: "role: member", after: "role: admin" } },
  { id: "2", actor: { name: "Support agent", kind: "agent" }, action: "billing.refund_issued", summary: "Refunded $40", day: "Today", time: "09:15" },
  { id: "3", actor: { name: "Jordan Lee", kind: "user" }, action: "security.sso_enforced", summary: "Required single sign-on", day: "Yesterday", time: "17:20", severity: "critical" },
]

describe("Settings5", () => {
  it("groups by day and expands an event to its details", async () => {
    const user = userEvent.setup()
    render(<Settings5 events={events} />)
    expect(screen.getByRole("region", { name: "Today" })).toBeInTheDocument()
    expect(screen.getByRole("region", { name: "Yesterday" })).toBeInTheDocument()
    const row = screen.getByRole("button", { name: /Made Alex an admin/ })
    expect(row).toHaveAttribute("aria-expanded", "false")
    await user.click(row)
    expect(row).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByText("203.0.113.24")).toBeInTheDocument()
  })

  it("renders events without details as plain rows, and labels severity", () => {
    render(<Settings5 events={events} />)
    expect(screen.queryByRole("button", { name: /Refunded \$40/ })).toBeNull()
    expect(screen.getByLabelText("Critical")).toBeInTheDocument()
  })

  it("filters by who and search, and exports what matches", async () => {
    const user = userEvent.setup()
    const onExport = vi.fn()
    render(<Settings5 events={events} onExport={onExport} />)
    await user.click(screen.getByRole("radio", { name: "Agents" }))
    expect(screen.queryByText(/Made Alex an admin/)).toBeNull()
    await user.click(screen.getByRole("button", { name: /Export CSV/ }))
    expect(onExport).toHaveBeenCalledWith([events[1]])
    await user.click(screen.getByRole("radio", { name: "Everyone" }))
    await user.type(screen.getByRole("searchbox"), "sign-on")
    expect(screen.getByText(/Required single sign-on/)).toBeInTheDocument()
    expect(screen.queryByText(/Refunded/)).toBeNull()
  })

  it("loads older events", async () => {
    const user = userEvent.setup()
    const onLoadMore = vi.fn().mockResolvedValue(undefined)
    render(<Settings5 events={events} hasMore onLoadMore={onLoadMore} />)
    await user.click(screen.getByRole("button", { name: "Load older events" }))
    expect(onLoadMore).toHaveBeenCalled()
  })
})
