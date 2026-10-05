import { describe, expect, it } from "vitest"

import { changedWithin, chunk, parseSitemap } from "../../../scripts/indexnow"

const xml = `<?xml version="1.0"?><urlset>
<url><loc>https://ui.example/</loc><lastmod>2026-10-05T00:00:00.000Z</lastmod><priority>1</priority></url>
<url><loc>https://ui.example/old</loc><lastmod>2026-09-01T00:00:00.000Z</lastmod></url>
<url><loc>https://ui.example/nodate</loc></url>
<url><priority>0.5</priority></url></urlset>`

describe("IndexNow helpers", () => {
  it("reads the address and date of every sitemap entry", () => {
    expect(parseSitemap(xml)).toEqual([
      { url: "https://ui.example/", lastmod: "2026-10-05T00:00:00.000Z" },
      { url: "https://ui.example/old", lastmod: "2026-09-01T00:00:00.000Z" },
      { url: "https://ui.example/nodate", lastmod: undefined },
    ])
  })
  it("keeps recent and undated entries, and drops old ones", () => {
    const now = Date.parse("2026-10-06T12:00:00Z")
    expect(changedWithin(parseSitemap(xml), 2, now).map((e) => e.url)).toEqual(["https://ui.example/", "https://ui.example/nodate"])
    expect(changedWithin(parseSitemap(xml), 90, now)).toHaveLength(3)
  })
  it("splits long lists into batches", () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
    expect(chunk([], 10)).toEqual([])
  })
})
