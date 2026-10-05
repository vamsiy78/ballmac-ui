import type { MetadataRoute } from "next"

import { PRESETS } from "@ballmac-ui/theme-engine"

import { getAllItems, itemHref, SITE_URL } from "@/lib/registry"

const pages = ["", "/components", "/blocks", "/templates", "/themes", "/pricing", "/support", "/changelog", "/docs", "/docs/installation", "/docs/theming", "/docs/registry", "/docs/mcp", "/docs/pro", "/docs/rtl", "/docs/i18n", "/docs/images", "/license"]

export default function sitemap(): MetadataRoute.Sitemap {
  const items = getAllItems().filter((i) => i.category !== "foundation")
  const latest = items.reduce((d, i) => (i.updated > d ? i.updated : d), "2026-09-28")
  return [
    ...pages.map((p) => ({ url: `${SITE_URL}${p}`, lastModified: new Date(`${latest}T00:00:00Z`), priority: p === "" ? 1 : 0.7 })),
    ...PRESETS.map((p) => ({ url: `${SITE_URL}/themes/${p.slug}`, lastModified: new Date(`${latest}T00:00:00Z`), priority: 0.6 })),
    ...items.map((i) => ({ url: `${SITE_URL}${itemHref(i)}`, lastModified: new Date(`${i.updated}T00:00:00Z`), priority: 0.8 })),
  ]
}
