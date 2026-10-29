import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { OFFER, clock, newNonce, offerStatus, productFromLink, validNonce, type OfferRow } from "../lib/checkout-offer"
import { back, claim, offer, start } from "../worker/routes/checkout"

const PRODUCT = "pdt_0NpFNksV9VqlmGUuv10sV"
const LINK = `https://checkout.dodopayments.com/buy/${PRODUCT}?quantity=1`
const T0 = Date.parse("2026-10-30T12:00:00Z")
const ORIGIN = "https://ui.test"

/** Just enough of D1 for the five statements the routes run. */
function fakeDb() {
  const rows = new Map<string, OfferRow>()
  const db = {
    rows,
    prepare(sql: string) {
      let args: unknown[] = []
      const stmt = {
        bind(...a: unknown[]) {
          args = a
          return stmt
        },
        async first() {
          if (sql.startsWith("SELECT")) return rows.get(args[0] as string) ?? null
          return null
        },
        async run() {
          if (sql.startsWith("INSERT")) rows.set(args[0] as string, { nonce: args[0] as string, created_at: args[1] as number, started_at: null, expires_at: null, code: null, claimed_at: null })
          else if (sql.startsWith("UPDATE checkout_offers SET started_at")) {
            const r = rows.get(args[2] as string)
            if (r && r.started_at === null && r.created_at > (args[3] as number)) Object.assign(r, { started_at: args[0], expires_at: args[1] })
          } else if (sql.startsWith("UPDATE checkout_offers SET code")) {
            const r = rows.get(args[1] as string)
            if (r && r.code === null) r.code = args[0] as string
          } else if (sql.startsWith("UPDATE checkout_offers SET claimed_at")) {
            const r = rows.get(args[1] as string)
            if (r && r.claimed_at === null) r.claimed_at = args[0] as number
          }
          return {}
        },
      }
      return stmt
    },
  }
  return db
}

let db: ReturnType<typeof fakeDb>
const ctx = () => ({ env: { AFFILIATES: db as never } })
const get = (path: string) => new Request(`${ORIGIN}${path}`, { headers: { "cf-connecting-ip": `1.1.1.${Math.floor(Math.random() * 250)}` } })
const calls: { url: string; body: Record<string, unknown> }[] = []

beforeEach(() => {
  db = fakeDb()
  calls.length = 0
  vi.stubEnv("DODO_API_KEY", "key")
  vi.stubEnv("DODO_MODE", "live")
  vi.stubEnv("NEXT_PUBLIC_PRO_STANDARD_CHECKOUT_URL", LINK)
  vi.stubEnv("NEXT_PUBLIC_PRO_FOUNDING_ENDS", "2020-01-01T00:00:00Z")
  vi.spyOn(console, "log").mockImplementation(() => {})
  vi.spyOn(console, "error").mockImplementation(() => {})
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init: { body: string }) => {
      const body = JSON.parse(init.body)
      calls.push({ url, body })
      if (url.endsWith("/discounts")) return Response.json({ code: "ABCD1234EFGH5678", discount_id: "dsc_1" })
      return Response.json({ session_id: "cks_1", checkout_url: "https://checkout.dodopayments.com/session/cks_1" })
    })
  )
})
afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  vi.useRealTimers()
})

const location = (res: Response | undefined) => res!.headers.get("location")!

