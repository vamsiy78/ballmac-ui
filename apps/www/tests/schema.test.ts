import { describe, expect, it } from "vitest"

import { article, breadcrumbs, collection, faqPage, fitTitle, proProduct } from "../lib/schema"

describe("fitTitle", () => {
  it("leaves short titles alone", () => expect(fitTitle("Presets, charts and Base UI")).toBe("Presets, charts and Base UI"))
  it("cuts at a colon first", () => {
    expect(fitTitle("A shop from first look to delivery: listing, product page, bag, checkout and order tracking")).toBe("A shop from first look to delivery")
  })
  it("then at a comma", () => {
    expect(fitTitle("A queue, a grid for batch runs, a review desk and three more agent screens")).toBe("A queue, a grid for batch runs")
  })
  it("never leaves a page title over the limit once the site name is added", () => {
    for (const t of ["x ".repeat(80), "Ten data views, two agent screens, and fifteen more screens for operations and trades"]) {
      expect(`${fitTitle(t)} | Ballmac UI`.length).toBeLessThanOrEqual(70)
    }
  })
})

describe("schema builders", () => {
  it("numbers breadcrumbs from 1 and makes URLs absolute", () => {
    const b = breadcrumbs([{ name: "Docs", path: "/docs" }, { name: "Install", path: "/docs/get-started/install" }]) as { itemListElement: { position: number; item: string }[] }
    expect(b.itemListElement.map((i) => i.position)).toEqual([1, 2])
    expect(b.itemListElement[0]!.item).toMatch(/^https:\/\/.+\/docs$/)
  })
  it("builds an FAQ from plain text", () => {
    const f = faqPage([{ q: "Free for client work?", text: "Yes." }]) as { mainEntity: { acceptedAnswer: { text: string } }[] }
    expect(f.mainEntity[0]!.acceptedAnswer.text).toBe("Yes.")
  })
  it("dates an article", () => {
    const a = article({ headline: "H", path: "/changelog/x", published: "2026-10-25" }) as Record<string, unknown>
    expect(a.datePublished).toBe("2026-10-25")
    expect(a.dateModified).toBe("2026-10-25")
  })
  it("counts list items", () => {
    const [, list] = collection({ name: "Blocks", description: "d", path: "/blocks", items: [{ name: "A", path: "/blocks/a" }] }) as [unknown, { numberOfItems: number }]
    expect(list.numberOfItems).toBe(1)
  })
  it("prices Pro and Team in dollars with the seat count", () => {
    const p = proProduct({ path: "/pro", description: "d", pro: { price: "99" }, team: { price: "349", seats: 10 } }) as { offers: { price: string; priceCurrency: string; eligibleQuantity?: { value: number } }[] }
    expect(p.offers.map((o) => o.price)).toEqual(["99", "349"])
    expect(p.offers[1]!.eligibleQuantity?.value).toBe(10)
    expect(p.offers.every((o) => o.priceCurrency === "USD")).toBe(true)
  })
})
