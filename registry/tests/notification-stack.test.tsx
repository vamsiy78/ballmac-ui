import * as React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Notification, NotificationStack } from "@/components/ballmac/notification-stack"

const data = [
  { id: 3, title: "Deploy succeeded" },
  { id: 2, title: "Review requested" },
  { id: 1, title: "Standup at 10:00" },
]

function Stack(props: Partial<React.ComponentProps<typeof NotificationStack>>) {
  const [items, setItems] = React.useState(data)
  return (
    <NotificationStack {...props}>
      {items.map((n) => (
        <Notification key={n.id} title={n.title} onDismiss={() => setItems((c) => c.filter((x) => x.id !== n.id))}>
          Body of {n.title}
        </Notification>
      ))}
    </NotificationStack>
  )
}

describe("NotificationStack", () => {
  it("collapses behind one expand button and hides peeking cards from assistive tech", () => {
    render(<Stack />)
    expect(screen.getByRole("region", { name: "Notifications" })).toHaveAttribute("data-state", "collapsed")
    const expand = screen.getByRole("button", { name: "Show all 3 notifications" })
    expect(expand).toHaveAttribute("aria-expanded", "false")
    expect(expand).toHaveAccessibleDescription(/Deploy succeeded/)
    const peeking = document.querySelectorAll("[data-peek]")
    expect(peeking).toHaveLength(2)
    peeking.forEach((el) => expect(el).toHaveAttribute("aria-hidden", "true"))
    document.querySelectorAll("[data-slot=notification-stack-item]").forEach((el) => expect(el).toHaveAttribute("inert"))
  })

  it("expands with Enter, moves focus to Show less, and collapses with Escape", async () => {
    const user = userEvent.setup()
    render(<Stack />)
    // (jsdom ignores `inert`, which keeps covered cards out of the tab order in browsers.)
    screen.getByRole("button", { name: "Show all 3 notifications" }).focus()
    await user.keyboard("{Enter}")
    const less = screen.getByRole("button", { name: "Show less" })
    expect(less).toHaveAttribute("aria-expanded", "true")
    expect(less).toHaveFocus()
    expect(document.querySelectorAll("[data-peek]")).toHaveLength(0)
    expect(screen.getAllByRole("button", { name: "Dismiss" })).toHaveLength(3)
    await user.keyboard("{Escape}")
    expect(screen.getByRole("button", { name: "Show all 3 notifications" })).toHaveFocus()
  })

  it("dismisses a card when expanded", async () => {
    const user = userEvent.setup()
    render(<Stack defaultExpanded />)
    await user.click(screen.getAllByRole("button", { name: "Dismiss" })[0])
    await waitFor(() => expect(screen.queryByText("Deploy succeeded")).not.toBeInTheDocument(), { timeout: 3000 })
    expect(screen.getAllByRole("button", { name: "Dismiss" })).toHaveLength(2)
  })

  it("supports controlled expansion and clear all", async () => {
    const user = userEvent.setup()
    const onExpandedChange = vi.fn()
    const onClearAll = vi.fn()
    const { rerender } = render(<Stack expanded={false} onExpandedChange={onExpandedChange} onClearAll={onClearAll} />)
    await user.click(screen.getByRole("button", { name: "Show all 3 notifications" }))
    expect(onExpandedChange).toHaveBeenCalledWith(true)
    expect(screen.getByRole("region")).toHaveAttribute("data-state", "collapsed")
    rerender(<Stack expanded onExpandedChange={onExpandedChange} onClearAll={onClearAll} />)
    expect(screen.getByRole("region")).toHaveAttribute("data-state", "expanded")
    await user.click(screen.getByRole("button", { name: "Clear all notifications" }))
    expect(onClearAll).toHaveBeenCalledTimes(1)
  })
})
