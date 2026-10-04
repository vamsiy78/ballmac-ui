import "server-only"

import { PRESETS } from "@ballmac-ui/theme-engine"

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
    { name: "themes", title: "Theme builder", description: "Twelve free themes and a live builder with contrast checks.", group: "Docs", href: "/themes" },
    ...PRESETS.map((p) => ({ name: `theme-${p.slug}`, title: `${p.title} theme`, description: p.tagline, group: "Themes", href: `/themes/${p.slug}` })),
    { name: "rtl", title: "Right-to-left", description: "Mirror the whole UI for Arabic, Hebrew, Persian and Urdu.", group: "Docs", href: "/docs/rtl" },
    { name: "i18n", title: "Translations", description: "Translate every built-in string and set the locale.", group: "Docs", href: "/docs/i18n" },
    { name: "images", title: "Your own images", description: "Drop product images into blocks and templates with one prop.", group: "Docs", href: "/docs/images" },
    { name: "introduction", title: "Introduction", description: "What Ballmac UI is and how it works.", group: "Docs", href: "/docs" },
    { name: "registry", title: "CLI & registry", description: "Namespaces, URLs, search, view and updates.", group: "Docs", href: "/docs/registry" },
    { name: "theming", title: "Theming", description: "Tokens, brand color and dark mode.", group: "Docs", href: "/docs/theming" },
    { name: "installation", title: "Installation", description: "Set up a project and add your first component.", group: "Docs", href: "/docs/installation" },
    { name: "mcp", title: "MCP", description: "Let Claude Code, Cursor or VS Code install Ballmac UI for you.", group: "Docs", href: "/docs/mcp" },
  ]
}
