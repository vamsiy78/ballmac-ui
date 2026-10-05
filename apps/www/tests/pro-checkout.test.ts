import { describe, expect, it } from "vitest"

import { cameFromCheckout, keysFromReturn, withRedirect } from "../lib/pro-checkout"

const q = (s: string) => new URLSearchParams(s)

describe("withRedirect", () => {
  const link = "https://test.checkout.dodopayments.com/buy/pdt_123?quantity=1"
  it("adds the return address of the current site", () => {
    const url = new URL(withRedirect(link, "https://preview.example"))
    expect(url.searchParams.get("redirect_url")).toBe("https://preview.example/pro")
    expect(url.searchParams.get("quantity")).toBe("1")
    expect(url.pathname).toBe("/buy/pdt_123")
  })
  it("keeps a redirect that is already there", () => {
    expect(new URL(withRedirect(`${link}&redirect_url=https://x.example/done`, "https://preview.example")).searchParams.get("redirect_url")).toBe("https://x.example/done")
  })
  it("leaves something that is not a URL alone", () => {
    expect(withRedirect("", "https://a.example")).toBe("")
    expect(withRedirect("not a url", "https://a.example")).toBe("not a url")
  })
})

describe("return from checkout", () => {
  it("reads the licence key Dodo appends after a successful payment", () => {
    expect(keysFromReturn(q("payment_id=pay_1&status=succeeded&license_key=LK-1&email=a%40b.co"))).toEqual(["LK-1"])
  })
  it("reads several comma separated keys, capped at five", () => {
    expect(keysFromReturn(q("status=succeeded&license_key=a,b,c"))).toEqual(["a", "b", "c"])
    expect(keysFromReturn(q("license_key=1,2,3,4,5,6,7"))).toHaveLength(5)
  })
  it("ignores a key when the payment did not succeed, and junk", () => {
    expect(keysFromReturn(q("status=failed&license_key=LK-1"))).toEqual([])
    expect(keysFromReturn(q(`license_key=${"x".repeat(300)}`))).toEqual([])
    expect(keysFromReturn(q("license_key=,,"))).toEqual([])
    expect(keysFromReturn(q(""))).toEqual([])
  })
  it("recognises a visit from checkout", () => {
    expect(cameFromCheckout(q("welcome=1"))).toBe(true)
    expect(cameFromCheckout(q("payment_id=pay_1"))).toBe(true)
    expect(cameFromCheckout(q("status=succeeded"))).toBe(true)
    expect(cameFromCheckout(q("status=failed"))).toBe(false)
    expect(cameFromCheckout(q(""))).toBe(false)
  })
})
