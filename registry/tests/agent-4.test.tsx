import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Agent4 } from "@/components/ballmac/blocks/agent-4/agent-4"

describe("Agent4", () => {
  it("turns {{variables}} into fields and fills them in before running both sides", async () => {
    const user = userEvent.setup()
    const onRun = vi.fn(async ({ model }: { model: string }) => ({ text: `answer from ${model}`, latencyMs: 1200, tokens: { input: 10, output: 5 } }))
    render(<Agent4 defaultPrompt="Greet {{name}}" defaultVariables={{}} onRun={onRun} />)
    const run = screen.getByRole("button", { name: "Run both" })
    expect(run).toBeDisabled()
    await user.type(screen.getByLabelText("name"), "Sam")
    await user.click(run)
    expect(onRun).toHaveBeenCalledTimes(2)
    expect(onRun).toHaveBeenCalledWith(expect.objectContaining({ model: "lyra-xl", prompt: "Greet Sam", variables: { name: "Sam" } }))
    expect(await screen.findByText("answer from lyra-xl")).toBeInTheDocument()
    expect(screen.getByText("answer from lyra-mini")).toBeInTheDocument()
    expect(screen.getAllByText("1.20 s")).toHaveLength(2)
  })

  it("runs with Mod+Enter and shows a failure on one side only", async () => {
    const user = userEvent.setup()
    const onRun = vi.fn(async ({ model }: { model: string }) => {
      if (model === "lyra-mini") throw new Error("Rate limited.")
      return { text: "ok" }
    })
    render(<Agent4 onRun={onRun} />)
    await user.click(screen.getByLabelText("System prompt"))
    await user.keyboard("{Control>}{Enter}{/Control}")
    expect(await screen.findByRole("alert")).toHaveTextContent("Rate limited.")
    expect(screen.getByText("ok")).toBeInTheDocument()
  })

  it("rates and picks a side", async () => {
    const user = userEvent.setup()
    const onRate = vi.fn()
    const onPick = vi.fn()
    render(<Agent4 defaultResults={{ a: { text: "A says hi" }, b: { text: "B says hi" } }} onRate={onRate} onPick={onPick} />)
    await user.click(screen.getByRole("button", { name: "Good answer from side A" }))
    expect(onRate).toHaveBeenCalledWith("a", "up", expect.objectContaining({ model: "lyra-xl" }))
    await user.click(screen.getAllByRole("button", { name: "Pick this one" })[1]!)
    expect(onPick).toHaveBeenCalledWith("b", expect.anything(), { text: "B says hi" })
    expect(screen.getByText("Picked")).toBeInTheDocument()
  })
})
