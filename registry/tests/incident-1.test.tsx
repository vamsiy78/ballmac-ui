import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Incident1 } from "@/components/ballmac/blocks/incident-1/incident-1"

describe("Incident1", () => {
  it("states severity and status in words and shows impact and the updates newest first", () => {
    render(<Incident1 />)
    expect(screen.getByRole("heading", { level: 1, name: "Checkout is failing for some customers" })).toBeInTheDocument()
    expect(screen.getByText("Severity")).toBeInTheDocument()
    expect(screen.getByText("SEV2")).toBeInTheDocument()
    expect(screen.getAllByText("Identified").length).toBeGreaterThan(0)
    const updates = within(screen.getByRole("list", { name: "Updates, newest first" })).getAllByRole("listitem")
    expect(updates[0]).toHaveTextContent("moving traffic to the backup endpoint")
    expect(updates).toHaveLength(3)
  })

  it("assigns a role and reports it", async () => {
    const user = userEvent.setup()
    const onAssign = vi.fn()
    render(<Incident1 onAssign={onAssign} />)
    await user.selectOptions(screen.getByLabelText("Communications"), "Ana Souza")
    expect(onAssign).toHaveBeenCalledWith("comms", "Ana Souza")
    expect(screen.getByLabelText("Communications")).toHaveValue("Ana Souza")
  })

  it("posts an update with its status to the top of the timeline and clears the box", async () => {
    const user = userEvent.setup()
    const onPostUpdate = vi.fn().mockResolvedValue(undefined)
    render(<Incident1 onPostUpdate={onPostUpdate} />)
    expect(screen.getByRole("button", { name: "Post update" })).toBeDisabled()
    await user.type(screen.getByLabelText("Post an update"), "Traffic is on the backup endpoint.")
    await user.selectOptions(screen.getByLabelText("Status"), "monitoring")
    await user.click(screen.getByRole("button", { name: "Post update" }))
    expect(onPostUpdate).toHaveBeenCalledWith({ status: "monitoring", body: "Traffic is on the backup endpoint." })
    const updates = within(screen.getByRole("list", { name: "Updates, newest first" })).getAllByRole("listitem")
    expect(updates[0]).toHaveTextContent("Traffic is on the backup endpoint.")
    expect(screen.getByLabelText("Post an update")).toHaveValue("")
  })

  it("keeps the text and says so when an update cannot be posted", async () => {
    const user = userEvent.setup()
    render(<Incident1 onPostUpdate={() => Promise.reject(new Error("The status page is unreachable."))} />)
    await user.type(screen.getByLabelText("Post an update"), "Still working on it.")
    await user.click(screen.getByRole("button", { name: "Post update" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("The status page is unreachable.")
    expect(screen.getByLabelText("Post an update")).toHaveValue("Still working on it.")
  })

  it("asks before resolving, then closes updates", async () => {
    const user = userEvent.setup()
    const onResolve = vi.fn().mockResolvedValue(undefined)
    render(<Incident1 onResolve={onResolve} />)
    await user.click(screen.getByRole("button", { name: "Resolve" }))
    const dialog = await screen.findByRole("alertdialog")
    expect(onResolve).not.toHaveBeenCalled()
    await user.click(within(dialog).getByRole("button", { name: "Resolve" }))
    expect(onResolve).toHaveBeenCalled()
    expect(await screen.findByText(/This incident is resolved\. Updates are closed\./)).toBeInTheDocument()
    expect(screen.queryByLabelText("Post an update")).toBeNull()
  })

  it("shows loading, empty and error states", () => {
    const { rerender } = render(<Incident1 state="loading" />)
    expect(screen.getByRole("status")).toHaveTextContent("Loading the incident")
    rerender(<Incident1 incident={null} />)
    expect(screen.getByText("No incident right now")).toBeInTheDocument()
    rerender(<Incident1 state="error" onRetry={() => {}} />)
    expect(screen.getByRole("alert")).toHaveTextContent("The incident could not be loaded")
  })
})
