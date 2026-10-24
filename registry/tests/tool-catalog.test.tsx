import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { ToolCatalog, needsAttention, type CatalogTool } from "@/components/ballmac/tool-catalog"

const tools: CatalogTool[] = [
  { id: "a", name: "search_orders", description: "Find orders.", enabled: true, risk: "low", calls: 1200, errorRate: 0.01, latencyMs: 340, schema: '{ "type": "object" }' },
  { id: "b", name: "issue_refund", description: "Refund an order.", enabled: true, risk: "high", calls: 30, errorRate: 0.03 },
  { id: "c", name: "send_email", description: "Send an email.", enabled: false, risk: "medium" },
  { id: "d", name: "update_address", description: "Change an address.", enabled: true, risk: "medium", errorRate: 0.09 },
]

describe("needsAttention", () => {
  it("flags tools that fail 5% of the time or more, and high-risk tools that are on", () => {
    expect(needsAttention(tools[0])).toBe(false)
    expect(needsAttention(tools[1])).toBe(true)
    expect(needsAttention(tools[2])).toBe(false)
    expect(needsAttention(tools[3])).toBe(true)
    expect(needsAttention({ ...tools[1], enabled: false })).toBe(false)
  })
})

describe("ToolCatalog", () => {
  it("shows each tool with a named switch, its risk and its numbers in words", () => {
    render(<ToolCatalog tools={tools} />)
    expect(screen.getByRole("switch", { name: "search_orders is on" })).toBeChecked()
    expect(screen.getByRole("switch", { name: "send_email is on" })).not.toBeChecked()
    expect(screen.getByText("High risk")).toBeInTheDocument()
    expect(screen.getByText("1,200 calls this week")).toBeInTheDocument()
    expect(screen.getByText(/9% fail · fails often/)).toBeInTheDocument()
    expect(screen.getByText(/On for a high-risk tool/)).toBeInTheDocument()
  })
  it("filters with counts and searches, and says when nothing matches", async () => {
    const user = userEvent.setup()
    render(<ToolCatalog tools={tools} />)
    expect(screen.getByRole("button", { name: /^Needs attention 2/ })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /^Off 1/ }))
    expect(screen.getByText("1 tools shown")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /^All/ }))
    await user.type(screen.getByRole("searchbox", { name: "Search tools" }), "refund")
    expect(screen.getByText("1 tools shown")).toBeInTheDocument()
    expect(document.querySelector("mark")?.textContent?.toLowerCase()).toBe("refund")
    await user.clear(screen.getByRole("searchbox"))
    await user.type(screen.getByRole("searchbox"), "zzz")
    expect(screen.getByText("No tools match.")).toBeInTheDocument()
  })
  it("switches at once, reports it, and goes back with the reason when it fails", async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn().mockResolvedValue(undefined)
    const { rerender } = render(<ToolCatalog tools={tools} onToggle={onToggle} />)
    await user.click(screen.getByRole("switch", { name: "send_email is on" }))
    expect(onToggle).toHaveBeenCalledWith(expect.objectContaining({ id: "c" }), true)
    expect(screen.getByRole("switch", { name: "send_email is on" })).toBeChecked()
    rerender(<ToolCatalog tools={tools} onToggle={() => Promise.reject(new Error("The tool service is down."))} />)
    await user.click(screen.getByRole("switch", { name: "search_orders is on" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("The tool service is down.")
    expect(screen.getByRole("switch", { name: "search_orders is on" })).toBeChecked()
  })
  it("opens a tool's schema, left to right, only for tools that have one", async () => {
    const user = userEvent.setup()
    render(<ToolCatalog tools={tools} />)
    expect(screen.getAllByRole("button", { name: "Input schema" })).toHaveLength(1)
    await user.click(screen.getByRole("button", { name: "Input schema" }))
    const pre = screen.getByLabelText("search_orders input schema")
    expect(pre).toHaveTextContent('{ "type": "object" }')
    expect(pre).toHaveAttribute("dir", "ltr")
  })
})

describe("ToolCatalog icon and usage bar", () => {
  it("draws your icon for a tool and a usage bar scaled to the busiest tool", () => {
    render(<ToolCatalog tools={[{ id: "a", name: "busy", description: "Busy.", enabled: true, calls: 1000, icon: <svg data-testid="logo" /> }, { id: "b", name: "quiet", description: "Quiet.", enabled: true, calls: 250 }]} />)
    expect(screen.getByTestId("logo")).toBeInTheDocument()
    const bars = Array.from(document.querySelectorAll("li[data-enabled] [aria-hidden=true].h-1 > div")) as HTMLElement[]
    expect(bars.map((b) => b.style.width)).toEqual(["100%", "25%"])
  })

  it("draws no bar for a tool with no calls", () => {
    render(<ToolCatalog tools={[{ id: "a", name: "idle", description: "Idle.", enabled: true, calls: 0 }]} />)
    expect(document.querySelector("li[data-enabled] .h-1")).toBeNull()
  })
})
