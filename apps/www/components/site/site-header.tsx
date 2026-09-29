import Link from "next/link"

import { CommandMenu, type MenuEntry } from "@/components/site/command-menu"
import { sidebarGroups } from "@/components/site/docs-shell"
import { Logo } from "@/components/site/logo"
import { MobileNav } from "@/components/site/mobile-nav"
import { ThemeToggle } from "@/components/site/theme-toggle"
import { blockCategoryLabels, categoryLabels, getBlocks, getComponents, getTemplates } from "@/lib/registry"

const nav = [
  { href: "/components", label: "Components" },
  { href: "/blocks", label: "Blocks" },
  { href: "/templates", label: "Templates", wide: true },
  { href: "/docs", label: "Docs" },
  { href: "/pricing", label: "Pricing", wide: true },
] as { href: string; label: string; wide?: boolean }[]

export function SiteHeader() {
  const entries: MenuEntry[] = [
    ...getComponents().map((i) => ({
      name: i.name,
      title: i.title,
      description: i.description,
      group: categoryLabels[i.category] ?? i.category,
      href: `/components/${i.name}`,
    })),
    ...getBlocks().map((b) => ({ name: b.name, title: b.title, description: b.description, group: `Blocks · ${blockCategoryLabels[b.blockCategory ?? ""] ?? ""}`, href: `/blocks/${b.name}` })),
    ...getTemplates().map((t) => ({ name: t.name, title: t.title, description: t.description, group: "Templates", href: `/templates/${t.name}` })),
    { name: "introduction", title: "Introduction", description: "What Ballmac UI is and how it works.", group: "Docs", href: "/docs" },
    { name: "registry", title: "CLI & registry", description: "Namespaces, URLs, search, view and updates.", group: "Docs", href: "/docs/registry" },
    { name: "theming", title: "Theming", description: "Tokens, brand color and dark mode.", group: "Docs", href: "/docs/theming" },
    { name: "installation", title: "Installation", description: "Set up a project and add your first component.", group: "Docs", href: "/docs/installation" },
    { name: "mcp", title: "MCP", description: "Let Claude Code, Cursor or VS Code install Ballmac UI for you.", group: "Docs", href: "/docs/mcp" },
  ]
  return (
    <header className="bg-background/80 sticky top-0 z-40 border-b backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-3 px-4 sm:gap-6 sm:px-6">
        <MobileNav groups={sidebarGroups()} />
        <Link href="/" aria-label="Ballmac UI home" className="flex items-center rounded-md">
          <Logo />
        </Link>
        <nav aria-label="Main" className="hidden items-center sm:gap-1 md:flex">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className={`text-muted-foreground hover:text-foreground rounded-md px-1.5 py-1.5 text-[13px] font-medium transition-colors sm:px-2.5 ${n.wide ? "hidden lg:inline-block" : ""}`}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex flex-1 items-center justify-end gap-2">
          <div className="w-full max-w-60">
            <CommandMenu entries={entries} />
          </div>
          <a
            href="https://github.com/vamsiy78/ballmac-ui"
            className="text-muted-foreground hover:text-foreground hover:bg-accent hidden size-8 items-center justify-center rounded-md sm:inline-flex"
            aria-label="Ballmac UI on GitHub"
          >
            <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true">
              <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.39-5.27 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
            </svg>
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
