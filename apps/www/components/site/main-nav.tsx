"use client"

import { ChevronDown } from "lucide-react"
import Link from "@/components/site/link"
import { usePathname } from "next/navigation"
import * as React from "react"

import { cn } from "@/lib/utils"

type Leaf = { href: string; label: string; match: string[]; hint?: string }
type Group = { label: string; items: Leaf[] }

const MCP = "/docs/get-started/connect-your-agent"

/** Five top-level entries: the library is grouped, and the group reads as selected when one of its pages is open. */
const nav: (Leaf | Group)[] = [
  { href: "/docs", label: "Docs", match: ["/docs"] },
  {
    label: "Library",
    items: [
      { href: "/components", label: "Components", match: ["/components"], hint: "Buttons to AI chat, one command each" },
      { href: "/blocks", label: "Blocks", match: ["/blocks"], hint: "Whole app screens" },
      { href: "/templates", label: "Templates", match: ["/templates"], hint: "Full starter apps" },
      { href: "/presets", label: "Presets", match: ["/presets", "/themes"], hint: "Themes and feels" },
    ],
  },
  { href: MCP, label: "MCP", match: [] },
  { href: "/pricing", label: "Pricing", match: ["/pricing"] },
  { href: "/affiliates", label: "Partners", match: ["/affiliates"] },
]

const isActive = (pathname: string, n: Leaf) =>
  pathname === n.href || n.match.some((m) => pathname.startsWith(m) && !(m === "/docs" && pathname === MCP))

const item = "focus-visible:ring-ring/50 inline-flex min-h-8 items-center gap-1 rounded-md px-2.5 py-1.5 text-sm outline-none transition-colors focus-visible:ring-[3px]"

/** A heading that opens a short list: on hover, on click or Enter, and closed again by Escape, by leaving it or by moving focus away. */
function Dropdown({ group, pathname }: { group: Group; pathname: string }) {
  const [open, setOpen] = React.useState(false)
  const root = React.useRef<HTMLLIElement>(null)
  const id = React.useId()
  const current = group.items.some((i) => isActive(pathname, i))
  return (
    <li
      ref={root}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={(e) => {
        if (!root.current?.contains(e.relatedTarget as Node | null)) setOpen(false)
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          setOpen(false)
          root.current?.querySelector("button")?.focus()
        }
      }}
    >
      <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)} className={cn(item, "group", current ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground")}>
        {group.label}
        <ChevronDown className={cn("size-3.5 transition-transform motion-reduce:transition-none", open && "rotate-180")} aria-hidden="true" />
      </button>
      <ul id={id} hidden={!open} className="bg-popover text-popover-foreground absolute start-0 top-full z-50 mt-1 w-72 rounded-xl border p-1.5 shadow-lg before:absolute before:inset-x-0 before:-top-2 before:h-2 before:content-['']">
        {group.items.map((i) => (
          <li key={i.href}>
            <Link
              href={i.href}
              aria-current={isActive(pathname, i) ? "page" : undefined}
              onClick={() => setOpen(false)}
              className={cn("hover:bg-accent focus-visible:ring-ring/50 block rounded-lg px-3 py-2 outline-none focus-visible:ring-[3px]", isActive(pathname, i) && "bg-accent")}
            >
              <span className="block text-sm font-medium">{i.label}</span>
              {i.hint && <span className="text-muted-foreground block text-xs">{i.hint}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </li>
  )
}

/** Top-level sections; the current one reads as selected. */
export function MainNav() {
  const pathname = usePathname()
  return (
    <nav aria-label="Main" className="hidden xl:block">
      <ul className="flex items-center gap-0.5">
        {nav.map((n) =>
          "items" in n ? (
            <Dropdown key={n.label} group={n} pathname={pathname} />
          ) : (
            <li key={n.href}>
              <Link href={n.href} aria-current={isActive(pathname, n) ? "page" : undefined} className={cn(item, isActive(pathname, n) ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground")}>
                {n.label}
              </Link>
            </li>
          )
        )}
      </ul>
    </nav>
  )
}
