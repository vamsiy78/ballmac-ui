import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Fleet1 } from "@/components/ballmac/blocks/fleet-1/fleet-1"

describe("Fleet1", () => {
  it("lists vehicles needing attention first and writes each issue out", () => {
    render(<Fleet1 />)
    const first = screen.getAllByRole("listitem")[0]
    expect(first).toHaveTextContent("Van 07")
    expect(first).toHaveTextContent("Tyre pressure low on the rear left")
    expect(first).toHaveTextContent("Low level: 11%")
    expect(first).toHaveTextContent("Service due in 380 km")
    expect(screen.getByText(/3 vehicles need attention\./)).toBeInTheDocument()
  })

  it("writes status in words and shows level as a meter that says low", () => {
    render(<Fleet1 />)
    expect(screen.getByText("Moving · 86 km/h")).toBeInTheDocument()
    expect(screen.getAllByText("In service").length).toBeGreaterThan(1)
    expect(screen.getByRole("meter", { name: "Van 07 level" })).toHaveAttribute("aria-valuetext", "11 percent, low")
    expect(screen.getAllByText("11% · low")).toHaveLength(1)
  })

  it("filters by status with counts", async () => {
    const user = userEvent.setup()
    render(<Fleet1 />)
    await user.click(screen.getByRole("button", { name: /^Moving 3/ }))
    expect(screen.getAllByRole("listitem")).toHaveLength(3)
    expect(screen.queryByText("Van 02")).toBeNull()
  })

  it("messages the driver and books a service, and says so", async () => {
    const user = userEvent.setup()
    const onMessage = vi.fn().mockResolvedValue(undefined)
    const onBookService = vi.fn().mockResolvedValue(undefined)
    render(<Fleet1 onMessage={onMessage} onBookService={onBookService} />)
    await user.click(screen.getByRole("button", { name: /^Van 07/ }))
    await user.type(screen.getByLabelText("Message for Aisha Rahman"), "Check the tyre at the next stop.")
    await user.click(screen.getByRole("button", { name: "Send" }))
    expect(onMessage).toHaveBeenCalledWith(expect.objectContaining({ id: "v2" }), "Check the tyre at the next stop.")
    expect(await screen.findByText("Sent to Aisha Rahman.")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Book a service" }))
    expect(onBookService).toHaveBeenCalledWith(expect.objectContaining({ id: "v2" }))
    expect(await screen.findByText("A service is requested for Van 07.")).toBeInTheDocument()
  })

  it("has no message box for a vehicle without a driver, and no service button for one already in service", async () => {
    const user = userEvent.setup()
    render(<Fleet1 />)
    await user.click(screen.getByRole("button", { name: /^Van 02/ }))
    expect(screen.queryByRole("button", { name: "Send" })).toBeNull()
    await user.click(screen.getByRole("button", { name: /^Van 09/ }))
    expect(screen.queryByRole("button", { name: "Book a service" })).toBeNull()
  })

  it("says why a message could not be sent", async () => {
    const user = userEvent.setup()
    render(<Fleet1 onMessage={() => Promise.reject(new Error("The driver is out of coverage."))} />)
    await user.click(screen.getByRole("button", { name: /^Van 12/ }))
    await user.type(screen.getByLabelText("Message for Marcus Bell"), "Call the depot.")
    await user.click(screen.getByRole("button", { name: "Send" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("The driver is out of coverage.")
  })

  it("shows loading, empty and error states", () => {
    const { rerender } = render(<Fleet1 state="loading" />)
    expect(screen.getByRole("status")).toHaveTextContent("Loading the fleet")
    rerender(<Fleet1 vehicles={[]} />)
    expect(screen.getByText("No vehicles yet")).toBeInTheDocument()
    rerender(<Fleet1 state="error" onRetry={() => {}} />)
    expect(screen.getByRole("alert")).toHaveTextContent("The fleet could not be loaded")
  })
})
