import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ModelCompare, formatTokens, type ModelOption } from "@/components/ballmac/model-compare"

const models: ModelOption[] = [
  { id: "haiku", name: "Haiku 5.5", provider: "Anthropic", description: "Fast and cheap.", intelligence: 3, speed: 5, cost: 1, context: 200000 },
  { id: "sonnet", name: "Sonnet 5.5", provider: "Anthropic", description: "Balanced.", intelligence: 4, speed: 4, cost: 2, context: 200000, recommended: true },
  { id: "opus", name: "Opus 5.5", provider: "Anthropic", intelligence: 5, speed: 2, cost: 5, context: 1000000, unavailable: "Needs the Pro plan" },
  { id: "gpt", name: "GPT-5.6", provider: "OpenAI", intelligence: 4, speed: 3, cost: 3 },
]

describe("formatTokens", () => {
  it("shortens token counts", () => {
    expect([950, 200000, 1000000, 1500000].map(formatTokens)).toEqual(["950", "200K", "1M", "1.5M"])
  })
})

describe("ModelCompare", () => {
  it("is a radio group with one radio per model, starting on the first one that is available", () => {
    render(<ModelCompare models={models} />)
    expect(screen.getByRole("group", { name: "Choose a model" })).toBeInTheDocument()
    expect(screen.getAllByRole("radio")).toHaveLength(4)
    expect(screen.getByRole("radio", { name: /Haiku 5.5/ })).toBeChecked()
    expect(screen.getByText("Haiku 5.5 by Anthropic is selected.")).toBeInTheDocument()
  })

  it("gives each meter a spoken value, and says lower is cheaper for cost", () => {
    render(<ModelCompare models={models} />)
    expect(screen.getAllByRole("img", { name: "Intelligence 3 of 5" })).toHaveLength(1)
    expect(screen.getAllByRole("img", { name: "Cost 1 of 5, lower is cheaper" })).toHaveLength(1)
    expect(screen.getAllByRole("img", { name: /^Speed/ })).toHaveLength(4)
  })

  it("shows the context size and the recommended mark", () => {
    render(<ModelCompare models={models} />)
    expect(screen.getAllByText(/200K context/)).toHaveLength(2)
    expect(screen.getByText("Recommended")).toBeInTheDocument()
  })

  it("reports a pick and moves the selection and the announcement", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<ModelCompare models={models} onValueChange={onValueChange} />)
    await user.click(screen.getByRole("radio", { name: /Sonnet 5.5/ }))
    expect(onValueChange).toHaveBeenCalledWith("sonnet")
    expect(screen.getByText("Sonnet 5.5 by Anthropic is selected.")).toBeInTheDocument()
  })

  it("moves with the arrow keys and skips a model that is not available", async () => {
    const user = userEvent.setup()
    render(<ModelCompare models={models} defaultValue="sonnet" />)
    screen.getByRole("radio", { name: /Sonnet 5.5/ }).focus()
    await user.keyboard("{ArrowDown}")
    expect(screen.getByRole("radio", { name: /GPT-5.6/ })).toBeChecked()
  })

  it("shows why a model cannot be chosen and disables it", () => {
    render(<ModelCompare models={models} />)
    expect(screen.getByRole("radio", { name: /Opus 5.5/ })).toBeDisabled()
    expect(screen.getByText("Needs the Pro plan")).toBeInTheDocument()
  })

  it("filters by provider and by search, and says when nothing matches", async () => {
    const user = userEvent.setup()
    render(<ModelCompare models={models} searchable />)
    await user.click(screen.getByRole("button", { name: "OpenAI" }))
    expect(screen.getAllByRole("radio")).toHaveLength(1)
    await user.click(screen.getByRole("button", { name: "All" }))
    await user.type(screen.getByRole("searchbox", { name: "Search models" }), "balanced")
    expect(screen.getAllByRole("radio")).toHaveLength(1)
    await user.clear(screen.getByRole("searchbox"))
    await user.type(screen.getByRole("searchbox"), "zzz")
    expect(screen.getByText("No models match.")).toBeInTheDocument()
  })

  it("hides search for a short list unless asked, and can be controlled", () => {
    const { rerender } = render(<ModelCompare models={models} value="gpt" />)
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument()
    expect(screen.getByRole("radio", { name: /GPT-5.6/ })).toBeChecked()
    rerender(<ModelCompare models={models} value="haiku" />)
    expect(screen.getByRole("radio", { name: /Haiku 5.5/ })).toBeChecked()
  })
})
