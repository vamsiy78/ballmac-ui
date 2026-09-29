"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/** "On this page" links that highlight the section currently in view. */
export function Toc({ sections }: { sections: readonly (readonly [string, string])[] }) {
  const [active, setActive] = React.useState<string>(sections[0]?.[0] ?? "")
  React.useEffect(() => {
    const headings = sections.map(([id]) => document.getElementById(id)).filter((el): el is HTMLElement => !!el)
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: "-80px 0px -65% 0px" }
    )
    headings.forEach((h) => observer.observe(h))
    return () => observer.disconnect()
  }, [sections])
  return (
    <nav aria-label="On this page" className="text-[13px]">
      <p className="text-foreground mb-3 text-xs font-semibold">On this page</p>
      <ul className="border-l">
        {sections.map(([id, label]) => (
          <li key={id}>
            <a
              href={`#${id}`}
              aria-current={active === id ? "location" : undefined}
              className={cn(
                "-ml-px block border-l py-1 pl-3 transition-colors",
                active === id ? "border-foreground text-foreground" : "text-muted-foreground hover:text-foreground border-transparent"
              )}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
