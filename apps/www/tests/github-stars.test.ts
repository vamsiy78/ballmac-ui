import { afterEach, describe, expect, it, vi } from "vitest"

import { fetchStars, formatStars, STARS_MIN_VISIBLE, showStars } from "../lib/github-stars"
import { GET } from "../worker/routes/stars"

const github = (body: unknown, status = 200) => vi.fn(async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch

afterEach(() => vi.unstubAllGlobals())

describe("star count", () => {
  it("formats the way people read it", () => {
    expect(formatStars(0)).toBe("0")
    expect(formatStars(842)).toBe("842")
    expect(formatStars(1000)).toBe("1k")
    expect(formatStars(1234)).toBe("1.2k")
    expect(formatStars(9999)).toBe("10k")
    expect(formatStars(12400)).toBe("12k")
  })

  it("shows the number only once it is worth showing", () => {
    expect(showStars(null)).toBe(false)
    expect(showStars(8)).toBe(false)
    expect(showStars(STARS_MIN_VISIBLE - 1)).toBe(false)
    expect(showStars(STARS_MIN_VISIBLE)).toBe(true)
    expect(showStars(Number.NaN)).toBe(false)
  })

  it("reads stargazers_count and gives up quietly", async () => {
    expect(await fetchStars(github({ stargazers_count: 321 }))).toBe(321)
    expect(await fetchStars(github({ stargazers_count: "many" }))).toBeNull()
    expect(await fetchStars(github({}, 403))).toBeNull()
    expect(await fetchStars((async () => Promise.reject(new Error("offline"))) as unknown as typeof fetch)).toBeNull()
  })

  it("sends a token only when there is one", async () => {
    const f = github({ stargazers_count: 1 })
    await fetchStars(f)
    await fetchStars(f, "t0ken")
    const calls = (f as unknown as { mock: { calls: [string, RequestInit][] } }).mock.calls
    expect((calls[0]![1].headers as Record<string, string>).authorization).toBeUndefined()
    expect((calls[1]![1].headers as Record<string, string>).authorization).toBe("Bearer t0ken")
  })
})

describe("GET /api/stars", () => {
  it("returns the count and lets the edge share it for ten minutes", async () => {
    vi.stubGlobal("fetch", github({ stargazers_count: 77 }))
    const res = await GET()
    expect(await res.json()).toEqual({ stars: 77 })
    expect(res.headers.get("cache-control")).toContain("s-maxage=600")
    expect(res.headers.get("access-control-allow-origin")).toBe("*")
  })

  it("answers null, and asks to be retried soon, when GitHub cannot be read", async () => {
    vi.stubGlobal("fetch", github({}, 500))
    const res = await GET()
    expect(await res.json()).toEqual({ stars: null })
    expect(res.headers.get("cache-control")).toBe("public, max-age=30")
  })
})
