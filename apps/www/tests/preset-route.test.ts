import { encodeCode, SYSTEMS } from "@ballmac-ui/theme-engine"
import { describe, expect, it } from "vitest"

import { GET } from "../worker/routes/preset"

const call = (file: string, query = "") => GET(new Request(`https://ui.ballmac.com/r/${file}${query}`), { params: Promise.resolve({ file }) })

describe("/r/preset-<code or name>.json", () => {
  it("serves a registry theme item for a curated name", async () => {
    const res = (await call("preset-ink.json"))!
    expect(res.status).toBe(200)
    const item = await res.json()
    expect(item).toMatchObject({ name: "preset-ink", type: "registry:theme" })
    expect(item.registryDependencies).toEqual(["https://ui.ballmac.com/r/font-geist.json"])
    expect(item.cssVars.light.background).toMatch(/^oklch/)
  })

  it("serves a registry theme item for a code, with or without dashes", async () => {
    const code = encodeCode(SYSTEMS[3]!.spec)
    for (const key of [code, code.replace(/-/g, "")]) {
      const item = await (await call(`preset-${key}.json`))!.json()
      expect(item.type).toBe("registry:theme")
      expect(item.title).toBe(`Ballmac preset ${code}`)
      expect(item.cssVars.light.radius).toBe(`${SYSTEMS[3]!.spec.radius}rem`)
    }
  })

  it("rejects a code that fails its check, and a part that does not exist", async () => {
    const code = encodeCode(SYSTEMS[0]!.spec, { dashes: false })
    const typo = code.slice(0, 15) + (code[15] === "0" ? "1" : "0")
    const bad = (await call(`preset-${typo}.json`))!
    expect(bad.status).toBe(400)
    expect((await bad.json()).error).toMatch(/not valid/)
    const part = (await call("preset-ink.json", "?only=colors,nope"))!
    expect(part.status).toBe(400)
    expect((await part.json()).error).toMatch(/Unknown part "nope"/)
  })

  it("installs only the parts asked for", async () => {
    const item = await (await call("preset-menubar.json", "?only=colors"))!.json()
    expect(Object.keys(item.cssVars)).toEqual(["light", "dark"])
    expect(item.cssVars.light).not.toHaveProperty("radius")
    expect(item.css).toBeUndefined()
    const font = await (await call("preset-ink.json", "?only=font"))!.json()
    expect(Object.keys(font.cssVars)).toEqual(["theme"])
    expect(font.registryDependencies).toHaveLength(1)
  })

  it("declines what is neither a name nor a code, so the static files answer", async () => {
    expect(await call("preset-nothing-like-it.json")).toBeUndefined()
    expect(await call("preset-ink.txt")).toBeUndefined()
  })
})
