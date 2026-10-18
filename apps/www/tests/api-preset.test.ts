import { decodeCode, SYSTEMS } from "@ballmac-ui/theme-engine"
import { describe, expect, it } from "vitest"

import { GET } from "../worker/routes/api-preset"

const call = (query: string) => GET(new Request(`https://ui.ballmac.com/api/v1/preset${query}`))

describe("/api/v1/preset", () => {
  it("answers with the defaults when nothing is asked", async () => {
    const res = await call("")
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.code).toMatch(/^[0-9a-hjkmnp-tv-z]{4}(-[0-9a-hjkmnp-tv-z]{4}){3}$/)
    expect(body.install).toBe(`npx shadcn@latest add @ballmac/preset-${body.code}`)
    expect(body.contrast.failing).toEqual([])
  })

  it("starts from a system and names it while it is unchanged", async () => {
    const body = await (await call("?from=ink")).json()
    expect(body.name).toBe("Ink")
    expect(body.install).toBe("npx shadcn@latest add @ballmac/preset-ink")
    expect(body.code).toBe(SYSTEMS.find((s) => s.slug === "ink")!.code)
  })

  it("applies what is asked, and the code decodes back to it", async () => {
    const body = await (await call("?from=ink&hue=150&chroma=0.15&primary=brand&font=fraunces&feel=macos&motion=calm&radius=0.75")).json()
    expect(body.name).toBeNull()
    const spec = decodeCode(body.code)!
    expect(spec).toMatchObject({ hue: 150, neutralHue: 150, primary: "brand", font: "fraunces", feel: "macos", radius: 0.75 })
    expect(spec.speed).toBeCloseTo(0.75, 5)
    expect(body.madeOf.typeface).toContain("Fraunces")
    expect(body.url).toBe(`https://ui.ballmac.com/r/preset-${body.code}.json`)
  })

  it("reads a code and a theme as the starting point", async () => {
    const code = SYSTEMS[2]!.code
    expect((await (await call(`?from=${code}`)).json()).code).toBe(code)
    expect((await (await call("?from=violet")).json()).madeOf.radius).toBe("1rem")
  })

  it("rejects bad input with a message that says what is valid", async () => {
    for (const [query, expected] of [
      ["?from=nope", /not a design system/],
      ["?font=comic", /must be one of keep, system/],
      ["?feel=amiga", /must be one of web, macos, ios, windows/],
      ["?motion=wild", /must be one of/],
      ["?hue=400", /"hue" must be a number from 0 to 360/],
      ["?chroma=abc", /"chroma"/],
      ["?primary=red", /brand or ink/],
      ["?paper=maybe", /true or false/],
    ] as const) {
      const res = await call(query)
      expect(res.status, query).toBe(400)
      expect((await res.json()).error, query).toMatch(expected)
    }
  })
})
