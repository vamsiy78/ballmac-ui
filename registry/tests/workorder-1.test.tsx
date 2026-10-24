import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Workorder1 } from "@/components/ballmac/blocks/workorder-1/workorder-1"

describe("Workorder1", () => {
  it("shows the five steps with the current one marked, in words for assistive technology", () => {
    render(<Workorder1 />)
    const steps = within(screen.getByRole("list", { name: "Progress" })).getAllByRole("listitem")
    expect(steps).toHaveLength(5)
    expect(steps[0]).toHaveTextContent("Received, done")
    expect(steps[1]).toHaveAttribute("aria-current", "step")
    expect(steps[1]).toHaveTextContent("Diagnosing, current step")
    expect(steps[4]).toHaveTextContent("not started")
  })

  it("adds up parts and labour with tax into a total", () => {
    render(<Workorder1 />)
    // 0.5 h x 60 + 1 x 48.50 = 78.50; tax 20% = 15.70; total 94.20
    expect(screen.getByText("$78.50")).toBeInTheDocument()
    expect(screen.getByText("$15.70")).toBeInTheDocument()
    expect(screen.getByText("$94.20")).toBeInTheDocument()
    expect(screen.getByText("Tax (20%)")).toBeInTheDocument()
  })

  it("moves to the next step, records it in the history and updates the button", async () => {
    const user = userEvent.setup()
    const onAdvance = vi.fn().mockResolvedValue(undefined)
    render(<Workorder1 onAdvance={onAdvance} />)
    await user.click(screen.getByRole("button", { name: /Move to waiting for parts/ }))
    expect(onAdvance).toHaveBeenCalledWith("waiting-parts")
    expect(await screen.findByText("Moved to waiting for parts.", { selector: "p" })).toBeInTheDocument()
    expect(within(screen.getByRole("list", { name: "History, newest first" })).getAllByRole("listitem")[0]).toHaveTextContent("Moved to waiting for parts.")
    expect(screen.getByRole("button", { name: /Move to repairing/ })).toBeInTheDocument()
  })

  it("adds a line and the totals follow, and ignores an incomplete one", async () => {
    const user = userEvent.setup()
    const onAddLine = vi.fn().mockResolvedValue(undefined)
    render(<Workorder1 onAddLine={onAddLine} />)
    await user.click(screen.getByRole("button", { name: "Add" }))
    expect(onAddLine).not.toHaveBeenCalled()
    await user.type(screen.getByLabelText("Description"), "Thermal fuse")
    await user.clear(screen.getByLabelText("Quantity"))
    await user.type(screen.getByLabelText("Quantity"), "2")
    await user.type(screen.getByLabelText("Price each"), "6.5")
    await user.click(screen.getByRole("button", { name: "Add" }))
    expect(onAddLine).toHaveBeenCalledWith({ kind: "part", description: "Thermal fuse", qty: 2, unit: 6.5 })
    expect(await screen.findByText("$13.00")).toBeInTheDocument()
    expect(screen.getByText("$91.50")).toBeInTheDocument()
  })

  it("sends a message in one click, records it, and says if it fails", async () => {
    const user = userEvent.setup()
    const onMessage = vi.fn().mockResolvedValue(undefined)
    const { rerender } = render(<Workorder1 onMessage={onMessage} />)
    await user.click(screen.getByRole("button", { name: /Need a part/ }))
    expect(onMessage).toHaveBeenCalledWith({ id: "m1", text: expect.stringContaining("part is needed") })
    expect(await screen.findByText("Sent to Ines Carvalho: need a part.")).toBeInTheDocument()
    rerender(<Workorder1 onMessage={() => Promise.reject(new Error("The SMS service is down."))} />)
    await user.click(screen.getByRole("button", { name: /Ready to collect/ }))
    expect(await screen.findByRole("alert")).toHaveTextContent("The SMS service is down.")
  })

  it("shows loading, empty and error states", () => {
    const { rerender } = render(<Workorder1 state="loading" />)
    expect(screen.getByRole("status")).toHaveTextContent("Loading the work order")
    rerender(<Workorder1 order={null} />)
    expect(screen.getByText("No work order selected")).toBeInTheDocument()
    rerender(<Workorder1 state="error" onRetry={() => {}} />)
    expect(screen.getByRole("alert")).toHaveTextContent("The work order could not be loaded")
  })
})
