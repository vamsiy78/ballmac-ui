import { mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

import { ensureProRegistry } from "../src/catalogue.js"
import { readLock, saveBase, readBase, writeLock } from "../src/lock.js"
import { Registry } from "../src/registry.js"
import { BASE, FakeWorld, makeCtx, makeProject } from "./helpers.js"

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status })
const manifest = (names: Record<string, string>) => ({ schema: 1, registry: BASE, items: Object.fromEntries(Object.entries(names).map(([n, tier]) => [n, { title: n, type: "registry:component", version: "1.0.0", updated: "2026-10-11", tier, files: ["@components/ballmac/x.tsx"], requires: [], tests: false, changelog: [] }])) })

describe("registry client", () => {
  it("sends the licence key to the Pro manifest only", async () => {
    const calls: { url: string; auth: string | null }[] = []
    const fetchImpl: typeof fetch = async (url, init) => {
      calls.push({ url: String(url), auth: new Headers(init?.headers).get("authorization") })
      return json(String(url).includes("/pro/") ? manifest({ "hero-pro-1": "pro" }) : manifest({ button: "free" }))
    }
    const r = new Registry(BASE, "KEY-123", fetchImpl)
    const all = await r.catalogue()
    expect(Object.keys(all).sort()).toEqual(["button", "hero-pro-1"])
    expect(calls.find((c) => c.url.endsWith("/r/versions.json"))!.auth).toBeNull()
    expect(calls.find((c) => c.url.endsWith("/r/pro/versions.json"))!.auth).toBe("Bearer KEY-123")
  })

  it("lists only free items without a key, and never calls the Pro endpoint", async () => {
    const calls: string[] = []
    const r = new Registry(BASE, undefined, async (url) => (calls.push(String(url)), json(manifest({ button: "free" }))))
    expect(Object.keys(await r.catalogue())).toEqual(["button"])
    expect(calls.every((c) => !c.includes("/pro/"))).toBe(true)
    await expect(r.manifest("pro")).rejects.toThrow(/licence key/)
  })

  it("explains a rejected key and a rate limit", async () => {
    expect(await new Registry(BASE, "bad", async () => json({}, 401)).manifest("pro").catch((e: Error) => e.message)).toMatch(/not accepted/)
    expect(await new Registry(BASE, "bad", async () => json({}, 429)).manifest("pro").catch((e: Error) => e.message)).toMatch(/Too many requests/)
  })

  it("reports an unreachable registry plainly", async () => {
    const r = new Registry("http://nowhere.test", undefined, async () => {
      throw new Error("ECONNREFUSED")
    })
    await expect(r.manifest("free")).rejects.toThrow(/Could not reach http:\/\/nowhere\.test: ECONNREFUSED/)
  })

  it("asks once per URL", async () => {
    let n = 0
    const r = new Registry(BASE, undefined, async () => (n++, json(manifest({ button: "free" }))))
    await Promise.all([r.manifest("free"), r.manifest("free")])
    await r.manifest("free")
    expect(n).toBe(1)
  })

  it("adds free items by URL and Pro items through the licensed namespace", () => {
    const r = new Registry(`${BASE}/`, "k")
    expect(r.address("button", "free")).toBe(`${BASE}/r/button.json`)
    expect(r.address("hero-pro-1", "pro")).toBe("@ballmac-pro/hero-pro-1")
  })

  it("writes the Pro registry entry into components.json once, reading the key from the environment", () => {
    const root = makeProject()
    const { ctx } = makeCtx(root, new FakeWorld())
    ensureProRegistry(ctx)
    ensureProRegistry(ctx)
    const cj = JSON.parse(readFileSync(join(root, "components.json"), "utf8"))
    expect(cj.registries["@ballmac-pro"]).toEqual({ url: `${BASE}/r/pro/{name}.json`, headers: { Authorization: "Bearer ${BALLMAC_LICENSE_KEY}" } })
    expect(Object.keys(cj.registries)).toHaveLength(1)
    expect(cj.aliases.components).toBe("@/components")
  })
})

describe("lock file", () => {
  it("writes items and files in a stable order so git diffs stay small", () => {
    const root = mkdtempSync(join(tmpdir(), "ballmac-lock-"))
    const item = (files: string[]) => ({ version: "1.0.0", tier: "free" as const, installedAt: "t", files: Object.fromEntries(files.map((f) => [f, { base: null, kind: "source" as const }])) })
    writeLock(root, { schema: 1, registry: BASE, items: { zeta: item(["b", "a"]), alpha: item(["z", "y"]) } })
    const text = readFileSync(join(root, "ballmac.lock.json"), "utf8")
    expect(text.indexOf('"alpha"')).toBeLessThan(text.indexOf('"zeta"'))
    expect(text.indexOf('"y"')).toBeLessThan(text.indexOf('"z"'))
    expect(readLock(root, BASE).items.zeta!.files.a).toBeDefined()
  })

  it("stores each distinct upstream file once, keyed by its content hash, and keeps backups out of git", () => {
    const root = mkdtempSync(join(tmpdir(), "ballmac-base-"))
    const a = saveBase(root, "hello\n")
    expect(saveBase(root, "hello\n")).toBe(a)
    expect(readBase(root, a)).toBe("hello\n")
    expect(readBase(root, null)).toBeNull()
    expect(readFileSync(join(root, ".ballmac/.gitignore"), "utf8")).toBe("backup/\n")
  })

  it("refuses a lock file from a newer tool instead of misreading it", () => {
    const root = mkdtempSync(join(tmpdir(), "ballmac-future-"))
    writeLock(root, { schema: 1, registry: BASE, items: {} })
    writeFileSync(join(root, "ballmac.lock.json"), JSON.stringify({ schema: 2, registry: BASE, items: {} }))
    expect(() => readLock(root, BASE)).toThrow(/schema 2/)
  })
})
