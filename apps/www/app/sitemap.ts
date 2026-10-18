import type { MetadataRoute } from "next"

import { PRESETS } from "@ballmac-ui/theme-engine"

import { getChangelog } from "@/lib/changelog"
import { allDocs } from "@/lib/docs"
import { getAllItems, itemHref, SITE_URL } from "@/lib/registry"

const pages = ["", "/components", "/blocks", "/templates", "/themes", "/feels", "/pricing", "/pro", "/support", "/founders", "/changelog", "/quality", "/license", "/license/pro"]

// Built once with the site (the Cloudflare build is static).
export const dynamic = "force-static"

export default function sitemap(): MetadataRoute.Sitemap {
  const items = getAllItems().filter((i) => i.category !== "foundation")
  // Pages, docs and themes change with the site, not only with items, so they follow the newest of the item dates and the latest changelog entry.
  const latest = items.reduce((d, i) => (i.updated > d ? i.updated : d), getChangelog()[0]?.date ?? "2026-09-28")
  return [
    ...pages.map((p) => ({ url: `${SITE_URL}${p}`, lastModified: new Date(`${latest}T00:00:00Z`), priority: p === "" ? 1 : 0.7 })),
    ...allDocs().map((p) => ({ url: `${SITE_URL}${p.url}`, lastModified: new Date(`${latest}T00:00:00Z`), priority: p.url === "/docs" ? 0.8 : 0.7 })),
    ...getChangelog().map((e) => ({ url: `${SITE_URL}/changelog/${e.slug}`, lastModified: new Date(`${e.date}T00:00:00Z`), priority: 0.5 })),
    ...PRESETS.map((p) => ({ url: `${SITE_URL}/themes/${p.slug}`, lastModified: new Date(`${latest}T00:00:00Z`), priority: 0.6 })),
    ...items.map((i) => ({ url: `${SITE_URL}${itemHref(i)}`, lastModified: new Date(`${i.updated}T00:00:00Z`), priority: 0.8 })),
  ]
}
