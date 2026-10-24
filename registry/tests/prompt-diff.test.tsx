import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { PromptDiff, diffWords } from "@/components/ballmac/prompt-diff"

describe("diffWords", () => {
  it("marks added and removed words and keeps the ones in common, with spacing", () => {
    const d = diffWords("Be friendly and short.", "Be friendly, brief and short.")
    expect(d.map((p) => p.type)).toContain("add")
    expect(d.filter((p) => p.type !== "add").map((p) => p.text).join("")).toBe("Be friendly and short.")
    expect(d.filter((p) => p.type !== "del").map((p) => p.text).join("")).toBe("Be friendly, brief and short.")
  })
  it("returns one kept part for identical text and nothing for two empty texts", () => {
    expect(diffWords("same text", "same text")).toEqual([{ type: "same", text: "same text" }])
    expect(diffWords("", "")).toEqual([])
  })
  it("treats a full replacement as a delete then an add", () => {
    const d = diffWords("alpha", "beta")
    expect(d.map((p) => p.type)).toEqual(["del", "add"])
  })
  it("falls back instead of freezing on huge input", () => {
    const big = Array.from({ length: 700 }, (_, i) => `a${i}`).join(" ")
    const other = Array.from({ length: 700 }, (_, i) => `b${i}`).join(" ")
    expect(diffWords(big, other).map((p) => p.type)).toEqual(["del", "add"])
  })
})

describe("PromptDiff", () => {
  const before = "Answer in {{language}}. Keep it short."
  const after = "Answer in {{language}}. Keep it short and kind."
  it("counts the words added and removed and says so in words", () => {
    render(<PromptDiff before={before} after={after} />)
    expect(screen.getByText("+2 words")).toBeInTheDocument()
    expect(screen.getByText("−0 words")).toBeInTheDocument()
  })
  it("says when the versions are the same", () => {
    render(<PromptDiff before="Same." after="Same." />)
    expect(screen.getByText("The two versions are the same.")).toBeInTheDocument()
  })
  it("uses del and ins elements with spoken markers, so the change is not only colour", () => {
    render(<PromptDiff before="Never promise a refund." after="Never promise a refund before checking." mode="unified" />)
    const ins = document.querySelector("ins") as HTMLElement
    expect(ins).toHaveTextContent("before checking")
    expect(within(ins).getByText("[added:")).toBeInTheDocument()
    render(<PromptDiff before="Be friendly and short." after="Be friendly." mode="unified" />)
    expect(document.querySelector("del")).toHaveTextContent("and short")
  })
  it("marks {{variables}} as code", () => {
    render(<PromptDiff before={before} after={after} />)
    expect(screen.getAllByText("{{language}}")[0].tagName).toBe("CODE")
  })
  it("switches between side by side and inline, and restores", async () => {
    const user = userEvent.setup()
    const onRestore = vi.fn()
    render(<PromptDiff before={before} after={after} beforeLabel="v1" afterLabel="v2" onRestore={onRestore} />)
    expect(screen.getByRole("button", { name: "Side by side" })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByText("v1")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Inline" }))
    expect(screen.getByText("v1 → v2")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Restore v1" }))
    expect(onRestore).toHaveBeenCalled()
  })
})
