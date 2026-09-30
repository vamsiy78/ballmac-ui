import * as React from "react"
import { act, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { ToastStack } from "@/components/ballmac/toast-stack"

const messages = [
  { id: "saved", title: "Saved", description: "Changes are ready" },
]

describe("ToastStack", () => {
  it("dismisses with Escape from a focused toast", async () => {
    const user = userEvent.setup()
    render(<ToastStack defaultToasts={messages} durationMs={0} />)
    screen.getByRole("button", { name: "Dismiss Saved" }).focus()
    await user.keyboard("{Escape}")
    expect(screen.queryByText("Changes are ready")).not.toBeInTheDocument()
  })

  it("preserves a controlled list and reports dismissal", async () => {
    const user = userEvent.setup()
    const onToastsChange = vi.fn()
    render(
      <ToastStack
        toasts={messages}
        durationMs={0}
        onToastsChange={onToastsChange}
      />,
    )
    await user.click(screen.getByRole("button", { name: "Dismiss Saved" }))
    expect(onToastsChange).toHaveBeenCalledWith([])
    expect(screen.getByText("Changes are ready")).toBeInTheDocument()
  })

  it("pauses auto-dismiss while hovered", () => {
    vi.useFakeTimers()
    try {
      render(<ToastStack defaultToasts={messages} durationMs={1000} />)
      const stack = screen.getByRole("region", { name: "Notifications" })
      fireEvent.mouseEnter(stack)
      act(() => vi.advanceTimersByTime(1500))
      expect(screen.getByText("Changes are ready")).toBeInTheDocument()
      fireEvent.mouseLeave(stack)
      act(() => vi.advanceTimersByTime(1000))
      expect(screen.queryByText("Changes are ready")).not.toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })
})
