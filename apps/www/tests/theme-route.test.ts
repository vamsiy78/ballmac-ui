import { describe, expect, it } from "vitest"
import { auditTheme, type ThemeVars } from "@ballmac-ui/theme-engine"

import { GET } from "../app/(site)/themes/custom.json/route"

const get = async (query: string) => {
  const res = GET(new Request(`https://ui.test/themes/custom.json?${query}`))
  return { res, body: (await res.json()) as { type: string; cssVars: ThemeVars } }
}

describe("custom theme route", () => {
  it("returns an installable registry:theme item with CORS", async () => {
    const { res, body } = await get("h=120&c=0.1&r=1")
    expect(res.headers.get("access-control-allow-origin")).toBe("*")
    expect(body.type).toBe("registry:theme")
    expect(body.cssVars.light.radius).toBe("1rem")
    expect(body.cssVars.light.background).toMatch(/^oklch\(/)
  })

  it("is accessible whatever the query asks for", async () => {
    for (const q of ["h=0&c=0.26&p=brand", "h=95&c=0.26&p=brand&paper=1", "h=999999&c=-4&r=500&nc=9&f=evil&d=x", "", "h=abc&c=NaN"]) {
      const { body } = await get(q)
      const vars = { theme: body.cssVars.theme ?? {}, light: body.cssVars.light, dark: body.cssVars.dark }
      expect(auditTheme(vars).filter((c) => !c.pass), q).toEqual([])
    }
  })

  it("never echoes unknown fonts or free text into the CSS", async () => {
    const { body } = await get("f=url(javascript:alert(1))&h=10")
    expect(JSON.stringify(body)).not.toContain("javascript")
  })
})
