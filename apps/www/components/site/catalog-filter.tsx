"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Category chips over a server-rendered catalog. Filters by toggling `hidden` on
 * children marked with data-category, and keeps the choice in ?category= so it's shareable.
 */
export function CatalogFilter({ options, children }: { options: { value: string; label: string; count: number }[]; children: React.ReactNode }) {
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const active = params.get("category") ?? "all"
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    ref.current?.querySelectorAll<HTMLElement>("[data-category]").forEach((el) => {
      el.hidden = active !== "all" && el.dataset.category !== active
    })
  }, [active])

  const select = (value: string) => {
    const next = new URLSearchParams(params)
    if (value === "all") next.delete("category")
    else next.set("category", value)
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false })
  }
  const total = options.reduce((n, o) => n + o.count, 0)
  return (
    <div ref={ref}>
      <div role="toolbar" aria-label="Filter by category" className="mt-10 flex flex-wrap gap-2">
        {[{ value: "all", label: "All", count: total }, ...options].map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={active === o.value}
            onClick={() => select(o.value)}
            className={cn(
              "inline-flex h-8 items-center gap-2 rounded-full border px-3.5 text-[13px] font-medium transition-colors",
              active === o.value ? "bg-foreground text-background border-foreground" : "text-muted-foreground hover:text-foreground hover:border-foreground/30"
            )}
          >
            {o.label}
            <span className="font-mono text-[11px] opacity-60">{o.count}</span>
          </button>
        ))}
      </div>
      {children}
    </div>
  )
}
