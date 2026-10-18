"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type TocItem = { id: string; label: string; depth: number }

/** "On this page": headings of the article, the one in view marked with aria-current. */
export function DocsToc({ items, className }: { items: TocItem[]; className?: string }) {
  const [active, setActive] = React.useState(items[0]?.id ?? "")
  React.useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter((el): el is HTMLElement => !!el)
    if (els.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: "-80px 0px -65% 0px" }
    )
    els.forEach((el) => observer.observe(el))
    const onHash = () => setActive(decodeURIComponent(location.hash.slice(1)) || (items[0]?.id ?? ""))
    window.addEventListener("hashchange", onHash)
    return () => {
      observer.disconnect()
      window.removeEventListener("hashchange", onHash)
    }
  }, [items])
  if (items.length < 2) return null
  return (
    <nav aria-label="On this page" className={cn("text-[13px]", className)}>
      <p className="text-foreground mb-3 text-xs font-semibold">On this page</p>
      <ul className="border-s">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={active === item.id ? "location" : undefined}
              className={cn(
                "focus-visible:ring-ring/50 -ms-px block border-s py-1 leading-snug outline-none transition-colors focus-visible:ring-[3px]",
                item.depth > 2 ? "ps-6" : "ps-3",
                active === item.id ? "border-foreground text-foreground" : "text-muted-foreground hover:text-foreground border-transparent"
              )}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
