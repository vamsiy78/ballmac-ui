import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { CitationCoverage } from "@/components/ballmac/citation-coverage"

const claims = [
  { id: "a", text: "Backed claim.", sources: [1] },
  { id: "b", text: "Unbacked claim.", sources: [] },
  { id: "c", text: "Two sources.", sources: [1, 2] },
]
const sources = [{ id: 1, title: "Policy", url: "https://example.com/p", quote: "The quote." }, { id: 2, title: "FAQ" }]

describe("CitationCoverage", () => {
  it("computes coverage from the claims and says it in words and as a meter", () => {
    render(<CitationCoverage claims={claims} sources={sources} />)
    expect(screen.getByText("2 of 3 claims have a source")).toBeInTheDocument()
    expect(screen.getByRole("meter", { name: "Source coverage" })).toHaveAttribute("aria-valuenow", "67")
  })
  it("marks a claim with no source in words for assistive technology", () => {
    render(<CitationCoverage claims={claims} sources={sources} />)
    expect(screen.getByRole("button", { name: /Unbacked claim\. \(no source\)/ })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Backed claim." })).toBeInTheDocument()
  })
  it("selects a claim to light up its sources and show the passage, and clears on a second click", async () => {
    const user = userEvent.setup()
    const onSelectedChange = vi.fn()
    render(<CitationCoverage claims={claims} sources={sources} onSelectedChange={onSelectedChange} />)
    expect(screen.queryByText("The quote.")).toBeNull()
    await user.click(screen.getByRole("button", { name: "Backed claim." }))
    expect(onSelectedChange).toHaveBeenLastCalledWith("a")
    expect(screen.getByText("The quote.")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Backed claim." })).toHaveAttribute("aria-pressed", "true")
    await user.click(screen.getByRole("button", { name: "Backed claim." }))
    expect(onSelectedChange).toHaveBeenLastCalledWith(null)
    expect(screen.queryByText("The quote.")).toBeNull()
  })
  it("narrows the answer to the claims without a source", async () => {
    const user = userEvent.setup()
    render(<CitationCoverage claims={claims} sources={sources} />)
    await user.click(screen.getByRole("checkbox", { name: "Show only claims without a source" }))
    expect(screen.queryByRole("button", { name: "Backed claim." })).toBeNull()
    expect(screen.getByRole("button", { name: /Unbacked claim/ })).toBeInTheDocument()
  })
  it("says so when every claim has a source and the filter is on", async () => {
    const user = userEvent.setup()
    render(<CitationCoverage claims={[claims[0]]} sources={sources} />)
    await user.click(screen.getByRole("checkbox"))
    expect(screen.getByText("Every claim has a source.")).toBeInTheDocument()
  })
  it("lists sources in an ordered list with links", () => {
    render(<CitationCoverage claims={claims} sources={sources} />)
    const list = screen.getByRole("list")
    expect(within(list).getAllByRole("listitem")).toHaveLength(2)
    expect(screen.getByRole("link", { name: /example\.com\/p/ })).toHaveAttribute("href", "https://example.com/p")
  })
})
