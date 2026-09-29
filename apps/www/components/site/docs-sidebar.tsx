"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"

import type { NavGroup } from "@/lib/registry"
import { cn } from "@/lib/utils"

export function DocsSidebar({ groups, className }: { groups: NavGroup[]; className?: string }) {
  const pathname = usePathname()
  const activeRef = React.useRef<HTMLAnchorElement>(null)
  // Keep the current page visible in a long sidebar.
  React.useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest" })
  }, [pathname])
  return (
    <nav aria-label="Docs and components" className={cn("space-y-6 text-[13px]", className)}>
      {groups.map((group) => (
        <div key={group.title}>
          <p className="text-foreground mb-1.5 px-2 text-xs font-semibold">{group.title}</p>
          <ul className="space-y-px">
            {group.items.map((item) => {
              const active = pathname === item.href
              return (
                <li key={item.href}>
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
                    {item.badge === "new" && (
                      <span className="bg-primary/10 text-primary ml-auto rounded-full px-1.5 py-px text-[10px] font-semibold tracking-wide">New</span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
