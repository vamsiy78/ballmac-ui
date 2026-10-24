import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { PermissionGrid, type Permission } from "@/components/ballmac/permission-grid"

const permissions: Permission[] = [
  { id: "read", group: "Files", label: "Read files", risk: "low" },
  { id: "delete", group: "Files", label: "Delete files", risk: "high" },
  { id: "shell", group: "Commands", label: "Run commands", risk: "high" },
]

describe("PermissionGrid", () => {
  it("is a table with a radio per answer, named for the permission, and every row starts on Ask", () => {
    render(<PermissionGrid permissions={permissions} />)
    expect(screen.getByRole("table", { name: "What the agent may do" })).toBeInTheDocument()
    expect(screen.getAllByRole("radio")).toHaveLength(9)
    expect(screen.getByRole("radio", { name: "Read files: Ask" })).toBeChecked()
    expect(screen.getByText("0 allowed, 3 ask first, 0 denied")).toBeInTheDocument()
  })
  it("writes risk out in words and warns when a high-risk action is allowed", async () => {
    const user = userEvent.setup()
    render(<PermissionGrid permissions={permissions} />)
    expect(screen.getAllByText("High risk")).toHaveLength(2)
    expect(screen.queryByText("Runs without asking")).toBeNull()
    await user.click(screen.getByRole("radio", { name: "Run commands: Allow" }))
    expect(screen.getByText("Runs without asking")).toBeInTheDocument()
    expect(screen.getByText("1 allowed, 2 ask first, 0 denied")).toBeInTheDocument()
  })
  it("moves within a row with the arrow keys and reports the full set", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<PermissionGrid permissions={permissions} defaultValue={{ read: "allow" }} onValueChange={onValueChange} />)
    screen.getByRole("radio", { name: "Read files: Allow" }).focus()
    await user.keyboard("{ArrowRight}")
    expect(onValueChange).toHaveBeenLastCalledWith({ read: "ask", delete: "ask", shell: "ask" })
    await user.keyboard("{ArrowRight}")
    expect(onValueChange).toHaveBeenLastCalledWith({ read: "deny", delete: "ask", shell: "ask" })
  })
  it("fills many rows from a preset and groups rows under headings", async () => {
    const user = userEvent.setup()
    render(<PermissionGrid permissions={permissions} presets={[{ id: "safe", label: "Cautious", values: { read: "allow", delete: "deny", shell: "deny" } }]} />)
    expect(screen.getByRole("columnheader", { name: "Files" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Cautious" }))
    expect(screen.getByRole("radio", { name: "Read files: Allow" })).toBeChecked()
    expect(screen.getByRole("radio", { name: "Delete files: Deny" })).toBeChecked()
    expect(screen.getByText("1 allowed, 0 ask first, 2 denied")).toBeInTheDocument()
  })
  it("can be controlled", async () => {
    const user = userEvent.setup()
    render(<PermissionGrid permissions={permissions} value={{ read: "deny" }} />)
    expect(screen.getByRole("radio", { name: "Read files: Deny" })).toBeChecked()
    await user.click(screen.getByRole("radio", { name: "Read files: Allow" }))
    expect(screen.getByRole("radio", { name: "Read files: Deny" })).toBeChecked()
  })
})
