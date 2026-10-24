import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Dispatch1 } from "@/components/ballmac/blocks/dispatch-1/dispatch-1"

describe("Dispatch1", () => {
  it("lists waiting jobs with urgent first, named as urgent, and counts them", () => {
    render(<Dispatch1 />)
    const waiting = within(screen.getByRole("region", { name: /Waiting for someone/ })).getAllByRole("listitem")
    expect(waiting[0]).toHaveTextContent("Urgent")
    expect(waiting[0]).toHaveTextContent("Gas smell reported")
    expect(screen.getByText(/2 jobs are waiting/)).toBeInTheDocument()
    expect(screen.getByText("1 urgent")).toBeInTheDocument()
  })

  it("gives each technician a lane with what they are doing and their jobs, status in words", () => {
    render(<Dispatch1 />)
    const marcus = screen.getByRole("region", { name: "Marcus Bell's jobs" })
    expect(within(marcus).getByText("On site at 14 Mill Lane")).toBeInTheDocument()
    expect(within(marcus).getAllByRole("listitem")).toHaveLength(2)
    expect(within(marcus).getByText("On site")).toBeInTheDocument()
    expect(within(screen.getByRole("region", { name: "Aisha Rahman's jobs" })).getByText("On the way")).toBeInTheDocument()
    expect(within(screen.getByRole("region", { name: "Piotr Nowak's jobs" })).getByText("Free.")).toBeInTheDocument()
  })

  it("gives a job to someone from a labelled select, with no drag needed, and says so", async () => {
    const user = userEvent.setup()
    const onAssign = vi.fn().mockResolvedValue(undefined)
    render(<Dispatch1 onAssign={onAssign} />)
    await user.selectOptions(screen.getByLabelText("Give Gas smell reported to"), "t3")
    expect(onAssign).toHaveBeenCalledWith("j5", "t3")
    expect(await screen.findByText("Gas smell reported is now Piotr Nowak's.")).toBeInTheDocument()
    expect(within(screen.getByRole("region", { name: "Piotr Nowak's jobs" })).getByText("Gas smell reported")).toBeInTheDocument()
    expect(screen.getByText(/1 job is waiting/)).toBeInTheDocument()
  })

  it("takes a scheduled job back, but not one that is already under way", async () => {
    const user = userEvent.setup()
    const onAssign = vi.fn().mockResolvedValue(undefined)
    render(<Dispatch1 onAssign={onAssign} />)
    expect(screen.queryByRole("button", { name: /Take Replace the boiler pump back/ })).toBeNull()
    await user.click(screen.getByRole("button", { name: "Take Fix a leaking radiator valve back from Marcus Bell" }))
    expect(onAssign).toHaveBeenCalledWith("j2", null)
    expect(await screen.findByText("Fix a leaking radiator valve is back in the waiting list.")).toBeInTheDocument()
  })

  it("puts a job back and says why when assigning fails", async () => {
    const user = userEvent.setup()
    render(<Dispatch1 onAssign={() => Promise.reject(new Error("Piotr is off shift."))} />)
    await user.selectOptions(screen.getByLabelText("Give Fit a thermostat to"), "t3")
    expect(await screen.findByRole("alert")).toHaveTextContent("Piotr is off shift.")
    expect(within(screen.getByRole("region", { name: /Waiting for someone/ })).getByText("Fit a thermostat")).toBeInTheDocument()
  })

  it("shows loading, empty and error states", () => {
    const { rerender } = render(<Dispatch1 state="loading" />)
    expect(screen.getByRole("status")).toHaveTextContent("Loading jobs")
    rerender(<Dispatch1 jobs={[]} />)
    expect(screen.getByText("No jobs today")).toBeInTheDocument()
    rerender(<Dispatch1 state="error" onRetry={() => {}} />)
    expect(screen.getByRole("alert")).toHaveTextContent("Jobs could not be loaded")
  })
})
