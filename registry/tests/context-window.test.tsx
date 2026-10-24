import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ContextWindow, formatContextTokens } from "@/components/ballmac/context-window"

const segments = [
  { id: "sys", label: "System prompt", tokens: 4000 },
  { id: "tools", label: "Tools", tokens: 12000 },
  { id: "files", label: "Files", tokens: 60000 },
  { id: "chat", label: "Messages", tokens: 24000 },
]

describe("formatContextTokens", () => {
  it("shortens token counts", () => {
    expect([950, 1200, 14000, 142000, 1500000].map(formatContextTokens)).toEqual(["950", "1.2K", "14K", "142K", "1.5M"])
  })
})

describe("ContextWindow", () => {
  it("is a meter named by its heading, with a spoken value", () => {
    render(<ContextWindow segments={segments} limit={200000} />)
    const meter = screen.getByRole("meter", { name: "Context" })
    expect(meter).toHaveAttribute("aria-valuenow", "100000")
    expect(meter).toHaveAttribute("aria-valuemax", "200000")
    expect(meter).toHaveAttribute("aria-valuetext", "100K of 200K tokens, 50% used")
  })

  it("lists every part with its tokens and share of the limit", () => {
    render(<ContextWindow segments={segments} limit={200000} />)
    expect(screen.getByText("Files").closest("li")).toHaveTextContent("60K30%")
    expect(screen.getByText("System prompt").closest("li")).toHaveTextContent("4K2%")
  })

  it("keeps room for the answer and lists it", () => {
    render(<ContextWindow segments={segments} limit={200000} reserved={16000} />)
    expect(screen.getByText("Kept free for the answer").closest("li")).toHaveTextContent("16K8%")
  })

  it("is calm below the warning share, warns in words at it, and says over the limit past it", () => {
    const { rerender } = render(<ContextWindow segments={segments} limit={200000} />)
    expect(screen.queryByText("Nearly full")).not.toBeInTheDocument()
    rerender(<ContextWindow segments={segments} limit={120000} />)
    expect(screen.getByText("Nearly full")).toBeInTheDocument()
    rerender(<ContextWindow segments={segments} limit={90000} />)
    expect(screen.getByText("Over the limit")).toBeInTheDocument()
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "90000")
  })

  it("has no Compact button without a handler, and runs it when asked", async () => {
    const user = userEvent.setup()
    const onCompact = vi.fn().mockResolvedValue(undefined)
    const { rerender } = render(<ContextWindow segments={segments} limit={200000} />)
    expect(screen.queryByRole("button", { name: "Compact conversation" })).not.toBeInTheDocument()
    rerender(<ContextWindow segments={segments} limit={200000} onCompact={onCompact} fullNote="The oldest messages are dropped first." />)
    await user.click(screen.getByRole("button", { name: "Compact conversation" }))
    expect(onCompact).toHaveBeenCalledTimes(1)
    expect(screen.getByText("The oldest messages are dropped first.")).toBeInTheDocument()
  })

  it("says why when compacting fails", async () => {
    const user = userEvent.setup()
    render(<ContextWindow segments={segments} limit={200000} onCompact={() => Promise.reject(new Error("The summary model is busy."))} />)
    await user.click(screen.getByRole("button", { name: "Compact conversation" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("The summary model is busy.")
  })
})
