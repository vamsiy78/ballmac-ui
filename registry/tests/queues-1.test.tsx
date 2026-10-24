import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Queues1 } from "@/components/ballmac/blocks/queues-1/queues-1"

describe("Queues1", () => {
  it("shows each queue with what is waiting, and calls out one that is filling up faster than it drains, in words", () => {
    render(<Queues1 />)
    expect(screen.getByRole("table", { name: "Job queues" })).toBeInTheDocument()
    expect(screen.getByText("Backing up")).toBeInTheDocument()
    expect(screen.getAllByText("Keeping up").length).toBe(2)
    const email = screen.getByRole("button", { name: /email/ }).closest("tr") as HTMLElement
    expect(within(email).getByText("1,840")).toBeInTheDocument()
    expect(within(email).getByText("420 / 180")).toBeInTheDocument()
  })

  it("pauses a queue with a switch, says so, and puts it back when the request fails", async () => {
    const user = userEvent.setup()
    const onPause = vi.fn().mockResolvedValue(undefined)
    const { rerender } = render(<Queues1 onPause={onPause} />)
    await user.click(screen.getByRole("switch", { name: "Pause images" }))
    expect(onPause).toHaveBeenCalledWith("images", true)
    expect(await screen.findByText("images is paused. Jobs keep arriving and wait.")).toBeInTheDocument()
    expect(screen.getByRole("switch", { name: "Pause images" })).toBeChecked()
    rerender(<Queues1 onPause={() => Promise.reject(new Error("The queue service is unreachable."))} />)
    await user.click(screen.getByRole("switch", { name: "Pause export" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("The queue service is unreachable.")
    expect(screen.getByRole("switch", { name: "Pause export" })).not.toBeChecked()
  })

  it("opens a queue to list its failed jobs with errors, and retries one", async () => {
    const user = userEvent.setup()
    const onRetryJobs = vi.fn().mockResolvedValue(undefined)
    render(<Queues1 onRetryJobs={onRetryJobs} />)
    expect(screen.getByText(/Select a queue to read its failed jobs\. 3 failed in all\./)).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /email/ }))
    expect(screen.getByText("Connection to the mail provider timed out")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Retry Send invoice 4812" }))
    expect(onRetryJobs).toHaveBeenCalledWith("email", "j1")
    expect(await screen.findByText("Send invoice 4812 was put back in email.")).toBeInTheDocument()
    expect(screen.queryByText("Connection to the mail provider timed out")).toBeNull()
  })

  it("retries all and discards a job", async () => {
    const user = userEvent.setup()
    const onRetryJobs = vi.fn().mockResolvedValue(undefined)
    const onDiscard = vi.fn().mockResolvedValue(undefined)
    render(<Queues1 defaultOpenId="email" onRetryJobs={onRetryJobs} onDiscard={onDiscard} />)
    await user.click(screen.getByRole("button", { name: "Discard Send receipt 9921" }))
    expect(onDiscard).toHaveBeenCalledWith("email", "j2")
    await user.click(await screen.findByRole("button", { name: "Retry all" }))
    expect(onRetryJobs).toHaveBeenCalledWith("email", "all")
    expect(await screen.findByText(/has no failed jobs\./)).toBeInTheDocument()
  })

  it("shows loading, empty and error states", () => {
    const { rerender } = render(<Queues1 state="loading" />)
    expect(screen.getByRole("status")).toHaveTextContent("Loading the queues")
    rerender(<Queues1 queues={[]} />)
    expect(screen.getByText("No queues yet")).toBeInTheDocument()
    rerender(<Queues1 state="error" onRetry={() => {}} />)
    expect(screen.getByRole("alert")).toHaveTextContent("The queues could not be loaded")
  })
})
