import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ballmac/select"

function RoleSelect({ onValueChange }: { onValueChange?: (v: string) => void }) {
  return (
    <Select onValueChange={onValueChange}>
      <SelectTrigger aria-label="Role">
        <SelectValue placeholder="Choose a role" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="admin">Admin</SelectItem>
        <SelectItem value="editor">Editor</SelectItem>
        <SelectItem value="viewer">Viewer</SelectItem>
      </SelectContent>
    </Select>
  )
}

describe("Select", () => {
  it("opens from the keyboard and selects an item", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<RoleSelect onValueChange={onValueChange} />)
    const trigger = screen.getByRole("combobox", { name: "Role" })
    expect(trigger).toHaveAttribute("aria-expanded", "false")
    expect(trigger).toHaveTextContent("Choose a role")

    trigger.focus()
    await user.keyboard("{Enter}")
    expect(trigger).toHaveAttribute("aria-expanded", "true")
    expect(await screen.findByRole("listbox")).toBeInTheDocument()

    await user.click(screen.getByRole("option", { name: "Editor" }))
    expect(onValueChange).toHaveBeenCalledWith("editor")
    expect(trigger).toHaveAttribute("aria-expanded", "false")
    expect(trigger).toHaveTextContent("Editor")
  })

  it("applies the trigger size", () => {
    render(
      <Select>
        <SelectTrigger size="sm" aria-label="Filter">
          <SelectValue placeholder="All" />
        </SelectTrigger>
      </Select>
    )
    expect(screen.getByRole("combobox", { name: "Filter" })).toHaveAttribute("data-size", "sm")
  })
})