describe("offer state", () => {
  const row = (over: Partial<OfferRow> = {}): OfferRow => ({ nonce: "x", created_at: 1000, started_at: null, expires_at: null, code: null, claimed_at: null, ...over })
  it("is none without a checkout and for one that is too old", () => {
    expect(offerStatus(null, 5000)).toBe("none")
    expect(offerStatus(row(), 1000 + OFFER.startedWithinMs + 1)).toBe("none")
  })
  it("is fresh until the buyer comes back, then open for ten minutes, then expired", () => {
    expect(offerStatus(row(), 2000)).toBe("fresh")
    const started = row({ started_at: 2000, expires_at: 2000 + OFFER.windowMs })
    expect(offerStatus(started, 2000 + OFFER.windowMs - 1)).toBe("open")
    expect(offerStatus(started, 2000 + OFFER.windowMs)).toBe("expired")
  })
  it("the window is ten minutes and $5 is exactly 10.21% of the 4,900-cent price", () => {
    expect(OFFER.windowMs).toBe(600_000)
    expect(Math.round((4900 * OFFER.bps) / 10_000)).toBe(500)
    expect(Math.floor((4900 * OFFER.bps) / 10_000)).toBe(500)
  })
  it("ids are 22 URL-safe characters and unique", () => {
    const a = newNonce()
    expect(validNonce(a)).toBe(true)
    expect(newNonce()).not.toBe(a)
    expect(validNonce("short")).toBe(false)
    expect(validNonce("a".repeat(21) + "/")).toBe(false)
  })
  it("reads the product from a checkout link and formats the clock", () => {
    expect(productFromLink(LINK)).toBe(PRODUCT)
    expect(productFromLink("https://example.com")).toBeNull()
    expect(clock(9 * 60_000 + 41_000)).toBe("9:41")
    expect(clock(-5)).toBe("0:00")
  })
})

describe("GET /api/checkout/pro", () => {
  it("creates a session whose back button returns to the offer, and sends the buyer to it", async () => {
    const res = await start(get("/api/checkout/pro"), ctx())
    expect(res.status).toBe(303)
    expect(location(res)).toBe("https://checkout.dodopayments.com/session/cks_1")
    const body = calls[0].body as { product_cart: { product_id: string }[]; cancel_url: string; return_url: string }
    expect(body.product_cart[0].product_id).toBe(PRODUCT)
    expect(body.return_url).toBe(`${ORIGIN}/pro`)
    expect(body.cancel_url).toMatch(new RegExp(`^${ORIGIN}/api/checkout/back\\?n=[A-Za-z0-9_-]{22}$`))
    expect(db.rows.size).toBe(1)
  })
  it("starts a plain session without an offer when this browser already used it", async () => {
    await start(get("/api/checkout/pro?o=0"), ctx())
    expect(calls[0].body.cancel_url).toBeUndefined()
    expect(db.rows.size).toBe(0)
  })
  it("falls back to the plain checkout link when the provider is down, and never leaves the buyer stranded", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("no", { status: 500 })))
    const res = await start(get("/api/checkout/pro"), ctx())
    expect(location(res)).toBe(`${LINK}&redirect_url=${encodeURIComponent(`${ORIGIN}/pro`)}`)
  })
  it("stays out of the way while the founding offer runs, and when the offer is switched off", async () => {
    vi.stubEnv("NEXT_PUBLIC_PRO_FOUNDING_ENDS", "2999-01-01T00:00:00Z")
    expect(location(await start(get("/api/checkout/pro"), ctx()))).toContain("/buy/")
    expect(calls.length).toBe(0)
    vi.stubEnv("NEXT_PUBLIC_PRO_FOUNDING_ENDS", "2020-01-01T00:00:00Z")
    vi.stubEnv("CHECKOUT_OFFER", "off")
    await start(get("/api/checkout/pro"), ctx())
    expect(calls[0].body.cancel_url).toBeUndefined()
  })
  it("sells nothing from a production deployment in test mode", async () => {
    vi.stubEnv("DEPLOY_ENV", "production")
    vi.stubEnv("DODO_MODE", "test")
    await start(get("/api/checkout/pro"), ctx())
    expect(calls.length).toBe(0)
  })
})

