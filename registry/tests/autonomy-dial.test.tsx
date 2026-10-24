import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { AutonomyDial, defaultAutonomyLevels } from "@/components/ballmac/autonomy-dial"

describe("AutonomyDial", () => {
  it("is a fieldset with a legend and one radio per level, starting on the first", () => {
    render(<AutonomyDial />)
    expect(screen.getByRole("group", { name: "How much can the agent do on its own?" })).toBeInTheDocument()
    expect(screen.getAllByRole("radio")).toHaveLength(defaultAutonomyLevels.length)
    expect(screen.getByRole("radio", { name: "Suggest" })).toBeChecked()
  })
  it("says in words what the chosen level allows and stops to ask about", () => {
    render(<AutonomyDial defaultValue="auto-edit" />)
    expect(screen.getByText("Does on its own")).toBeInTheDocument()
    expect(screen.getByText("Stops to ask about")).toBeInTheDocument()
    expect(screen.getByText("Reads and edits files in the project")).toBeInTheDocument()
    expect(screen.getByText("Installing packages")).toBeInTheDocument()
  })
  it("changes level with the arrow keys and reports it", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<AutonomyDial onValueChange={onValueChange} />)
    screen.getByRole("radio", { name: "Suggest" }).focus()
    await user.keyboard("{ArrowRight}")
    expect(onValueChange).toHaveBeenLastCalledWith("ask")
    expect(screen.getByRole("radio", { name: "Ask first" })).toBeChecked()
    expect(screen.getByText("Before each edit")).toBeInTheDocument()
  })
  it("can be controlled, and takes your own levels", async () => {
    const user = userEvent.setup()
    const levels = [
      { value: "a", label: "Low", summary: "Careful.", does: ["Reads"], asks: ["Everything"] },
      { value: "b", label: "High", summary: "Bold.", does: ["Everything"], asks: ["Nothing"] },
    ]
    const onValueChange = vi.fn()
    render(<AutonomyDial levels={levels} value="a" onValueChange={onValueChange} />)
    await user.click(screen.getByRole("radio", { name: "High" }))
    expect(onValueChange).toHaveBeenCalledWith("b")
    // controlled: the parent has not changed the value, so the dial stays put
    expect(screen.getByRole("radio", { name: "Low" })).toBeChecked()
  })
})
