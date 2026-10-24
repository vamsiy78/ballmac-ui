import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Audit1 } from "@/components/ballmac/blocks/audit-1/audit-1"

describe("Audit1", () => {
  it("is a table with a caption, and writes a failed attempt out in words", () => {
    render(<Audit1 />)
    expect(screen.getByRole("table", { name: "Audit log" })).toBeInTheDocument()
    expect(screen.getByText("Failed")).toBeInTheDocument()
    expect(screen.getByText("10 events")).toBeInTheDocument()
  })

  it("filters by kind with counts, and the search narrows further", async () => {
    const user = userEvent.setup()
    render(<Audit1 />)
    await user.click(screen.getByRole("button", { name: /^Permissions 3/ }))
    expect(screen.getByText("3 events")).toBeInTheDocument()
    await user.type(screen.getByRole("searchbox", { name: "Search the audit log" }), "API key")
    expect(screen.getByText("1 event")).toBeInTheDocument()
    expect(document.querySelector("mark")?.textContent?.toLowerCase()).toBe("api")
    await user.clear(screen.getByRole("searchbox"))
    await user.type(screen.getByRole("searchbox"), "zzz")
    expect(screen.getByText("No events match")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Clear filters" }))
    expect(screen.getByText("10 events")).toBeInTheDocument()
  })

  it("opens a row to show what changed, and only rows with changes can open", async () => {
    const user = userEvent.setup()
    render(<Audit1 />)
    const row = screen.getByRole("button", { name: /Changed the plan/ })
    expect(row).toHaveAttribute("aria-expanded", "false")
    await user.click(row)
    expect(row).toHaveAttribute("aria-expanded", "true")
    const dl = screen.getByText("Seats").closest("dl") as HTMLElement
    expect(within(dl).getByText("25")).toBeInTheDocument()
    expect(within(dl).getAllByRole("img", { name: "changed to" })).toHaveLength(2)
    expect(screen.getAllByRole("button", { name: /Signed in.*Dashboard/ })[0]).toBeDisabled()
  })

  it("shows more in pages and exports what the filter shows, or says it failed", async () => {
    const user = userEvent.setup()
    const onExport = vi.fn().mockResolvedValue(undefined)
    const { rerender } = render(<Audit1 pageSize={4} onExport={onExport} />)
    expect(screen.getAllByRole("row")).toHaveLength(5)
    await user.click(screen.getByRole("button", { name: "Show 4 more" }))
    expect(screen.getAllByRole("row")).toHaveLength(9)
    await user.click(screen.getByRole("button", { name: "Export 10" }))
    expect(onExport).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ id: "e1" })]))
    expect(await screen.findByRole("status")).toHaveTextContent("Exported 10 events.")
    rerender(<Audit1 onExport={() => Promise.reject(new Error("The export service is down."))} />)
    await user.click(screen.getByRole("button", { name: "Export 10" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("The export service is down.")
  })

  it("shows loading, empty and error states", async () => {
    const { rerender } = render(<Audit1 state="loading" />)
    expect(screen.getByRole("status")).toHaveTextContent("Loading the audit log")
    rerender(<Audit1 events={[]} />)
    expect(screen.getByText("No activity yet")).toBeInTheDocument()
    const onRetry = vi.fn()
    rerender(<Audit1 state="error" onRetry={onRetry} />)
    await userEvent.click(screen.getByRole("button", { name: "Try again" }))
    await waitFor(() => expect(onRetry).toHaveBeenCalled())
  })
})
