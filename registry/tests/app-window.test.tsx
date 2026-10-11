import * as React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { AppWindow, AppWindowContent, AppWindowControls, AppWindowTitleBar } from "@/components/ballmac/app-window"

const handlers = () => ({ onClose: vi.fn(), onMinimize: vi.fn(), onMaximize: vi.fn() })

function Window({ feel, ...rest }: { feel: "macos" | "windows" | "ios" | "web" } & Partial<React.ComponentProps<typeof AppWindow>>) {
  return (
    <AppWindow feel={feel} active {...rest}>
      <AppWindowTitleBar title="Notes">
        <button type="button">Tool</button>
      </AppWindowTitleBar>
      <AppWindowContent>Body</AppWindowContent>
    </AppWindow>
  )
}

describe("AppWindow", () => {
  it("draws the traffic lights for macOS, with the title centered and no caption buttons", () => {
    render(<Window feel="macos" {...handlers()} />)
    expect(screen.getByRole("button", { name: "Close window" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Minimize window" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Enter full screen" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Maximize window" })).toBeNull()
  })

  it("draws minimize, maximize and close for Windows, in that order, after the toolbar", () => {
    render(<Window feel="windows" {...handlers()} />)
    const names = screen.getAllByRole("button").map((b) => b.getAttribute("aria-label") ?? b.textContent)
    expect(names).toEqual(["Tool", "Minimize window", "Maximize window", "Close window"])
  })

  it("draws no window controls for iOS or web", () => {
    for (const feel of ["ios", "web"] as const) {
      const { unmount } = render(<Window feel={feel} {...handlers()} />)
      expect(screen.queryByRole("button", { name: /window|full screen/i })).toBeNull()
      unmount()
    }
  })

  it("calls the handlers, and the green macOS button maximizes when there is no full-screen handler", async () => {
    const h = handlers()
    const user = userEvent.setup()
    render(<Window feel="macos" {...h} />)
    await user.click(screen.getByRole("button", { name: "Close window" }))
    await user.click(screen.getByRole("button", { name: "Minimize window" }))
    await user.click(screen.getByRole("button", { name: "Enter full screen" }))
    expect([h.onClose, h.onMinimize, h.onMaximize].map((f) => f.mock.calls.length)).toEqual([1, 1, 1])
  })

  it("sends the green button to full screen, and to zoom while Option is held", async () => {
    const onFullscreen = vi.fn()
    const onMaximize = vi.fn()
    const user = userEvent.setup()
    render(<Window feel="macos" onFullscreen={onFullscreen} onMaximize={onMaximize} />)
    await user.click(screen.getByRole("button", { name: "Enter full screen" }))
    expect(onFullscreen).toHaveBeenCalledTimes(1)
    fireEvent.keyDown(window, { key: "Alt", altKey: true })
    await user.click(screen.getByRole("button", { name: "Zoom window" }))
    expect(onMaximize).toHaveBeenCalledTimes(1)
  })

  it("shows restore instead of maximize on a maximized Windows window, and squares the corners", () => {
    const { container } = render(<Window feel="windows" maximized {...handlers()} />)
    expect(screen.getByRole("button", { name: "Restore window" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Maximize window" })).toBeNull()
    expect(container.querySelector("[data-slot=app-window]")).toHaveClass("rounded-none")
  })

  it("maximizes on a double-click of the bar or its title, but not of a button inside it", async () => {
    const onMaximize = vi.fn()
    const user = userEvent.setup()
    render(<Window feel="macos" onMaximize={onMaximize} />)
    await user.dblClick(screen.getByText("Notes"))
    expect(onMaximize).toHaveBeenCalledTimes(1)
    await user.dblClick(screen.getByRole("button", { name: "Tool" }))
    expect(onMaximize).toHaveBeenCalledTimes(1)
  })

  it("marks the bar as a drag region for Tauri and Electron, and the toolbar as not draggable", () => {
    const { container } = render(<Window feel="windows" {...handlers()} />)
    const bar = container.querySelector("[data-slot=app-window-titlebar]") as HTMLElement
    expect(bar).toHaveAttribute("data-tauri-drag-region")
    expect(bar.style.getPropertyValue("-webkit-app-region") || (bar.style as unknown as Record<string, string>).WebkitAppRegion).toBe("drag")
    const toolbar = container.querySelector("[data-slot=app-window-toolbar]") as HTMLElement
    expect(toolbar.style.getPropertyValue("-webkit-app-region") || (toolbar.style as unknown as Record<string, string>).WebkitAppRegion).toBe("no-drag")
  })

  it("draws the lights without making them buttons when there are no handlers", () => {
    render(<Window feel="macos" />)
    expect(screen.queryByRole("button", { name: "Close window" })).toBeNull()
  })

  it("dims when it is not the active window", () => {
    const { container } = render(<Window feel="macos" active={false} {...handlers()} />)
    expect(container.querySelector("[data-slot=app-window]")).toHaveAttribute("data-state", "inactive")
  })

  it("follows the real window focus when active is not given", () => {
    const { container } = render(
      <AppWindow feel="macos" {...handlers()}>
        <AppWindowTitleBar title="Notes" />
      </AppWindow>
    )
    const win = container.querySelector("[data-slot=app-window]")!
    expect(win).toHaveAttribute("data-state", "inactive") // jsdom reports no focused document
    vi.spyOn(document, "hasFocus").mockReturnValue(true)
    fireEvent.focus(window)
    expect(win).toHaveAttribute("data-state", "active")
  })

  it("renders just the controls for a custom title bar", () => {
    render(
      <AppWindow feel="windows" {...handlers()}>
        <AppWindowControls />
      </AppWindow>
    )
    expect(screen.getAllByRole("button")).toHaveLength(3)
  })

  it("takes the feel from the page when none is given", () => {
    document.documentElement.setAttribute("data-feel", "windows")
    const { container } = render(
      <AppWindow active>
        <AppWindowTitleBar title="Notes" />
      </AppWindow>
    )
    expect(container.querySelector("[data-slot=app-window]")).toHaveAttribute("data-feel", "windows")
    document.documentElement.removeAttribute("data-feel")
  })
})
