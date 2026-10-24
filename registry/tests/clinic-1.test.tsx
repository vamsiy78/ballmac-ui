import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Clinic1 } from "@/components/ballmac/blocks/clinic-1/clinic-1"

describe("Clinic1", () => {
  it("has a labelled column per provider and each appointment named with its time, patient, reason and status", () => {
    render(<Clinic1 />)
    expect(screen.getByRole("group", { name: "Dr. Amara Okafor, appointments" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "08:30 to 09:00, Ken Watanabe, Blood pressure check, In room" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Ivan Petrov.*No-show/ })).toBeInTheDocument()
  })

  it("counts the day in words", () => {
    render(<Clinic1 />)
    expect(screen.getByText("2 waiting · 1 in a room · 3 done · 3 still to come · 1 no-show")).toBeInTheDocument()
  })

  it("shows initials only when privacy is on, in the grid and in the labels", async () => {
    const user = userEvent.setup()
    render(<Clinic1 />)
    await user.click(screen.getByRole("button", { name: "Show full names" }))
    expect(screen.getByRole("button", { name: "Initials only" })).toHaveAttribute("aria-pressed", "true")
    expect(screen.queryByText("Ken Watanabe")).toBeNull()
    expect(screen.getByRole("button", { name: /K\.W\., Blood pressure check/ })).toBeInTheDocument()
  })

  it("moves a patient on with one button that fits where they are, and says so", async () => {
    const user = userEvent.setup()
    const onStatus = vi.fn().mockResolvedValue(undefined)
    render(<Clinic1 onStatus={onStatus} />)
    await user.click(screen.getByRole("button", { name: /Fatima Zahra/ }))
    expect(screen.queryByRole("button", { name: "Mark arrived" })).toBeNull()
    await user.click(screen.getByRole("button", { name: "Send to room" }))
    expect(onStatus).toHaveBeenCalledWith(expect.objectContaining({ id: "a3" }), "in-room")
    expect(await screen.findByText("Fatima Zahra is now in room.")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Mark done" })).toBeInTheDocument()
  })

  it("puts the status back and says why when the update fails", async () => {
    const user = userEvent.setup()
    render(<Clinic1 onStatus={() => Promise.reject(new Error("The practice system did not answer."))} />)
    await user.click(screen.getByRole("button", { name: /Oscar Lindqvist/ }))
    await user.click(screen.getByRole("button", { name: "Mark arrived" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("The practice system did not answer.")
    expect(screen.getByRole("button", { name: /Oscar Lindqvist.*Booked/ })).toBeInTheDocument()
  })

  it("shows loading, empty and error states", () => {
    const { rerender } = render(<Clinic1 state="loading" />)
    expect(screen.getByRole("status")).toHaveTextContent("Loading the schedule")
    rerender(<Clinic1 appointments={[]} />)
    expect(screen.getByText("No appointments today")).toBeInTheDocument()
    rerender(<Clinic1 state="error" onRetry={() => {}} />)
    expect(screen.getByRole("alert")).toHaveTextContent("The schedule could not be loaded")
  })
})
