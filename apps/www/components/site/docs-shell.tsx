import { docsNav } from "@/components/site/docs-nav"
import { DocsSidebar } from "@/components/site/docs-sidebar"
import { SidebarScroll } from "@/components/site/sidebar-scroll"
import { componentGroups, type NavGroup } from "@/lib/registry"

export function sidebarGroups(): NavGroup[] {
  return [...docsNav.map((g) => ({ title: g.title, items: g.items.map((i) => ({ ...i })) })), ...componentGroups()]
}

/** Docs and component pages: sticky sidebar with every doc and component, then the page. */
export function DocsShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid max-w-[1440px] grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="hidden md:block">
        {/* Like shadcn: a short solid divider on the sticky panel (not a full-height border), no visible scrollbar,
            and a soft fade where the list runs under the bottom edge. */}
        <div className="sticky top-14 h-[calc(100dvh-3.5rem)] py-8">
          <div className="after:bg-border relative h-full after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:w-px">
            <SidebarScroll className="h-full overflow-y-auto overscroll-contain px-4 pb-10 [mask-image:linear-gradient(to_bottom,black_calc(100%-3rem),transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <DocsSidebar groups={sidebarGroups()} />
            </SidebarScroll>
          </div>
        </div>
      </aside>
      <div className="min-w-0 px-4 py-10 sm:px-8 lg:px-12">{children}</div>
    </div>
  )
}
