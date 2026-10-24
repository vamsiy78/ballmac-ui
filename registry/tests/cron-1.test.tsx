import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Cron1, describeCron } from "@/components/ballmac/blocks/cron-1/cron-1"

describe("describeCron", () => {
  it("turns the common expressions into a sentence", () => {
    expect(describeCron("*/15 * * * *")).toBe("Every 15 minutes")
    expect(describeCron("*/1 * * * *")).toBe("Every minute")
    expect(describeCron("0 * * * *")).toBe("Every hour")
    expect(describeCron("30 */6 * * *")).toBe("Every 6 hours at :30")
    expect(describeCron("30 2 * * *")).toBe("Every day at 02:30")
    expect(describeCron("0 9 * * 1-5")).toBe("Weekdays at 09:00")
    expect(describeCron("0 10 * * 0,6")).toBe("Weekends at 10:00")
    expect(describeCron("0 9 * * 1")).toBe("Every Monday at 09:00")
    expect(describeCron("0 8 1 * *")).toBe("On day 1 of every month at 08:00")
  })
  it("does not guess at the rest", () => {
    expect(describeCron("5,35 9-17 * * *")).toBe("A custom schedule")
    expect(describeCron("0 9 * 6 *")).toBe("A custom schedule")
    expect(describeCron("every day")).toBe("A custom schedule")
  })
})

describe("Cron1", () => {
  it("shows each job with its schedule in words and as code, and the last run written out", () => {
    render(<Cron1 />)
    const failed = screen.getByText("Rebuild the search index").closest("li") as HTMLElement
    expect(within(failed).getByText("Every day at 02:30")).toBeInTheDocument()
    expect(within(failed).getByText("30 2 * * *")).toHaveAttribute("dir", "ltr")
    expect(within(failed).getByText(/Last run failed/)).toBeInTheDocument()
    expect(screen.getByText(/Running now/)).toBeInTheDocument()
    expect(screen.getByText("Switched off. It will not run until it is turned back on.")).toBeInTheDocument()
  })

  it("switches a job off and puts it back with the reason if it cannot be saved", async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn().mockResolvedValue(undefined)
    const { rerender } = render(<Cron1 onToggle={onToggle} />)
    await user.click(screen.getByRole("switch", { name: "Clean up expired sessions is on" }))
    expect(onToggle).toHaveBeenCalledWith(expect.objectContaining({ id: "c2" }), false)
    expect(screen.getByRole("switch", { name: "Clean up expired sessions is on" })).not.toBeChecked()
    rerender(<Cron1 onToggle={() => Promise.reject(new Error("The scheduler is paused for maintenance."))} />)
    await user.click(screen.getByRole("switch", { name: "Send the weekly digest is on" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("The scheduler is paused for maintenance.")
    expect(screen.getByRole("switch", { name: "Send the weekly digest is on" })).toBeChecked()
  })

  it("asks before running now, then says it started", async () => {
    const user = userEvent.setup()
    const onRunNow = vi.fn().mockResolvedValue(undefined)
    render(<Cron1 onRunNow={onRunNow} />)
    await user.click(screen.getByRole("button", { name: "Run Send the weekly digest now" }))
    const dialog = await screen.findByRole("alertdialog")
    expect(dialog).toHaveTextContent("every monday at 09:00")
    expect(onRunNow).not.toHaveBeenCalled()
    await user.click(within(dialog).getByRole("button", { name: "Run now" }))
    expect(onRunNow).toHaveBeenCalledWith(expect.objectContaining({ id: "c1" }))
    expect(await screen.findByText("Send the weekly digest started.")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Run Send the weekly digest now" })).toBeDisabled()
  })

  it("does not offer Run now while a job is already running", () => {
    render(<Cron1 />)
    expect(screen.getByRole("button", { name: "Run Back up the database now" })).toBeDisabled()
  })

  it("shows loading, empty and error states", () => {
    const { rerender } = render(<Cron1 state="loading" />)
    expect(screen.getByRole("status")).toHaveTextContent("Loading scheduled jobs")
    rerender(<Cron1 jobs={[]} />)
    expect(screen.getByText("No scheduled jobs")).toBeInTheDocument()
    rerender(<Cron1 state="error" onRetry={() => {}} />)
    expect(screen.getByRole("alert")).toHaveTextContent("Scheduled jobs could not be loaded")
  })
})
