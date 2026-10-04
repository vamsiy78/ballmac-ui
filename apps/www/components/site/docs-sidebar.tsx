"use client"

import { ChevronRight } from "lucide-react"
import Link from "@/components/site/link"
import { usePathname } from "next/navigation"
import * as React from "react"

import type { NavGroup, NavLink } from "@/lib/registry"
import { cn } from "@/lib/utils"

function Item({ item, active, activeRef }: { item: NavLink; active: boolean; activeRef: React.Ref<HTMLAnchorElement> }) {
  return (
    <li>
      <Link
        ref={active ? activeRef : undefined}
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors",
          active ? "bg-accent text-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
        )}
      >
        <span className="truncate">{item.label}</span>
        {item.badge === "new" && <span className="bg-chart-1 ml-auto size-1.5 shrink-0 rounded-full" role="img" aria-label="New" />}
      </Link>
    </li>
  )
}

/**
 * Docs and components navigation. Docs groups are always open; component categories fold under one
 * "Components" heading and start collapsed, except the category of the page you're on, so the sidebar
 * never repeats the catalog's full list. Opening or closing a category is remembered while you browse.
 */
export function DocsSidebar({ groups, className }: { groups: NavGroup[]; className?: string }) {
  const pathname = usePathname()
  const activeRef = React.useRef<HTMLAnchorElement>(null)
  // Only categories the visitor toggled; everything else follows the current page.
  const [toggled, setToggled] = React.useState<Record<string, boolean>>({})
  const activeGroup = groups.find((g) => g.collapsible && g.items.some((i) => i.href === pathname))?.title
  const isOpen = (title: string) => toggled[title] ?? title === activeGroup

  // Keep the current page visible in a long sidebar.
  React.useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest" })
  }, [pathname])

  const docs = groups.filter((g) => !g.collapsible)
  const categories = groups.filter((g) => g.collapsible)
  return (
    <nav aria-label="Docs and components" className={cn("space-y-6 text-[13px]", className)}>
      {docs.map((group) => (
        <div key={group.title}>
          <p className="text-muted-foreground mb-1 px-2 text-xs font-medium">{group.title}</p>
          <ul className="space-y-px">
            {group.items.map((item) => (
              <Item key={item.href} item={item} active={pathname === item.href} activeRef={activeRef} />
            ))}
          </ul>
        </div>
      ))}
      {categories.length > 0 && (
        <div>
          <p className="text-muted-foreground mb-1 px-2 text-xs font-medium">Components</p>
          <ul className="space-y-px">
            {categories.map((group) => {
              const open = isOpen(group.title)
              const id = `sidebar-${group.title.toLowerCase().replace(/\W+/g, "-")}`
              return (
                <li key={group.title}>
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={id}
                    onClick={() => setToggled((t) => ({ ...t, [group.title]: !open }))}
                    className={cn(
                      "focus-visible:ring-ring/50 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left outline-none transition-colors focus-visible:ring-[3px]",
                      open || group.title === activeGroup ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                  >
                    <ChevronRight className={cn("size-3.5 shrink-0 transition-transform duration-200", open && "rotate-90")} aria-hidden="true" />
                    <span className="flex-1 truncate">{group.title}</span>
                    <span className="text-muted-foreground text-[11px] tabular-nums">{group.items.length}</span>
                  </button>
                  {open && (
                    <ul id={id} className="mt-px mb-1 ml-[15px] space-y-px border-l pl-2">
                      {group.items.map((item) => (
                        <Item key={item.href} item={item} active={pathname === item.href} activeRef={activeRef} />
                      ))}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </nav>
  )
}
