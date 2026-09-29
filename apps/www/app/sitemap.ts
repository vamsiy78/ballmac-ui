import type { MetadataRoute } from "next"

import { getAllItems, itemHref, SITE_URL } from "@/lib/registry"

const pages = ["", "/components", "/blocks", "/templates", "/pricing", "/changelog", "/docs", "/docs/installation", "/docs/theming", "/docs/registry", "/docs/mcp", "/license"]

export default function sitemap(): MetadataRoute.Sitemap {
  const items = getAllItems().filter((i) => i.category !== "foundation")
  const latest = items.reduce((d, i) => (i.updated > d ? i.updated : d), "2026-09-28")
  return [
    ...pages.map((p) => ({ url: `${SITE_URL}${p}`, lastModified: new Date(`${latest}T00:00:00Z`), priority: p === "" ? 1 : 0.7 })),
    ...items.map((i) => ({ url: `${SITE_URL}${itemHref(i)}`, lastModified: new Date(`${i.updated}T00:00:00Z`), priority: 0.8 })),
  ]
}
