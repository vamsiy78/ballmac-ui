"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { docsNav } from "@/components/site/docs-nav"
import { cn } from "@/lib/utils"

export function DocsSidebar() {
  const pathname = usePathname()
  return (
    <nav aria-label="Docs" className="space-y-7 text-[13px]">
      {docsNav.map((group) => (
        <div key={group.title}>
          <p className="text-muted-foreground mb-2 font-mono text-[11px] tracking-[0.14em] uppercase">{group.title}</p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "-ml-2 block rounded-md px-2 py-1.5 transition-colors",
                      active ? "bg-accent text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {item.label}
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
