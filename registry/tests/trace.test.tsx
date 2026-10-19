import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { Trace, TraceCollapsible, TraceCollapsibleContent, TraceCollapsibleTrigger, TraceDescription, TraceIcon, TraceLine, TraceTitle } from "@/components/ballmac/trace"

describe("Trace", () => {
  it("adds no roles of its own: a line on its own is text", () => {
    render(
      <Trace>
        <TraceLine>
          <TraceIcon>
            <svg data-testid="icon" />
          </TraceIcon>
          <TraceTitle>Searched the docs</TraceTitle>
          <TraceDescription>0.4s</TraceDescription>
        </TraceLine>
      </Trace>
    )
    expect(screen.queryByRole("button")).toBeNull()
    expect(screen.queryByRole("list")).toBeNull()
    expect(screen.getByText("Searched the docs")).toBeInTheDocument()
    expect(screen.getByTestId("icon").closest("[data-slot=trace-icon]")).toHaveAttribute("aria-hidden", "true")
  })

  it("marks a line's status, and shimmers a running title", () => {
    render(
      <Trace>
        <TraceLine status="running">
          <TraceTitle>Running pnpm build</TraceTitle>
        </TraceLine>
        <TraceLine status="error">
          <TraceTitle>Failed to run pnpm lint</TraceTitle>
        </TraceLine>
        <TraceLine status="pending">
          <TraceTitle>Run pnpm test</TraceTitle>
        </TraceLine>
      </Trace>
    )
    const lines = document.querySelectorAll("[data-slot=trace-line]")
    expect([...lines].map((l) => l.getAttribute("data-status"))).toEqual(["running", "error", "pending"])
    expect(document.querySelector("[data-slot=shimmer-text]")).toHaveTextContent("Running pnpm build")
    expect(document.querySelectorAll("[data-slot=shimmer-text]")).toHaveLength(1)
  })

  it("opens and closes a row from its trigger, with the right ARIA", async () => {
    const user = userEvent.setup()
    render(
      <Trace>
        <TraceCollapsible>
          <TraceCollapsibleTrigger>
            <TraceLine>
              <TraceTitle>Ran node --version</TraceTitle>
            </TraceLine>
          </TraceCollapsibleTrigger>
          <TraceCollapsibleContent>v24.18.0</TraceCollapsibleContent>
        </TraceCollapsible>
      </Trace>
    )
    const trigger = screen.getByRole("button", { name: "Ran node --version" })
    expect(trigger).toHaveAttribute("aria-expanded", "false")
    const content = document.getElementById(trigger.getAttribute("aria-controls")!)!
    expect(content).toHaveAttribute("data-state", "closed")
    expect(content).toHaveAttribute("inert")
    expect(screen.queryByRole("region")).toBeNull() // closed content is hidden from screen readers
    await user.click(trigger)
    expect(trigger).toHaveAttribute("aria-expanded", "true")
    expect(content).not.toHaveAttribute("inert")
    expect(screen.getByRole("region", { name: "Ran node --version" })).toHaveTextContent("v24.18.0")
    await user.keyboard("{Enter}")
    expect(trigger).toHaveAttribute("aria-expanded", "false")
  })

  it("starts open with defaultOpen", () => {
    render(
      <TraceCollapsible defaultOpen>
        <TraceCollapsibleTrigger>
          <TraceLine>
            <TraceTitle>Step</TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>Detail</TraceCollapsibleContent>
      </TraceCollapsible>
    )
    expect(screen.getByRole("button", { name: "Step" })).toHaveAttribute("aria-expanded", "true")
  })

  it("can be controlled, and open ?? running lets the reader's click win", async () => {
    const user = userEvent.setup()
    function Row({ running }: { running: boolean }) {
      const [open, setOpen] = React.useState<boolean>()
      return (
        <TraceCollapsible open={open ?? running} onOpenChange={setOpen}>
          <TraceCollapsibleTrigger>
            <TraceLine status={running ? "running" : undefined}>
              <TraceTitle>Thinking</TraceTitle>
            </TraceLine>
          </TraceCollapsibleTrigger>
          <TraceCollapsibleContent>words</TraceCollapsibleContent>
        </TraceCollapsible>
      )
    }
    const { rerender } = render(<Row running />)
    const trigger = screen.getByRole("button")
    expect(trigger).toHaveAttribute("aria-expanded", "true") // open while it streams
    await user.click(trigger) // the reader closes it
    expect(trigger).toHaveAttribute("aria-expanded", "false")
    rerender(<Row running={false} />)
    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "false") // and their choice stands
  })

  it("reports changes, and can be disabled", async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    const { rerender } = render(
      <TraceCollapsible onOpenChange={onOpenChange}>
        <TraceCollapsibleTrigger>
          <TraceLine>
            <TraceTitle>Step</TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>Detail</TraceCollapsibleContent>
      </TraceCollapsible>
    )
    await user.click(screen.getByRole("button"))
    expect(onOpenChange).toHaveBeenCalledWith(true)
    rerender(
      <TraceCollapsible disabled>
        <TraceCollapsibleTrigger>
          <TraceLine>
            <TraceTitle>Step</TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>Detail</TraceCollapsibleContent>
      </TraceCollapsible>
    )
    expect(screen.getByRole("button")).toBeDisabled()
  })

  it("turns the chevron for right-to-left until it opens", async () => {
    const user = userEvent.setup()
    render(
      <TraceCollapsible>
        <TraceCollapsibleTrigger>
          <TraceLine>
            <TraceTitle>Step</TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>Detail</TraceCollapsibleContent>
      </TraceCollapsible>
    )
    const chevron = () => screen.getByRole("button").querySelector("[data-slot=trace-icon]:last-child svg")!
    expect(chevron().getAttribute("class")).toContain("rtl:rotate-180")
    await user.click(screen.getByRole("button"))
    expect(chevron().getAttribute("class")).toContain("rotate-90")
    expect(chevron().getAttribute("class")).not.toContain("rtl:rotate-180")
  })

  it("lets a link, or any trigger, wrap a line", () => {
    render(
      <Trace>
        <a href="https://example.com">
          <TraceLine>
            <TraceTitle>Install Astro</TraceTitle>
          </TraceLine>
        </a>
      </Trace>
    )
    expect(screen.getByRole("link", { name: "Install Astro" })).toHaveAttribute("href", "https://example.com")
  })

  it("explains itself when a part is used outside a row", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined)
    expect(() => render(<TraceCollapsibleTrigger>x</TraceCollapsibleTrigger>)).toThrow("inside <TraceCollapsible>")
    spy.mockRestore()
  })

  it("composes with Code Block and Questionnaire in one agent turn", async () => {
    const { default: Turn } = await import("../examples/trace-agent-turn")
    const user = userEvent.setup()
    render(<Turn />)
    await user.click(screen.getByRole("button", { name: /Ran the billing tests/ }))
    expect(screen.getByText(/Expected total 40/)).toBeVisible()
    expect(screen.getByRole("group", { name: "Fix first" }) ?? screen.getByText("Fix first")).toBeInTheDocument()
  })
})
