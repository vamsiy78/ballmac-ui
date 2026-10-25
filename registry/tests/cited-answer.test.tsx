import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { CitedAnswer, parseParagraph } from "@/components/ballmac/cited-answer"

const sources = [
  { title: "Refund policy", url: "https://a.test/1", site: "a.test", snippet: "Full refund within 14 days." },
  { title: "Returns FAQ", url: "https://a.test/2", site: "a.test", snippet: "Free return shipping." },
]

describe("parseParagraph", () => {
  it("attaches each marker to the text before it and ignores unknown numbers", () => {
    expect(parseParagraph("One [1]. Two [1, 2] tail.", 2)).toEqual([
      { text: "One", cites: [0] },
      { text: ". Two", cites: [0, 1] },
      { text: " tail.", cites: [] },
    ])
    expect(parseParagraph("Odd [9].", 2)[0].cites).toEqual([])
  })
})

describe("CitedAnswer", () => {
  it("renders numbers as named buttons and lists the sources", () => {
    render(<CitedAnswer sources={sources} paragraphs={["Refunds take 14 days [1]. Shipping is free [2]."]} />)
    expect(screen.getByRole("button", { name: "Source 1: Refund policy" })).toBeInTheDocument()
    expect(within(screen.getByRole("list")).getAllByRole("listitem")).toHaveLength(2)
    expect(screen.getByText("2 of 2 sentences are cited")).toBeInTheDocument()
  })

  it("counts uncited sentences", () => {
    render(<CitedAnswer sources={sources} paragraphs={["Cited claim [1]. This one has no source."]} />)
    expect(screen.getByText("1 of 2 sentences are cited")).toBeInTheDocument()
  })

  it("pins a source from the text, shows its excerpt and announces how many claims it supports", async () => {
    const user = userEvent.setup()
    render(<CitedAnswer sources={sources} paragraphs={["A [1]. B [1]. C [2]."]} />)
    await user.click(screen.getAllByRole("button", { name: "Source 1: Refund policy" })[0])
    expect(screen.getByText("Full refund within 14 days.")).toBeInTheDocument()
    expect(screen.getByText("Highlighting 2 claims from Refund policy")).toBeInTheDocument()
    expect(screen.getAllByRole("button", { name: "Source 1: Refund policy" })[0]).toHaveAttribute("aria-pressed", "true")
  })

  it("works the other way round from the list and clears with Escape", async () => {
    const user = userEvent.setup()
    render(<CitedAnswer sources={sources} paragraphs={["A [2]."]} />)
    await user.click(screen.getByRole("button", { name: /^Returns FAQ, cited 1 times/ }))
    expect(screen.getByText("Free return shipping.")).toBeInTheDocument()
    await user.keyboard("{Escape}")
    expect(screen.queryByText("Free return shipping.")).not.toBeInTheDocument()
    expect(screen.getByText("Showing the whole answer")).toBeInTheDocument()
  })

  it("can hide the coverage line", () => {
    render(<CitedAnswer sources={sources} paragraphs={["A [1]."]} showCoverage={false} />)
    expect(screen.queryByText(/sentences are cited/)).not.toBeInTheDocument()
  })
})
