// Ballmac UI: Bar List. https://ui.ballmac.com/components/bar-list
"use client"

import * as React from "react"
import { ChevronDown, ExternalLink } from "lucide-react"

import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"

type BarListItem = {
  id: string
  label: string
  value: number
  /** Makes the label a link. */
  href?: string
  /** A small icon or logo before the label. */
  icon?: React.ReactNode
  /** A short note after the value, for example "+12%". */
  hint?: string
}

type BarListProps = Omit<React.ComponentProps<"div">, "onSelect" | "title"> & {
  items: BarListItem[]
  /** Heading above the list. */
  title?: string
  /** Formats each value. Defaults to a grouped number. */
  format?: (value: number) => string
  /** Shows only this many items, with a button to show the rest. */
  limit?: number
  /** Sorts by value, largest first. Defaults to true. */
  sort?: boolean
  /** Shows each item's share of the total as a percent. */
  showShare?: boolean
  /** Makes rows buttons. Called with the item id. */
  onSelect?: (id: string) => void
  /** The id of the selected row, when `onSelect` is used. */
  selected?: string | null
}

const nf = new Intl.NumberFormat("en-US")

/**
 * A ranked list of bars: the bar sits behind the label so the name and the number stay readable at any width, rows can be links or buttons, and a long list folds
 * to its top few. The values are text, so nothing depends on the bars.
 */
function BarList({ items, title, format = (v) => nf.format(v), limit, sort = true, showShare = false, onSelect, selected, className, ...props }: BarListProps) {
  const msg = useMessages()
  const id = React.useId()
  const [open, setOpen] = React.useState(false)
  const ordered = React.useMemo(() => (sort ? [...items].sort((a, b) => b.value - a.value) : items), [items, sort])
  const max = Math.max(1, ...ordered.map((i) => i.value))
  const total = ordered.reduce((s, i) => s + i.value, 0)
  const shown = limit && !open ? ordered.slice(0, limit) : ordered
  const hidden = ordered.length - shown.length

  return (
    <div data-slot="bar-list" className={cn("grid min-w-0 gap-3", className)} {...props}>
      {title && <h3 id={`${id}-t`} className="text-sm font-medium">{title}</h3>}
      <ol aria-labelledby={title ? `${id}-t` : undefined} className="grid grid-cols-[minmax(0,1fr)] gap-1.5">
        {shown.map((it, i) => {
          const pct = Math.max(2, (it.value / max) * 100)
          const on = selected === it.id
          const label = (
            <span className="flex min-w-0 items-center gap-2">
              {it.icon && <span aria-hidden="true" className="flex size-4 shrink-0 items-center justify-center [&>svg]:size-4">{it.icon}</span>}
              <span className="truncate">{it.label}</span>
              {it.href && <ExternalLink aria-hidden="true" className="size-3 shrink-0 text-muted-foreground rtl:-scale-x-100" />}
            </span>
          )
          const row = "relative flex min-h-9 min-w-0 items-center justify-between gap-3 overflow-hidden rounded-md px-3 text-sm outline-none"
          const bar = (
            <span
              aria-hidden="true"
              className={cn("absolute inset-y-0 start-0 rounded-md transition-[width] duration-500 ease-out motion-reduce:transition-none", on ? "bg-foreground/20" : "bg-muted")}
              style={{ width: `${pct}%` }}
            />
          )
          const value = (
            <span className="relative flex shrink-0 items-baseline gap-2 tabular-nums">
              {it.hint && <span className="text-xs text-muted-foreground">{it.hint}</span>}
              {showShare && total > 0 && <span className="text-xs text-muted-foreground">{msg("bar-list.share", "{percent}%", { percent: Math.round((it.value / total) * 100) })}</span>}
              <span className="font-medium">{format(it.value)}</span>
            </span>
          )
          const content = (
            <>
              {bar}
              <span className="relative min-w-0">{label}</span>
              {value}
            </>
          )
          return (
            <li key={it.id} className="min-w-0">
              {it.href ? (
                <a href={it.href} className={cn(row, "focus-visible:ring-[3px] focus-visible:ring-ring/50 hover:[&>span:first-child]:bg-foreground/15")}>
                  {content}
                </a>
              ) : onSelect ? (
                <button type="button" aria-pressed={on} onClick={() => onSelect(it.id)} className={cn(row, "w-full text-start focus-visible:ring-[3px] focus-visible:ring-ring/50")}>
                  {content}
                </button>
              ) : (
                <div className={row}>{content}</div>
              )}
              <span className="sr-only">{msg("bar-list.rank", "Number {rank}", { rank: i + 1 })}</span>
            </li>
          )
        })}
      </ol>
      {limit && ordered.length > limit && (
        <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="inline-flex h-8 w-fit items-center gap-1.5 rounded-md px-2 text-xs font-medium text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50">
          <ChevronDown aria-hidden="true" className={cn("size-3.5 transition-transform motion-reduce:transition-none", open && "rotate-180")} />
          {open ? msg("bar-list.less", "Show fewer") : msg("bar-list.more", "Show {count} more", { count: hidden })}
        </button>
      )}
    </div>
  )
}

export { BarList, type BarListItem, type BarListProps }
