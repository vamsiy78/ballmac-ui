import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Billing1 } from "@/components/ballmac/blocks/billing-1/billing-1"
import { Billing2 } from "@/components/ballmac/blocks/billing-2/billing-2"
import { Blog1 } from "@/components/ballmac/blocks/blog-1/blog-1"
import { Calendar1 } from "@/components/ballmac/blocks/calendar-1/calendar-1"
import { Changelog1 } from "@/components/ballmac/blocks/changelog-1/changelog-1"
import { Dashboard1 } from "@/components/ballmac/blocks/dashboard-1/dashboard-1"
import { Dashboard2 } from "@/components/ballmac/blocks/dashboard-2/dashboard-2"
import { Kanban1 } from "@/components/ballmac/blocks/kanban-1/kanban-1"
import { Mail1 } from "@/components/ballmac/blocks/mail-1/mail-1"
import type { StateProps } from "@/components/ballmac/state-view"

type Block = React.ComponentType<StateProps & Record<string, unknown>>

/**
 * Every block that takes `state` behaves the same way, so they are tested the same way. `domain` are props the block's own
 * logic uses; none of them may end up as attributes on the page while the block shows a state.
 */
const blocks: { name: string; Block: Block; loadingLabel: RegExp; heading?: string; domain: Record<string, unknown>; empty: "message" | "interface" }[] = [
  { name: "Mail1", Block: Mail1 as Block, loadingLabel: /loading messages/i, domain: { messages: [], me: { name: "A", email: "a@b.c" }, onSend: () => {} }, empty: "interface" },
  { name: "Dashboard1", Block: Dashboard1 as Block, loadingLabel: /loading the overview/i, heading: "Overview", domain: { getSeries: () => [], orders: [], channels: [], defaultRange: "7d", onRangeChange: () => {} }, empty: "message" },
  { name: "Dashboard2", Block: Dashboard2 as Block, loadingLabel: /loading traffic/i, heading: "Traffic", domain: { getSeries: () => [], pages: [], countries: [], live: 3 }, empty: "message" },
  { name: "Kanban1", Block: Kanban1 as Block, loadingLabel: /loading the board/i, heading: "Launch plan", domain: { defaultColumns: [], onChange: () => {}, height: "20rem" }, empty: "message" },
  { name: "Calendar1", Block: Calendar1 as Block, loadingLabel: /loading your calendar/i, domain: { defaultEvents: [], onAdd: () => {}, height: "20rem" }, empty: "interface" },
  { name: "Blog1", Block: Blog1 as Block, loadingLabel: /loading posts/i, heading: "Ideas, updates and field notes.", domain: { posts: [], filterable: false }, empty: "message" },
  { name: "Changelog1", Block: Changelog1 as Block, loadingLabel: /loading releases/i, heading: "What’s new", domain: { releases: [], initialCount: 1 }, empty: "message" },
  { name: "Billing1", Block: Billing1 as Block, loadingLabel: /loading billing/i, heading: "Billing", domain: { onChangePlan: () => {}, currency: "EUR" }, empty: "message" },
  { name: "Billing2", Block: Billing2 as Block, loadingLabel: /loading plans/i, heading: "Change your plan", domain: { plans: [], currentSeats: 3 }, empty: "message" },
]

const ALLOWED = /^(class|style|id|role|lang|dir|title|hidden|tabindex|data-.+|aria-.+)$/

describe.each(blocks)("$name states", ({ Block, loadingLabel, heading, domain, empty }) => {
  it("loading: busy, announced, skeleton hidden from assistive technology, keeps its heading, nothing clickable", () => {
    const { container } = render(<Block state="loading" {...domain} />)
    const root = container.firstElementChild as HTMLElement
    expect(root).toHaveAttribute("data-state", "loading")
    expect(container.querySelector("[aria-busy=true]")).toBeTruthy()
    expect(screen.getByRole("status")).toHaveTextContent(loadingLabel)
    expect(container.querySelectorAll("[data-slot=skeleton]").length).toBeGreaterThan(5)
    for (const sk of container.querySelectorAll("[data-slot=skeleton]")) expect(sk).toHaveAttribute("aria-hidden", "true")
    if (heading) expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument()
    expect(screen.queryAllByRole("button")).toHaveLength(0)
  })

  it("error: an alert with a working retry, and your copy wins over the default", async () => {
    const onRetry = vi.fn()
    const { container } = render(<Block state="error" onRetry={onRetry} errorState={{ title: "Custom failure" }} {...domain} />)
    expect(container.firstElementChild).toHaveAttribute("data-state", "error")
    expect(screen.getByRole("alert")).toHaveTextContent("Custom failure")
    await userEvent.click(screen.getByRole("button", { name: /try again/i }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it("error without onRetry draws no retry button", () => {
    render(<Block state="error" {...domain} />)
    expect(screen.queryByRole("button", { name: /try again/i })).toBeNull()
  })

  it(empty === "message" ? "empty: a clear message, with your copy and action" : "empty: the real interface with nothing in it", () => {
    const { container } = render(<Block state="empty" emptyState={{ title: "Nothing at all", description: "Come back later.", action: <button>Make one</button> }} {...domain} />)
    if (empty === "message") {
      expect(container.firstElementChild).toHaveAttribute("data-state", "empty")
      expect(screen.getByRole("heading", { name: "Nothing at all" })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Make one" })).toBeInTheDocument()
    } else {
      expect(container.querySelector("[data-state=empty]")).toBeNull()
      expect(container.querySelector("[data-slot=skeleton]")).toBeNull()
    }
  })

  it("never puts the block's own props on the DOM while showing a state", () => {
    for (const state of ["loading", "error", "empty"] as const) {
      const { container, unmount } = render(<Block state={state} {...domain} />)
      for (const el of [container.firstElementChild as HTMLElement]) for (const attr of el.getAttributeNames()) expect(attr, `${state}: ${attr}`).toMatch(ALLOWED)
      unmount()
    }
  })

  it("is the normal block when ready or when state is left out", () => {
    const { container, rerender } = render(<Block {...domain} />)
    expect(container.querySelector("[data-state=loading], [data-state=error], [data-state=empty]")).toBeNull()
    rerender(<Block state="ready" {...domain} />)
    expect(container.querySelector("[data-state=loading], [data-state=error], [data-state=empty]")).toBeNull()
  })
})

describe("frame blocks keep their size in every state", () => {
  it("Mail1 and Calendar1", () => {
    for (const Block of [Mail1 as Block, Calendar1 as Block]) {
      for (const state of ["loading", "error"] as const) {
        const { container, unmount } = render(<Block state={state} height="20rem" />)
        expect((container.firstElementChild as HTMLElement).style.height).toBe("20rem")
        unmount()
      }
    }
  })

  it("Mail1 empty keeps Compose working", () => {
    render(<Mail1 state="empty" emptyState={{ title: "Inbox zero" }} />)
    expect(screen.getByText("Inbox zero")).toBeInTheDocument()
    expect(screen.getAllByRole("button", { name: /compose/i }).length).toBeGreaterThan(0)
  })
})
