"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

const nav = [
  { href: "/docs", label: "Docs", match: ["/docs"] },
  { href: "/components", label: "Components", match: ["/components"] },
  { href: "/blocks", label: "Blocks", match: ["/blocks"] },
  { href: "/templates", label: "Templates", match: ["/templates"] },
  { href: "/docs/mcp", label: "MCP", match: [] },
  { href: "/pricing", label: "Pricing", match: ["/pricing"] },
]

/** Top-level sections; the current one reads as selected. */
export function MainNav() {
  const pathname = usePathname()
  return (
    <nav aria-label="Main" className="hidden items-center gap-0.5 md:flex">
      {nav.map((n) => {
        const active = pathname === n.href || n.match.some((m) => pathname.startsWith(m) && !(m === "/docs" && pathname === "/docs/mcp"))
        return (
          <Link
            key={n.href}
            href={n.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "focus-visible:ring-ring/50 rounded-md px-2.5 py-1.5 text-sm outline-none transition-colors focus-visible:ring-[3px]",
              active ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {n.label}
          </Link>
        )
      })}
    </nav>
  )
}
