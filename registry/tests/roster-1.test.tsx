import * as React from "react"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { Roster1 } from "@/components/ballmac/blocks/roster-1/roster-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

const staff = [{ id: "a", name: "Ann Lee", role: "Bar", maxHours: 16 }, { id: "b", name: "Bo Kim", role: "Bar", maxHours: 40 }]
const cell = (n: string, d: string) => screen.getByRole("button", { name: new RegExp(`^${n}, ${d}`) })

describe("Roster1", () => {
  it("totals hours per person and flags overtime in words", () => {
    render(
      <Roster1 locale="en-GB"
        staff={staff}
        shifts={{ "a|2026-10-12": { start: "09:00", end: "17:00", position: "bar" }, "a|2026-10-13": { start: "09:00", end: "18:00", position: "bar" } }}
        required={[0, 0, 0, 0, 0, 0, 0]}
      />
    )
    expect(screen.getByText("17 h")).toBeInTheDocument()
    expect(screen.getByText("1 h over 16")).toBeInTheDocument()
  })

  it("flags too little rest between one day's end and the next day's start", () => {
    render(<Roster1 locale="en-GB" staff={staff} shifts={{ "b|2026-10-12": { start: "15:00", end: "23:30", position: "bar" }, "b|2026-10-13": { start: "08:00", end: "14:00", position: "bar" } }} required={[0, 0, 0, 0, 0, 0, 0]} />)
    expect(screen.getByRole("button", { name: /Bo Kim, Mon.*only 8\.5 hours before the next shift/ })).toBeInTheDocument()
  })

  it("compares coverage with what each day needs, in words", () => {
    render(<Roster1 locale="en-GB" staff={staff} shifts={{ "a|2026-10-12": { start: "09:00", end: "17:00", position: "bar" } }} required={[2, 0, 0, 0, 0, 0, 0]} />)
    expect(screen.getByText("1 of 2")).toBeInTheDocument()
    expect(screen.getByText(", short by 1")).toBeInTheDocument()
  })

  it("counts everything that needs a look in the summary", () => {
    render(<Roster1 locale="en-GB" />)
    // 3 overtime (Diego, Mia, Yuki), 1 rest (Kofi), 2 short days (Sat, Sun).
    expect(screen.getByRole("status")).toHaveTextContent("6 things need a look")
  })

  it("adds a shift from an empty cell with the editor and tells the host", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Roster1 locale="en-GB" staff={staff} shifts={{}} onChange={onChange} required={[0, 0, 0, 0, 0, 0, 0]} />)
    await user.click(cell("Ann Lee", "Mon 12 Oct"))
    const dialog = await screen.findByRole("dialog")
    await user.click(within(dialog).getByRole("button", { name: "Save" }))
    expect(onChange).toHaveBeenCalledWith("a|2026-10-12", { start: "09:00", end: "17:00", position: "bar" })
    expect(screen.getByRole("button", { name: /Ann Lee, Mon 12 Oct: 09:00 to 17:00, Bar/ })).toBeInTheDocument()
  })

  it("will not save a shift that ends before it starts", async () => {
    const user = userEvent.setup()
    render(<Roster1 locale="en-GB" staff={staff} shifts={{}} required={[0, 0, 0, 0, 0, 0, 0]} />)
    await user.click(cell("Ann Lee", "Mon 12 Oct"))
    const dialog = await screen.findByRole("dialog")
    const end = within(dialog).getByLabelText("Ends")
    await user.clear(end)
    await user.type(end, "08:00")
    await user.click(within(dialog).getByRole("button", { name: "Save" }))
    expect(within(dialog).getByRole("alert")).toHaveTextContent("end after it starts")
  })

  it("marks time off and removes a shift, then returns focus to the cell", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Roster1 locale="en-GB" staff={staff} shifts={{ "a|2026-10-12": { start: "09:00", end: "17:00", position: "bar" } }} onChange={onChange} required={[0, 0, 0, 0, 0, 0, 0]} />)
    const c = cell("Ann Lee", "Mon 12 Oct")
    await user.click(c)
    const dialog = await screen.findByRole("dialog")
    await user.click(within(dialog).getByRole("checkbox", { name: "Time off" }))
    await user.click(within(dialog).getByRole("button", { name: "Save" }))
    expect(onChange).toHaveBeenLastCalledWith("a|2026-10-12", { off: true })
    expect(screen.getByRole("button", { name: /Ann Lee, Mon 12 Oct: time off/ })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /Ann Lee, Mon 12 Oct: time off/ }))
    await user.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "Remove shift" }))
    expect(onChange).toHaveBeenLastCalledWith("a|2026-10-12", null)
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  })

  it("pages through weeks", async () => {
    const user = userEvent.setup()
    render(<Roster1 locale="en-GB" />)
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("12 Oct to 18 Oct")
    await user.click(screen.getByRole("button", { name: "Next week" }))
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("19 Oct to 25 Oct")
  })

  it("publishes, and keeps the draft with the reason when it fails", async () => {
    const user = userEvent.setup()
    const onPublish = vi.fn().mockRejectedValueOnce(new Error("Email is down.")).mockResolvedValue(undefined)
    render(<Roster1 locale="en-GB" onPublish={onPublish} />)
    await user.click(screen.getByRole("button", { name: "Publish week" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("Email is down.")
    await user.click(screen.getByRole("button", { name: "Publish week" }))
    expect(await screen.findByText("Everyone has been told about this week.")).toBeInTheDocument()
    expect(onPublish).toHaveBeenCalledWith("2026-10-12")
  })

  it("shows loading, empty and error states", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const { rerender } = render(<Roster1 locale="en-GB" state="loading" />)
    expect(screen.getByRole("status")).toBeInTheDocument()
    rerender(<Roster1 locale="en-GB" state="empty" />)
    expect(screen.getByRole("heading", { name: "No staff on this roster" })).toBeInTheDocument()
    rerender(<Roster1 locale="en-GB" state="error" onRetry={onRetry} />)
    await user.click(screen.getByRole("button", { name: /try again/i }))
    expect(onRetry).toHaveBeenCalled()
  })
})
