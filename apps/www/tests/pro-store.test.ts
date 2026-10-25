import { describe, expect, it, vi } from "vitest"

import { createProStore, type R2Like } from "../worker/pro-store-core"

/** A stand-in for an R2 bucket: get() answers an object with text(), body and size, or null. */
function bucket(files: Record<string, string>) {
  const get = vi.fn(async (key: string) => {
    const body = files[key]
    if (body === undefined) return null
    const bytes = new TextEncoder().encode(body)
    return { text: async () => body, body: new Blob([bytes]).stream(), size: bytes.byteLength }
  })
  return { PRO_DATA: { get } as R2Like, get }
}

const tables = { version: "v1", registryFiles: new Set(["hero-pro-1.json"]), itemNames: new Set(["hero-pro-1"]), archiveFiles: new Set(["starters/beacon.tar.gz"]) }

describe("the Pro store", () => {
  it("reads registry JSON, items and archives from the versioned folder", async () => {
    const env = bucket({ "v1/registry/hero-pro-1.json": '{"name":"hero-pro-1"}', "v1/items/hero-pro-1.json": '{"name":"hero-pro-1","files":[]}', "v1/archives/starters/beacon.tar.gz": "abc" })
    const store = createProStore(tables)
    expect(await store.readProRegistry(env, "hero-pro-1.json")).toBe('{"name":"hero-pro-1"}')
    expect((await store.readProItem(env, "hero-pro-1"))?.name).toBe("hero-pro-1")
    const archive = await store.readProArchive(env, "starters", "beacon.tar.gz")
    expect(archive?.size).toBe(3)
    expect(await new Response(archive!.body).text()).toBe("abc")
  })

  it("answers null for a name the Worker was not built with, without touching R2", async () => {
    const env = bucket({})
    const store = createProStore(tables)
    expect(await store.readProRegistry(env, "../../secret.json")).toBeNull()
    expect(await store.readProItem(env, "not-an-item")).toBeNull()
    expect(await store.readProArchive(env, "starters", "other.tar.gz")).toBeNull()
    expect(env.get).not.toHaveBeenCalled()
  })

  it("never reads another version's folder", async () => {
    const env = bucket({ "v0/registry/hero-pro-1.json": "old" })
    expect(await createProStore(tables).readProRegistry(env, "hero-pro-1.json")).toBeNull()
    expect(env.get).toHaveBeenCalledWith("v1/registry/hero-pro-1.json")
  })

  it("answers null, and logs, when the object is missing or there is no bucket", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {})
    const store = createProStore(tables)
    expect(await store.readProItem(bucket({}), "hero-pro-1")).toBeNull()
    expect(log).toHaveBeenCalled()
    expect(await store.readProRegistry({}, "hero-pro-1.json")).toBeNull()
    log.mockRestore()
  })
})
