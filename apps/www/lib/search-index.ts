import "server-only"

import { PRESETS } from "@ballmac-ui/theme-engine"

import { getChangelog } from "@/lib/changelog"
import { docSearchEntries } from "@/lib/docs"
import { blockCategoryLabels, categoryLabels, getBlocks, getComponents, getTemplates } from "@/lib/registry"

export type MenuEntry = { name: string; title: string; description: string; group: string; href: string }

/** Everything the search box can jump to. Served as /search-index.json and fetched when the box is first opened, so no page carries it. */
export function searchEntries(): MenuEntry[] {
  return [
    ...getComponents().map((i) => ({
      name: i.name,
      title: i.title,
      description: i.description,
      group: categoryLabels[i.category] ?? i.category,
      href: `/components/${i.name}`,
    })),
    ...getBlocks().map((b) => ({ name: b.name, title: b.title, description: b.description, group: `Blocks · ${blockCategoryLabels[b.blockCategory ?? ""] ?? ""}`, href: `/blocks/${b.name}` })),
    ...getTemplates().map((t) => ({ name: t.name, title: t.title, description: t.description, group: "Templates", href: `/templates/${t.name}` })),
    { name: "themes", title: "Theme builder", description: "Twelve free themes and a live builder with contrast checks and a motion lab.", group: "Themes", href: "/themes" },
    ...PRESETS.map((p) => ({ name: `theme-${p.slug}`, title: `${p.title} theme`, description: p.tagline, group: "Themes", href: `/themes/${p.slug}` })),
    { name: "feels-showcase", title: "Platform feels showcase", description: "One app in macOS, iOS, Windows and web feels, live.", group: "Docs", href: "/feels" },
    { name: "quality", title: "Quality, measured", description: "Every item loaded in a real browser, with the results published.", group: "Docs", href: "/quality" },
    ...docSearchEntries(),
    ...getChangelog().map((e) => ({ name: `changelog-${e.slug}`, title: e.title, description: e.summary, group: "Changelog", href: `/changelog/${e.slug}` })),
  ]
}
