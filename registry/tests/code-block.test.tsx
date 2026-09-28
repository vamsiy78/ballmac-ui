import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { CodeBlock } from "@/components/ballmac/code-block"

describe("CodeBlock", () => {
  it("copies the plain code", async () => {
    const user = userEvent.setup()
    const writeText = vi.spyOn(navigator.clipboard, "writeText")
    render(<CodeBlock filename="a.ts" code={"const a = 1\nconst b = 2"} />)
    await user.click(screen.getByRole("button", { name: /copy/i }))
    expect(writeText).toHaveBeenCalledWith("const a = 1\nconst b = 2")
  })
})
