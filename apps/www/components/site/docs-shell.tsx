import { docsNav } from "@/components/site/docs-nav"
import { DocsSidebar } from "@/components/site/docs-sidebar"
import { componentGroups, type NavGroup } from "@/lib/registry"

export function sidebarGroups(): NavGroup[] {
  return [...docsNav.map((g) => ({ title: g.title, items: g.items.map((i) => ({ ...i })) })), ...componentGroups()]
}

/** Docs and component pages: sticky sidebar with every doc and component, then the page. */
export function DocsShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid max-w-[1440px] grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="hidden border-r md:block">
        <div className="sticky top-14 h-[calc(100dvh-3.5rem)] overflow-y-auto overscroll-contain px-4 py-8 [scrollbar-width:thin]">
          <DocsSidebar groups={sidebarGroups()} />
        </div>
      </aside>
      <div className="min-w-0 px-4 py-10 sm:px-8 lg:px-12">{children}</div>
    </div>
  )
}
