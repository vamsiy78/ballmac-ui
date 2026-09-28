import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ballmac/tooltip"

describe("Tooltip", () => {
  it("opens on keyboard focus with role tooltip and closes on Escape", async () => {
    const user = userEvent.setup()
    render(
      <Tooltip>
        <TooltipTrigger aria-label="Bold">B</TooltipTrigger>
        <TooltipContent>Bold text</TooltipContent>
      </Tooltip>
    )
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument()
    await user.tab()
    const trigger = screen.getByRole("button", { name: "Bold" })
    expect(trigger).toHaveFocus()
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Bold text")
    expect(trigger).toHaveAttribute("aria-describedby")
    await user.keyboard("{Escape}")
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument()
  })
})
