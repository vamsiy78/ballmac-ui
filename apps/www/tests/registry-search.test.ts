import { describe, expect, it } from "vitest"

import { GET, score, search, type SearchEnv } from "../worker/routes/registry-search"

const item = (name: string, type: string, description = "", tags: string[] = [], title = name) => ({ name, type, title, description, categories: ["x"], meta: { tags } })
const catalog = {
  name: "ballmac",
  homepage: "https://ui.ballmac.com",
  items: [
    item("button-demo", "registry:example", "Button example"),
    item("icon-button", "registry:ui", "A button with an icon", ["icon"]),
    item("button", "registry:ui", "A button with six variants", ["cta"]),
    item("pricing-1", "registry:block", "A pricing section with a button"),
    item("dialog", "registry:ui", "A modal window", ["modal", "overlay"]),
  ],
}

describe("score", () => {
  it("ranks an exact name above a prefix, a tag and a description mention", () => {
    expect(score(catalog.items[2]!, "button")).toBeGreaterThan(score(catalog.items[1]!, "button"))
    expect(score(catalog.items[4]!, "modal")).toBeGreaterThan(score(item("x", "registry:ui", "mentions modal"), "modal"))
  })
  it("needs every word to match", () => {
    expect(score(catalog.items[2]!, "button cta")).toBeGreaterThan(0)
    expect(score(catalog.items[2]!, "button zzz")).toBe(0)
  })
})

describe("search", () => {
  it("ranks by where the word matches, with components ahead of examples on a tie of relevance", () => {
    const r = search(catalog, { q: "button", limit: 10, offset: 0 })
    expect(r.items.map((i) => i.name)).toEqual(["button", "icon-button", "button-demo", "pricing-1"])
    expect(r.pagination).toEqual({ total: 4, offset: 0, limit: 10, hasMore: false })
  })
  it("filters by type and pages", () => {
    const r = search(catalog, { q: "button", types: ["registry:ui"], limit: 1, offset: 1 })
    expect(r.items.map((i) => i.name)).toEqual(["icon-button"])
    expect(r.pagination).toEqual({ total: 2, offset: 1, limit: 1, hasMore: false })
    expect(search(catalog, { types: ["registry:ui"], limit: 2, offset: 0 }).pagination).toMatchObject({ total: 3, hasMore: true })
  })
  it("returns only what a search result needs", () => {
    expect(Object.keys(search(catalog, { q: "dialog", limit: 5, offset: 0 }).items[0]!).sort()).toEqual(["categories", "description", "name", "title", "type"])
  })
})

const env = { ASSETS: { fetch: async () => Response.json(catalog) } } satisfies SearchEnv
const ask = (query: string) => GET(new Request(`https://ui.ballmac.com/r/registry.json${query}`), { env })

describe("/r/registry.json", () => {
  it("declines a request with no search parameters, so the full catalog is served", async () => {
    expect(await ask("")).toBeUndefined()
    expect(await ask("?foo=1")).toBeUndefined()
  })
  it("answers the CLI's search with a pagination object", async () => {
    const res = await ask("?q=modal&limit=50&offset=0")
    expect(res?.status).toBe(200)
    expect(res?.headers.get("access-control-allow-origin")).toBe("*")
    const body = await res!.json()
    expect(body.name).toBe("ballmac")
    expect(body.items.map((i: { name: string }) => i.name)).toEqual(["dialog"])
    expect(body.pagination).toEqual({ total: 1, offset: 0, limit: 50, hasMore: false })
  })
  it("clamps odd limits and offsets", async () => {
    const body = await (await ask("?limit=-5&offset=abc"))!.json()
    expect(body.pagination).toMatchObject({ limit: 1, offset: 0 })
    expect((await (await ask("?limit=99999"))!.json()).pagination.limit).toBe(500)
  })
  it("splits a comma-separated type", async () => {
    const body = await (await ask("?type=registry:block,registry:example"))!.json()
    expect(body.pagination.total).toBe(2)
  })
})
