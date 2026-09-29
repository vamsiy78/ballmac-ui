import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import {
  AnimatedTabs,
  AnimatedTabsContent,
  AnimatedTabsList,
  AnimatedTabsTrigger,
} from "@/components/ballmac/animated-tabs"

function Example(props: React.ComponentProps<typeof AnimatedTabs>) {
  return (
    <AnimatedTabs {...props}>
      <AnimatedTabsList aria-label="Views">
        <AnimatedTabsTrigger value="one">One</AnimatedTabsTrigger>
        <AnimatedTabsTrigger value="two">Two</AnimatedTabsTrigger>
        <AnimatedTabsTrigger value="three">Three</AnimatedTabsTrigger>
      </AnimatedTabsList>
      <AnimatedTabsContent value="one">Panel one</AnimatedTabsContent>
      <AnimatedTabsContent value="two">Panel two</AnimatedTabsContent>
      <AnimatedTabsContent value="three">Panel three</AnimatedTabsContent>
    </AnimatedTabs>
  )
}

const indicatorIn = (name: string) =>
  screen.getByRole("tab", { name }).querySelector("[data-slot=animated-tabs-indicator]")

describe("AnimatedTabs", () => {
  it("exposes tab roles and moves the indicator with the selection (uncontrolled)", async () => {
    render(<Example defaultValue="one" />)
    expect(screen.getByRole("tablist", { name: "Views" })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "One" })).toHaveAttribute("aria-selected", "true")
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Panel one")
    expect(indicatorIn("One")).not.toBeNull()
    expect(indicatorIn("One")).toHaveAttribute("aria-hidden", "true")

    await userEvent.click(screen.getByRole("tab", { name: "Two" }))
    expect(screen.getByRole("tab", { name: "Two" })).toHaveAttribute("aria-selected", "true")
    expect(screen.getByRole("tab", { name: "One" })).toHaveAttribute("aria-selected", "false")
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Panel two")
    expect(indicatorIn("Two")).not.toBeNull()
    expect(indicatorIn("One")).toBeNull()
  })

  it("supports arrow, Home and End keys", async () => {
    render(<Example defaultValue="one" />)
    screen.getByRole("tab", { name: "One" }).focus()
    await userEvent.keyboard("{ArrowRight}")
    expect(screen.getByRole("tab", { name: "Two" })).toHaveFocus()
    expect(screen.getByRole("tab", { name: "Two" })).toHaveAttribute("aria-selected", "true")
    await userEvent.keyboard("{End}")
    expect(screen.getByRole("tab", { name: "Three" })).toHaveFocus()
    await userEvent.keyboard("{Home}")
    expect(screen.getByRole("tab", { name: "One" })).toHaveFocus()
    await userEvent.keyboard("{ArrowLeft}")
    expect(screen.getByRole("tab", { name: "Three" })).toHaveFocus()
  })

  it("works controlled", async () => {
    const onValueChange = vi.fn()
    const { rerender } = render(<Example value="one" onValueChange={onValueChange} />)
    await userEvent.click(screen.getByRole("tab", { name: "Three" }))
    expect(onValueChange).toHaveBeenCalledWith("three")
    // Parent hasn't updated yet: selection stays put.
    expect(screen.getByRole("tab", { name: "One" })).toHaveAttribute("aria-selected", "true")
    rerender(<Example value="three" onValueChange={onValueChange} />)
    expect(screen.getByRole("tab", { name: "Three" })).toHaveAttribute("aria-selected", "true")
    expect(indicatorIn("Three")).not.toBeNull()
  })
})
