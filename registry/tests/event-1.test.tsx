import * as React from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { Event1 } from "@/components/ballmac/blocks/event-1/event-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

describe("Event1", () => {
  it("counts the days to go from the moment passed in", () => {
    render(<Event1 now="2026-10-18T10:00:00Z" />)
    expect(screen.getByText("25 days to go")).toBeInTheDocument()
  })

  it("shows the first day, switches day with the keyboard, and filters by track", async () => {
    const user = userEvent.setup()
    render(<Event1 />)
    expect(screen.getByRole("tab", { name: /Day 1/ })).toHaveAttribute("aria-selected", "true")
    expect(screen.getByRole("heading", { name: "Opening keynote: software that respects people" })).toBeInTheDocument()
    screen.getByRole("tab", { name: /Day 1/ }).focus()
    await user.keyboard("{ArrowRight}")
    expect(screen.getByRole("tab", { name: /Day 2/ })).toHaveAttribute("aria-selected", "true")
    expect(screen.getByRole("tab", { name: /Day 2/ })).toHaveFocus()
    expect(screen.getByRole("heading", { name: "Closing panel: what we got wrong" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Design" }))
    expect(screen.getByRole("heading", { name: "Motion that helps, not distracts" })).toBeInTheDocument()
    expect(screen.queryByRole("heading", { name: "Closing panel: what we got wrong" })).toBeNull()
  })

  it("saves and removes sessions, announces it and tells the host", async () => {
    const user = userEvent.setup()
    const onSavedChange = vi.fn()
    render(<Event1 onSavedChange={onSavedChange} />)
    await user.click(screen.getByRole("button", { name: /Save Opening keynote/ }))
    expect(onSavedChange).toHaveBeenLastCalledWith(["s1"])
    expect(screen.getByRole("button", { name: /Saved Opening keynote/ })).toHaveAttribute("aria-pressed", "true")
    const mine = screen.getByRole("heading", { name: /My schedule/ }).closest("aside")!
    expect(within(mine).getByText("Opening keynote: software that respects people")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /Saved Opening keynote/ }))
    expect(onSavedChange).toHaveBeenLastCalledWith([])
  })

  it("warns when two saved sessions overlap, naming the other one", () => {
    render(<Event1 defaultSaved={["s2", "s3"]} />)
    expect(screen.getAllByRole("status").some((s) => /Overlaps with Postgres in production/.test(s.textContent ?? ""))).toBe(true)
    expect(screen.getAllByRole("status").some((s) => /Overlaps with Design systems at 400 designers/.test(s.textContent ?? ""))).toBe(true)
  })

  it("does not warn for back-to-back sessions", () => {
    render(<Event1 defaultSaved={["s2", "s4"]} />)
    expect(screen.queryByText(/Overlaps with/)).toBeNull()
  })

  it("builds a calendar file with the venue's time zone", async () => {
    const user = userEvent.setup()
    let blob: Blob | undefined
    URL.createObjectURL = vi.fn((b: Blob) => ((blob = b), "blob:x"))
    URL.revokeObjectURL = vi.fn()
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {})
    render(<Event1 utcOffset={1} defaultSaved={["s1"]} />)
    await user.click(screen.getByRole("button", { name: "Add to my calendar" }))
    expect(click).toHaveBeenCalled()
    const text = await new Promise<string>((res) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.readAsText(blob!) })
    expect(text).toContain("BEGIN:VCALENDAR")
    // 09:00 at UTC+1 is 08:00 UTC.
    expect(text).toContain("DTSTART:20261112T080000Z")
    expect(text).toContain("DTEND:20261112T084500Z")
    expect(text).toContain("SUMMARY:Opening keynote: software that respects people")
    click.mockRestore()
  })

  it("explains how to start a schedule when it is empty", () => {
    render(<Event1 />)
    expect(screen.getByText(/Press Save on a session/)).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Add to my calendar" })).toBeNull()
  })
})
