import { describe, expect, it } from "vitest"

import { baseAlias, GET, stylePaths, type StyleEnv } from "../worker/routes/style"

/** A stand-in for Cloudflare's static files: only the paths given exist. */
function env(files: Record<string, unknown>) {
  return {
    ASSETS: {
      fetch: async (req: Request) => {
        const body = files[new URL(req.url).pathname]
        return body === undefined ? new Response("not found", { status: 404 }) : Response.json(body)
      },
    },
  } satisfies StyleEnv
}
const ask = (style: string, file: string, files: Record<string, unknown>) =>
  GET(new Request(`https://ui.ballmac.com/r/${style}/${file}`), { params: Promise.resolve({ style, file }), env: env(files) })

describe("stylePaths", () => {
  it("prefers the Base UI variant for a Base UI style, then the Radix item", () => {
    expect(stylePaths("base-nova", "popover.json")).toEqual(["/r/base/popover.json", "/r/popover.json"])
    expect(stylePaths("base-vega", "popover.json")).toEqual(["/r/base/popover.json", "/r/popover.json"])
  })
  it("gives every other style the Radix item", () => {
    expect(stylePaths("radix-nova", "popover.json")).toEqual(["/r/popover.json"])
    expect(stylePaths("new-york-v4", "popover.json")).toEqual(["/r/popover.json"])
  })
  it("leaves the folders that hold files, and anything odd, alone", () => {
    for (const folder of ["pro", "tests", "base"]) expect(stylePaths(folder, "popover.json")).toBeUndefined()
    expect(stylePaths("base-nova", "../secret.json")).toBeUndefined()
    expect(stylePaths("base-nova", "popover.html")).toBeUndefined()
    expect(stylePaths("Base Nova", "popover.json")).toBeUndefined()
  })
})

describe("/r/{style}/<name>.json", () => {
  it("serves the Base UI variant to a Base UI style", async () => {
    const res = await ask("base-nova", "popover.json", { "/r/base/popover.json": { name: "popover", variant: "base" }, "/r/popover.json": { name: "popover", variant: "radix" } })
    expect(res?.status).toBe(200)
    expect(res?.headers.get("x-ballmac-variant")).toBe("base")
    expect(res?.headers.get("access-control-allow-origin")).toBe("*")
    expect(await res?.json()).toEqual({ name: "popover", variant: "base" })
  })
  it("falls back to the Radix item when the component has no Base UI variant", async () => {
    const res = await ask("base-nova", "chart-area.json", { "/r/chart-area.json": { name: "chart-area", variant: "radix" } })
    expect(res?.headers.get("x-ballmac-variant")).toBe("radix")
    expect(await res?.json()).toEqual({ name: "chart-area", variant: "radix" })
  })
  it("serves the Radix item to a Radix style, even when a Base UI variant exists", async () => {
    const res = await ask("radix-nova", "popover.json", { "/r/base/popover.json": { variant: "base" }, "/r/popover.json": { variant: "radix" } })
    expect(await res?.json()).toEqual({ variant: "radix" })
  })
  it("hands an unknown item back to the static files", async () => {
    expect(await ask("base-nova", "nope.json", {})).toBeUndefined()
  })
  it("builds a preset on request, whatever the style", async () => {
    const res = await ask("base-nova", "preset-ink.json", {})
    expect(res?.status).toBe(200)
    expect((await res?.json())?.name).toBe("preset-ink")
  })
})

describe("/r/base-<name>.json", () => {
  const alias = (file: string, files: Record<string, unknown>) =>
    baseAlias(new Request(`https://ui.ballmac.com/r/${file}`), { params: Promise.resolve({ file }), env: env(files) })
  it("serves the Base UI variant under a name that needs no style", async () => {
    const res = await alias("base-popover.json", { "/r/base/popover.json": { variant: "base" } })
    expect(res?.headers.get("x-ballmac-variant")).toBe("base")
    expect(await res?.json()).toEqual({ variant: "base" })
  })
  it("hands anything without a variant back to the static files", async () => {
    expect(await alias("base-manifest.json", {})).toBeUndefined()
    expect(await alias("base-popover.html", {})).toBeUndefined()
  })
})
