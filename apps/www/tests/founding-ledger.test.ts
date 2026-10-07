import { describe, expect, it, vi } from "vitest"

import { createFoundingLedger } from "../lib/founding-ledger"

const env = { DODO_MODE: "live", DODO_API_KEY: "sk", DODO_FOUNDING_PRODUCT_ID: "pdt_founding", NEXT_PUBLIC_PRO_FOUNDING_LIMIT: "3" }
const page = (keys: string[]) => new Response(JSON.stringify({ items: keys.map((key) => ({ key })) }), { status: 200 })

describe("founding ledger", () => {
  it("knows nothing without an API key and a founding product, so the offer ends only by the deadline", async () => {
    const f = vi.fn()
    for (const e of [{ ...env, DODO_API_KEY: "" }, { ...env, DODO_FOUNDING_PRODUCT_ID: "" }]) {
      const l = createFoundingLedger(e, f as unknown as typeof fetch)
      expect(l.configured).toBe(false)
      expect(await l.isFull()).toBe(false)
      expect(await l.isFounder("any")).toBe(false)
    }
    expect(f).not.toHaveBeenCalled()
  })

  it("is full when the number of active founding keys reaches the cap", async () => {
    const f = vi.fn(async () => page(["a", "b", "c"]))
    const l = createFoundingLedger(env, f as unknown as typeof fetch)
    expect(await l.isFull()).toBe(true)
    expect(f).toHaveBeenCalledWith(expect.stringContaining("product_id=pdt_founding"), expect.anything())
  })

  it("is not full below the cap, and a refunded (inactive) key frees a place", async () => {
    const l = createFoundingLedger(env, (async () => page(["a", "b"])) as unknown as typeof fetch)
    expect(await l.isFull()).toBe(false)
    const asked = new Set<string>()
    const l2 = createFoundingLedger(env, (async (url: string) => (asked.add(new URL(url).searchParams.get("status")!), page(["a", "b"]))) as unknown as typeof fetch)
    await l2.isFull()
    expect([...asked]).toEqual(["active"])
  })

  it("recognises a founding key and not another", async () => {
    const l = createFoundingLedger(env, (async () => page(["KEY-1", "KEY-2"])) as unknown as typeof fetch)
    expect(await l.isFounder("KEY-1")).toBe(true)
    expect(await l.isFounder("  KEY-2 ")).toBe(true)
    expect(await l.isFounder("OTHER")).toBe(false)
  })

  it("reads every page of keys", async () => {
    const big = Array.from({ length: 100 }, (_, i) => `k${i}`)
    const f = vi.fn(async (url: string) => (new URL(url).searchParams.get("page_number") === "0" ? page(big) : page(["last"])))
    const l = createFoundingLedger({ ...env, NEXT_PUBLIC_PRO_FOUNDING_LIMIT: "101" }, f as unknown as typeof fetch)
    expect(await l.isFull()).toBe(true)
    expect(f).toHaveBeenCalledTimes(2)
  })

  it("caches for five minutes, then reloads", async () => {
    let t = 0
    const f = vi.fn(async () => page(["a"]))
    const l = createFoundingLedger(env, f as unknown as typeof fetch, () => t)
    await l.isFull(); await l.isFull()
    expect(f).toHaveBeenCalledTimes(1)
    t = 5 * 60 * 1000 + 1
    await l.isFull()
    expect(f).toHaveBeenCalledTimes(2)
  })

  it("keeps the last list when Dodo cannot be reached, and says nothing is known if it never answered", async () => {
    let t = 0, fail = false
    const f = vi.fn(async () => (fail ? new Response("", { status: 500 }) : page(["a", "b", "c"])))
    const l = createFoundingLedger(env, f as unknown as typeof fetch, () => t)
    expect(await l.isFull()).toBe(true)
    fail = true; t = 6 * 60 * 1000
    expect(await l.isFull()).toBe(true)
    const never = createFoundingLedger(env, (async () => new Response("", { status: 500 })) as unknown as typeof fetch)
    expect(await never.isFull()).toBe(false)
  })
})
