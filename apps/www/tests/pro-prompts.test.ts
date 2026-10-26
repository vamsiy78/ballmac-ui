import { describe, expect, it, vi } from "vitest"

import index from "../lib/generated/index.json"

vi.mock("server-only", () => ({}))

const { hasPrompt, promptNames, readPrompt } = await import("../lib/pro-prompts")

describe("Pro build prompts", () => {
  it("knows nothing about names without a prompt", () => {
    expect(hasPrompt("button")).toBe(false)
    expect(readPrompt("no-such-item")).toBeUndefined()
  })

  // In a public clone there is no Pro checkout, so there are no prompts and the loop has nothing to check.
  it.each([...promptNames()])("%s is a real Pro item with a complete prompt", (name) => {
    const item = (index as { name: string; tier: string; category: string }[]).find((i) => i.name === name)
    expect(item?.tier).toBe("pro")
    expect(item?.category).toBe("blocks")
    const text = readPrompt(name)!
    expect(text.startsWith("# Prompt:")).toBe(true)
    expect(text.split(/\s+/).length).toBeGreaterThan(600)
    // Every prompt ends with the check a person (or an agent) runs against the result.
    expect(text).toMatch(/## \d+\. Acceptance check/)
    // Fenced code blocks must be closed.
    expect((text.match(/```/g) ?? []).length % 2).toBe(0)
  })
})