describe("the offer window", () => {
  async function begun() {
    await start(get("/api/checkout/pro"), ctx())
    const nonce = [...db.rows.keys()][0]
    return nonce
  }
  it("starts on the first visit back and never restarts", async () => {
    vi.useFakeTimers({ now: T0 })
    const n = await begun()
    const first = await back(get(`/api/checkout/back?n=${n}`), ctx())
    expect(location(first)).toBe(`${ORIGIN}/pro?offer=${n}`)
    const expires = db.rows.get(n)!.expires_at
    expect(expires).toBe(T0 + OFFER.windowMs)
    vi.setSystemTime(T0 + 5 * 60_000)
    await back(get(`/api/checkout/back?n=${n}`), ctx())
    expect(db.rows.get(n)!.expires_at).toBe(expires)
    const status = await (await offer(get(`/api/checkout/offer?n=${n}`), ctx())).json()
    expect(status).toEqual({ open: true, remainingMs: 5 * 60_000, dollars: 5 })
  })
  it("is gone after ten minutes, and a later visit back does not open a new one", async () => {
    vi.useFakeTimers({ now: T0 })
    const n = await begun()
    await back(get(`/api/checkout/back?n=${n}`), ctx())
    vi.setSystemTime(T0 + OFFER.windowMs + 1000)
    expect(await (await offer(get(`/api/checkout/offer?n=${n}`), ctx())).json()).toEqual({ open: false })
    expect(location(await back(get(`/api/checkout/back?n=${n}`), ctx()))).toBe(`${ORIGIN}/pro`)
    expect(location(await claim(get(`/api/checkout/claim?n=${n}`), ctx()))).toBe(`${ORIGIN}/pro`)
  })
  it("ignores a made-up id or one with no checkout behind it", async () => {
    expect(location(await back(get("/api/checkout/back?n=nope"), ctx()))).toBe(`${ORIGIN}/pro`)
    const unknown = "A".repeat(22)
    expect(location(await back(get(`/api/checkout/back?n=${unknown}`), ctx()))).toBe(`${ORIGIN}/pro`)
    expect(await (await offer(get(`/api/checkout/offer?n=${unknown}`), ctx())).json()).toEqual({ open: false })
  })
})

describe("GET /api/checkout/claim", () => {
  async function open() {
    await start(get("/api/checkout/pro"), ctx())
    const n = [...db.rows.keys()][0]
    await back(get(`/api/checkout/back?n=${n}`), ctx())
    calls.length = 0
    return n
  }
  it("makes a one-use $5 code for this product that outlives the window a little, and applies it to a locked session", async () => {
    const n = await open()
    const res = await claim(get(`/api/checkout/claim?n=${n}`), ctx())
    expect(location(res)).toBe("https://checkout.dodopayments.com/session/cks_1")
    const discount = calls.find((c) => c.url.endsWith("/discounts"))!.body as Record<string, unknown>
    expect(discount).toMatchObject({ type: "percentage", amount: OFFER.bps, usage_limit: 1, restricted_to: [PRODUCT], customer_eligibility: "first_time" })
    expect(Date.parse(discount.expires_at as string)).toBe(db.rows.get(n)!.expires_at! + OFFER.graceMs)
    const session = calls.find((c) => c.url.endsWith("/checkouts"))!.body as Record<string, unknown>
    expect(session.discount_codes).toEqual(["ABCD1234EFGH5678"])
    expect(session.feature_flags).toMatchObject({ allow_discount_code: false })
    expect(session.cancel_url).toBe(`${ORIGIN}/pro?offer=${n}`)
  })
  it("reuses the same code when the buyer claims again inside the window", async () => {
    const n = await open()
    await claim(get(`/api/checkout/claim?n=${n}`), ctx())
    await claim(get(`/api/checkout/claim?n=${n}`), ctx())
    expect(calls.filter((c) => c.url.endsWith("/discounts")).length).toBe(1)
  })
  it("sends the buyer back to the offer with an error, not away, when the provider fails", async () => {
    const n = await open()
    vi.stubGlobal("fetch", vi.fn(async () => new Response("no", { status: 500 })))
    expect(location(await claim(get(`/api/checkout/claim?n=${n}`), ctx()))).toBe(`${ORIGIN}/pro?offer=${n}&offer_error=1`)
  })
})
