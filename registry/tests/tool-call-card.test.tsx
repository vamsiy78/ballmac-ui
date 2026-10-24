import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { ToolCallCard } from "@/components/ballmac/tool-call-card"

describe("ToolCallCard", () => {
  it("states its status in text and toggles the details", async () => {
    render(<ToolCallCard name="search_docs" status="error" input={{ q: "x" }} result="Timed out" />)
    expect(screen.getByText(/error|failed/i)).toBeInTheDocument()
    const toggle = screen.getAllByRole("button").find((b) => b.hasAttribute("aria-expanded"))!
    expect(toggle).toHaveAttribute("aria-expanded", "false")
    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByText(/Timed out/)).toBeInTheDocument()
  })
})

afterEach(() => vi.restoreAllMocks())

describe("ToolCallCard upgrades", () => {
  it("shows the server as a tag after the name, and your icon", () => {
    render(<ToolCallCard name="issue_refund" server="stripe" icon={<svg data-testid="logo" />} status="success" />)
    expect(screen.getByText("stripe")).toBeInTheDocument()
    expect(screen.getByTestId("logo")).toBeInTheDocument()
  })

  it("lists a flat input as keys and values, and keeps nested input as JSON", async () => {
    const { rerender } = render(<ToolCallCard name="t" status="success" defaultOpen input={{ email: "a@b.co", limit: 5 }} />)
    const flat = screen.getByLabelText("Input")
    expect(flat.tagName).toBe("DL")
    expect(flat).toHaveTextContent("email")
    expect(flat).toHaveTextContent("a@b.co")
    rerender(<ToolCallCard name="t" status="success" defaultOpen input={{ filter: { a: 1 } }} />)
    expect(screen.getByLabelText("Input").tagName).toBe("PRE")
  })

  it("copies the input or the result and says so", async () => {
    const user = userEvent.setup()
    const write = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined)
    render(<ToolCallCard name="t" status="success" defaultOpen input="select 1" result="1 row" />)
    await user.click(screen.getByRole("button", { name: "Copy result" }))
    expect(write).toHaveBeenCalledWith("1 row")
    expect(await screen.findByText("Copied")).toBeInTheDocument()
  })

  it("says Denied in words", () => {
    render(<ToolCallCard name="t" status="denied" />)
    expect(screen.getByText("Denied")).toBeInTheDocument()
  })

  it("offers Retry on an error, and says why when the retry fails too", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn().mockRejectedValueOnce(new Error("Still down.")).mockResolvedValueOnce(undefined)
    render(<ToolCallCard name="t" status="error" defaultOpen result="503" onRetry={onRetry} />)
    await user.click(screen.getByRole("button", { name: "Retry" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("Still down.")
    await user.click(screen.getByRole("button", { name: "Retry" }))
    expect(onRetry).toHaveBeenCalledTimes(2)
  })

  it("has no Retry on a call that did not fail, or without a handler", () => {
    const { rerender } = render(<ToolCallCard name="t" status="success" defaultOpen result="ok" onRetry={() => {}} />)
    expect(screen.queryByRole("button", { name: "Retry" })).not.toBeInTheDocument()
    rerender(<ToolCallCard name="t" status="error" defaultOpen result="x" />)
    expect(screen.queryByRole("button", { name: "Retry" })).not.toBeInTheDocument()
  })
})

describe("ToolCallCard JSON result", () => {
  it("shows a JSON result with its keys quieter than its values, and plain text untouched", () => {
    const { rerender } = render(<ToolCallCard name="t" status="success" defaultOpen result={{ order: { id: "A-9914" }, total: 340, ok: true }} />)
    const block = screen.getByLabelText("Result")
    expect(block.textContent).toContain('"id": "A-9914"')
    expect(block.tagName).toBe("PRE")
    expect(block.querySelector(".font-semibold")).not.toBeNull()
    rerender(<ToolCallCard name="t" status="success" defaultOpen result="3 rows returned" />)
    expect(screen.getByLabelText("Result").textContent).toBe("3 rows returned")
    expect(screen.getByLabelText("Result").querySelector("span")).toBeNull()
  })
})
