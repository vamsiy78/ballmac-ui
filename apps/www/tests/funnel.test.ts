import { describe, expect, it, vi } from "vitest"

import { recordFunnel, sitePath } from "../lib/funnel"

describe("funnel", () => {
  it("accepts only paths on this site", () => {
    expect(sitePath("/blocks/pricing-1")).toBe("/blocks/pricing-1")
    expect(sitePath("/")).toBe("/")
    for (const bad of ["https://x.test/a", "//x.test", "/a/../b", "/a?b=1", "", 5, null, `/${"a".repeat(220)}`]) expect(sitePath(bad)).toBeNull()
  })
  it("writes one row and never throws, even when D1 fails", async () => {
    const run = vi.fn(async () => ({}))
    const bind = vi.fn(() => ({ run }))
    await recordFunnel({ prepare: () => ({ bind }) } as never, { id: "paid:p1", at: 1, kind: "paid", page: "/pricing", amount: 4900, currency: "USD" })
    expect(bind).toHaveBeenCalledWith("paid:p1", 1, "paid", null, "/pricing", null, null, null, null, 4900, "USD")
    vi.spyOn(console, "error").mockImplementation(() => {})
    await expect(recordFunnel({ prepare: () => { throw new Error("no table") } } as never, { id: "x", at: 1, kind: "click" })).resolves.toBeUndefined()
    await expect(recordFunnel(undefined, { id: "x", at: 1, kind: "click" })).resolves.toBeUndefined()
  })
})
