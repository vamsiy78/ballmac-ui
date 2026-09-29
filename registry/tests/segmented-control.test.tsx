import * as React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { SegmentedControl, SegmentedControlItem } from "@/components/ballmac/segmented-control"

function Range(props: Partial<React.ComponentProps<typeof SegmentedControl>>) {
  return (
    <SegmentedControl aria-label="Range" {...props}>
      <SegmentedControlItem value="day">Day</SegmentedControlItem>
      <SegmentedControlItem value="week">Week</SegmentedControlItem>
      <SegmentedControlItem value="month">Month</SegmentedControlItem>
    </SegmentedControl>
  )
}

describe("SegmentedControl", () => {
  it("is a labelled radio group that selects the first item by default", () => {
    render(<Range />)
    expect(screen.getByRole("radiogroup", { name: "Range" })).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: "Day" })).toHaveAttribute("aria-checked", "true")
    expect(screen.getByRole("radio", { name: "Week" })).toHaveAttribute("aria-checked", "false")
    expect(document.querySelectorAll("[data-slot=segmented-control-indicator]")).toHaveLength(1)
  })

  it("selects with click and arrow keys (uncontrolled), wrapping at the ends", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Range defaultValue="week" onValueChange={onValueChange} />)
    await user.tab()
    expect(screen.getByRole("radio", { name: "Week" })).toHaveFocus()
    // Radix moves focus with the arrows (and selects on focus in browsers); Space selects the focused segment.
    await user.keyboard("{ArrowRight}")
    await waitFor(() => expect(screen.getByRole("radio", { name: "Month" })).toHaveFocus())
    await user.keyboard(" ")
    expect(screen.getByRole("radio", { name: "Month" })).toHaveAttribute("aria-checked", "true")
    await user.keyboard("{ArrowRight}")
    await waitFor(() => expect(screen.getByRole("radio", { name: "Day" })).toHaveFocus())
    await user.keyboard(" ")
    expect(screen.getByRole("radio", { name: "Day" })).toHaveAttribute("aria-checked", "true")
    await user.click(screen.getByRole("radio", { name: "Week" }))
    expect(onValueChange.mock.calls.map((c) => c[0])).toEqual(["month", "day", "week"])
  })

  it("follows the value prop when controlled", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const { rerender } = render(<Range value="day" onValueChange={onValueChange} />)
    await user.click(screen.getByRole("radio", { name: "Month" }))
    expect(onValueChange).toHaveBeenCalledWith("month")
    expect(screen.getByRole("radio", { name: "Day" })).toHaveAttribute("aria-checked", "true")
    rerender(<Range value="month" onValueChange={onValueChange} />)
    expect(screen.getByRole("radio", { name: "Month" })).toHaveAttribute("aria-checked", "true")
  })

  it("skips disabled segments", async () => {
    const user = userEvent.setup()
    render(
      <SegmentedControl aria-label="View" defaultValue="list">
        <SegmentedControlItem value="list">List</SegmentedControlItem>
        <SegmentedControlItem value="grid" disabled>
          Grid
        </SegmentedControlItem>
        <SegmentedControlItem value="columns">Columns</SegmentedControlItem>
      </SegmentedControl>
    )
    await user.tab()
    await user.keyboard("{ArrowRight}")
    await waitFor(() => expect(screen.getByRole("radio", { name: "Columns" })).toHaveFocus())
    expect(screen.getByRole("radio", { name: "Grid" })).toBeDisabled()
  })
})
