import { describe, expect, it } from "vitest"

import { createProGate } from "../lib/pro-gate-core"
import { endCookies, maskKey, openSession, readCookie, sameOrigin, sealSession, SESSION_COOKIE, startCookies } from "../lib/pro-session-core"
import { archivePattern } from "../lib/pro-archive-core"
import { createFailureLimiter } from "../lib/rate-limit"

const SECRET = "test-secret-with-enough-length"

describe("session cookie", () => {
  it("opens to the same key it was sealed with", async () => {
    expect(await openSession(await sealSession("abc-123", SECRET), SECRET)).toBe("abc-123")
  })

  it("is different every time, so the cookie never repeats", async () => {
    expect(await sealSession("k", SECRET)).not.toBe(await sealSession("k", SECRET))
  })

  it("does not contain the key in clear text", async () => {
    const token = await sealSession("very-recognisable-key", SECRET)
    expect(token).not.toContain("very-recognisable-key")
    expect(atob(token.replace(/-/g, "+").replace(/_/g, "/"))).not.toContain("very-recognisable-key")
  })

  it("refuses a cookie sealed with another secret, a tampered one and junk", async () => {
    const token = await sealSession("k", SECRET)
    expect(await openSession(token, "another-secret")).toBeNull()
    expect(await openSession(token.slice(0, -2) + (token.endsWith("AA") ? "BB" : "AA"), SECRET)).toBeNull()
    expect(await openSession("not-a-cookie", SECRET)).toBeNull()
    expect(await openSession("", SECRET)).toBeNull()
    expect(await openSession(null, SECRET)).toBeNull()
    expect(await openSession("x".repeat(5000), SECRET)).toBeNull()
  })

  it("expires after 30 days", async () => {
    const now = 1_700_000_000_000
    const token = await sealSession("k", SECRET, now)
    expect(await openSession(token, SECRET, now + 29 * 864e5)).toBe("k")
    expect(await openSession(token, SECRET, now + 31 * 864e5)).toBeNull()
  })

  it("never opens without a secret", async () => {
    const token = await sealSession("k", SECRET)
    expect(await openSession(token, "")).toBeNull()
  })
})

describe("cookie headers", () => {
  it("keeps the key cookie httpOnly and the flag cookie readable, both lax and secure when asked", () => {
    const [session, flag] = startCookies("TOKEN", true)
    expect(session).toMatch(/^bm_pro=TOKEN;/)
    expect(session).toContain("HttpOnly")
    expect(session).toContain("SameSite=Lax")
    expect(session).toContain("Secure")
    expect(flag).toMatch(/^bm_pro_on=1;/)
    expect(flag).not.toContain("HttpOnly")
    expect(startCookies("T", false)[0]).not.toContain("Secure")
  })

  it("clears both cookies", () => {
    for (const c of endCookies(true)) expect(c).toContain("Max-Age=0")
  })

  it("reads one cookie out of a header", () => {
    expect(readCookie("a=1; bm_pro=XYZ; bm_pro_on=1", SESSION_COOKIE)).toBe("XYZ")
    expect(readCookie("bm_pro_on=1", SESSION_COOKIE)).toBeNull()
    expect(readCookie(null, SESSION_COOKIE)).toBeNull()
  })
})

describe("same-origin check", () => {
  const h = (o: Record<string, string>) => new Headers(o)
  it("lets a change through only with a matching origin", () => {
    expect(sameOrigin(h({ origin: "https://ui.ballmac.com", host: "ui.ballmac.com" }), true)).toBe(true)
    expect(sameOrigin(h({ origin: "https://evil.example", host: "ui.ballmac.com" }), true)).toBe(false)
    expect(sameOrigin(h({ host: "ui.ballmac.com" }), true)).toBe(false)
    expect(sameOrigin(h({ origin: "not a url", host: "ui.ballmac.com" }), true)).toBe(false)
  })
  it("trusts the forwarded host behind a proxy", () => {
    expect(sameOrigin(h({ origin: "https://ui.ballmac.com", host: "internal", "x-forwarded-host": "ui.ballmac.com" }), true)).toBe(true)
  })
  it("refuses a read the browser says is cross-site, allows others", () => {
    expect(sameOrigin(h({ "sec-fetch-site": "cross-site" }), false)).toBe(false)
    expect(sameOrigin(h({ "sec-fetch-site": "same-origin" }), false)).toBe(true)
    expect(sameOrigin(h({}), false)).toBe(true)
  })
})

describe("masked key", () => {
  it("shows the ends only", () => {
    expect(maskKey("ABCD-1234-EFGH-5678-WXYZ")).toBe("ABCD" + "•".repeat(16) + "WXYZ")
    expect(maskKey("short")).toBe("•••••")
  })
})

describe("gate with a session", () => {
  const gate = (key: string | null, valid = true) =>
    createProGate({
      validate: async () => ({ valid }),
      limiter: createFailureLimiter(),
      keyFromHeaders: async () => key,
      clientId: () => "1.1.1.1",
      siteUrl: "https://ui.example",
      missing: "Log in at https://ui.example/pro",
    })
  const req = new Request("https://ui.example/api/pro/items/x")

  it("accepts a key read asynchronously from a cookie", async () => {
    expect(await gate("good")(req)).toBeNull()
  })
  it("tells a visitor without a session to log in", async () => {
    const res = await gate(null)(req)
    expect(res?.status).toBe(401)
    expect((await res!.json()).message).toContain("/pro")
  })
  it("refuses a session whose key was revoked", async () => {
    expect((await gate("revoked", false)(req))?.status).toBe(403)
  })
})

describe("archive names", () => {
  it("allows plain tar.gz and zip names with an optional version, nothing else", () => {
    for (const ok of ["beacon-saas.tar.gz", "beacon-saas-0.1.0.zip", "quire-ai-0.1.0.tar.gz", "ballmac-figma-tokens.tar.gz"]) expect(archivePattern.test(ok)).toBe(true)
    for (const bad of ["../etc.zip", "a/b.zip", "x.zip.exe", "x.tar", "X.zip", "-x.zip", "x..zip"]) expect(archivePattern.test(bad)).toBe(false)
  })
})
