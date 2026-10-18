import * as React from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { Status1 } from "@/components/ballmac/blocks/status-1/status-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

describe("Status1", () => {
  it("works out the overall message from the services", () => {
    const { rerender } = render(<Status1 />)
    expect(screen.getByRole("status")).toHaveTextContent("Some systems are slower than usual")
    rerender(<Status1 incidents={[]} components={[{ id: "a", name: "API", status: "operational", days: Array(90).fill("ok") }]} />)
    expect(screen.getByRole("status")).toHaveTextContent("All systems operational")
    rerender(<Status1 incidents={[]} components={[{ id: "a", name: "API", status: "outage", days: Array(90).fill("ok") }, { id: "b", name: "Web", status: "degraded", days: Array(90).fill("ok") }]} />)
    expect(screen.getByRole("status")).toHaveTextContent("Some systems are down")
  })

  it("says each service's state in words", () => {
    render(<Status1 />)
    const api = screen.getByRole("heading", { level: 3, name: "API" }).closest("li")!
    expect(within(api).getByText("Degraded")).toBeInTheDocument()
    expect(within(screen.getByRole("heading", { level: 3, name: "File storage" }).closest("li")!).getByText("Maintenance")).toBeInTheDocument()
  })

  it("summarises a history in text with uptime worked out from the days", () => {
    const days = Array(90).fill("ok")
    days[10] = "outage"
    days[20] = "degraded"
    render(<Status1 incidents={[]} components={[{ id: "a", name: "API", status: "operational", days }]} />)
    expect(screen.getByText("98.33% uptime over 90 days: 1 day with an outage, 1 degraded")).toBeInTheDocument()
  })

  it("lets a keyboard user step through the days and hears the date", async () => {
    const user = userEvent.setup()
    const days = Array(90).fill("ok")
    days[88] = "outage"
    render(<Status1 incidents={[]} components={[{ id: "a", name: "API", status: "operational", days }]} today="2026-10-18" locale="en-GB" />)
    const bar = screen.getByRole("slider", { name: /API history/ })
    await user.tab()
    expect(bar).toHaveFocus()
    expect(bar).toHaveAttribute("aria-valuetext", "18 Oct 2026: No issues")
    await user.keyboard("{ArrowLeft}")
    expect(bar).toHaveAttribute("aria-valuetext", "17 Oct 2026: Outage")
    await user.keyboard("{Home}")
    expect(bar).toHaveAttribute("aria-valuenow", "0")
    await user.keyboard("{End}")
    expect(bar).toHaveAttribute("aria-valuenow", "89")
  })

  it("shows live incidents as a timeline and past ones by day, with the quiet days said plainly", () => {
    render(<Status1 />)
    const now = screen.getByRole("heading", { name: "Happening now" }).closest("section")!
    expect(within(now).getByText("Slower responses from the API")).toBeInTheDocument()
    expect(within(now).getByText("Investigating")).toBeInTheDocument()
    const past = screen.getByRole("heading", { name: "Past incidents" }).closest("section")!
    expect(within(past).getAllByText("No incidents reported.").length).toBeGreaterThan(1)
    expect(within(past).getByText("Emails sent late")).toBeInTheDocument()
    expect(within(past).getByText(/to October 18/)).toBeInTheDocument()
  })

  it("validates the email and subscribes", async () => {
    const user = userEvent.setup()
    const onSubscribe = vi.fn().mockResolvedValue(undefined)
    render(<Status1 onSubscribe={onSubscribe} />)
    await user.click(screen.getByRole("button", { name: "Subscribe" }))
    expect(screen.getByRole("alert")).toHaveTextContent("Enter an email address")
    await user.type(screen.getByLabelText("Email address"), "me@acme.com")
    await user.click(screen.getByRole("button", { name: "Subscribe" }))
    expect(onSubscribe).toHaveBeenCalledWith("me@acme.com")
    expect(await screen.findByText(/Subscribed/)).toBeInTheDocument()
  })

  it("shows a failed subscription in place", async () => {
    const user = userEvent.setup()
    render(<Status1 onSubscribe={() => Promise.reject(new Error("That address is blocked."))} />)
    await user.type(screen.getByLabelText("Email address"), "me@acme.com")
    await user.click(screen.getByRole("button", { name: "Subscribe" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("blocked")
  })

  it("shows loading, empty and error states", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const { rerender } = render(<Status1 state="loading" />)
    expect(screen.getByRole("status")).toBeInTheDocument()
    rerender(<Status1 state="empty" />)
    expect(screen.getByRole("heading", { name: "No services are listed yet" })).toBeInTheDocument()
    rerender(<Status1 state="error" onRetry={onRetry} />)
    await user.click(screen.getByRole("button", { name: /try again/i }))
    expect(onRetry).toHaveBeenCalled()
  })
})
