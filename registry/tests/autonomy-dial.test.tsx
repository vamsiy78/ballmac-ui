import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { AutonomyDial, defaultAutonomyLevels, type AutonomyAction, type AutonomyLevel } from "@/components/ballmac/autonomy-dial"

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

describe("AutonomyDial with actions", () => {
  const levels: AutonomyLevel[] = [
    { value: "ask", label: "Always ask", summary: "Asks first.", does: [], asks: [] },
    { value: "risky", label: "Ask if risky", summary: "Safe things alone.", does: [], asks: [] },
    { value: "auto", label: "Full auto", summary: "Everything.", does: [], asks: [] },
  ]
  const actions: AutonomyAction[] = [
    { id: "read", label: "Read files", risk: "safe", autoFrom: "ask" },
    { id: "send", label: "Send emails", risk: "risky", autoFrom: "auto" },
    { id: "delete", label: "Delete files", risk: "destructive" },
  ]
  const lists = () => {
    const [own, ask] = Array.from(document.querySelectorAll("[data-slot=autonomy-dial] ul")) as HTMLElement[]
    return { own: Array.from(own.querySelectorAll("li")).map((l) => (l.textContent ?? "").replace(/(Risky|Destructive|Always asks)$/, "")), ask: Array.from(ask.querySelectorAll("li")).map((l) => (l.textContent ?? "").replace(/(Risky|Destructive|Always asks)$/, "")) }
  }

  it("sorts actions into does on its own and asks first for the chosen level", async () => {
    const user = userEvent.setup()
    render(<AutonomyDial levels={levels} actions={actions} defaultValue="ask" />)
    expect(lists().own).toEqual(["Read files"])
    expect(lists().ask).toHaveLength(2)
    await user.click(screen.getByRole("radio", { name: "Full auto" }))
    expect(lists().own).toEqual(["Read files", "Send emails"])
    expect(lists().ask).toHaveLength(1)
  })

  it("writes risk in words and marks an action that never runs alone as always asking", () => {
    render(<AutonomyDial levels={levels} actions={actions} defaultValue="auto" />)
    expect(screen.getByText("Risky")).toBeInTheDocument()
    expect(screen.getByText("Destructive")).toBeInTheDocument()
    expect(screen.getByText("Always asks")).toBeInTheDocument()
  })
})
