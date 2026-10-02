// Ballmac UI: Sources List. https://ui.ballmac.com/components/sources-list
"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Collapsible as CollapsiblePrimitive } from "radix-ui"

import { SourceFavicon, hostOf, type CitationSource } from "@/components/ballmac/citation"
import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"

type SourcesListProps = Omit<React.ComponentProps<"div">, "onChange" | "title"> & {
  /** The pages the answer drew on, in citation order: the first is [1]. */
  sources: CitationSource[]
  /** "list" is one compact row per source, "cards" is a grid with excerpts. */
  variant?: "list" | "cards"
  /** Heading. The count is added for you. */
  title?: string
  /** Controlled open state. */
  open?: boolean
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean
  /** Called when the list opens or closes. */
  onOpenChange?: (open: boolean) => void
  /** Turn off the disclosure and always show the list. */
  collapsible?: boolean
  /** How many sources show before "Show all". */
  visibleCount?: number
  /** One-based number of the source to emphasize, for example while its citation is hovered. */
  highlight?: number | null
  /** Id prefix for each source row (`<idPrefix>-1`). Lets a citation link scroll to its row. */
  idPrefix?: string
}

function SourcesList({
  sources,
  variant = "list",
  title,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  collapsible = true,
  visibleCount = 4,
  highlight = null,
  idPrefix,
  className,
  ...props
}: SourcesListProps) {
  const msg = useMessages()
  title ??= msg("sources-list.title", "Sources")
  const reduce = useReducedMotion()
  const autoId = React.useId()
  const prefix = idPrefix ?? `sources${autoId.replace(/:/g, "")}`
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const open = collapsible ? (openProp ?? internalOpen) : true
  const [all, setAll] = React.useState(false)
  const shown = all ? sources : sources.slice(0, visibleCount)
  const hidden = sources.length - shown.length

  function setOpen(next: boolean) {
    setInternalOpen(next)
    onOpenChange?.(next)
  }

  const count = `${sources.length} ${sources.length === 1 ? "source" : "sources"}`

  const rows = (
    <ol
      aria-label={title}
      className={cn(variant === "cards" ? "grid gap-2 sm:grid-cols-2" : "grid gap-0.5")}
    >
      <AnimatePresence initial={false}>
        {shown.map((source, i) => {
          const n = i + 1
          const active = highlight === n
          return (
            <motion.li
              key={source.url}
              layout={reduce ? false : "position"}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: reduce ? 0 : Math.min(Math.max(i - visibleCount, 0), 6) * 0.03 }}
              className="min-w-0"
            >
              <a
                id={`${prefix}-${n}`}
                href={source.url}
                target="_blank"
                rel="noreferrer noopener"
                data-active={active || undefined}
                className={cn(
                  "group/source flex min-w-0 gap-3 rounded-lg outline-none transition-[background-color,box-shadow] duration-150 focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none",
                  variant === "cards"
                    ? "h-full border bg-card p-3 hover:border-foreground/25 hover:bg-accent/50"
                    : "items-center px-2.5 py-2 hover:bg-accent/70",
                  active && "bg-accent ring-1 ring-foreground/25"
                )}
              >
                <span
                  aria-hidden="true"
                  className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-md bg-muted px-1 font-mono text-[11px] text-muted-foreground tabular-nums"
                >
                  {n}
                </span>
                <span className="grid min-w-0 flex-1 gap-0.5">
                  <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                    <SourceFavicon source={source} className="size-4 text-[9px]" />
                    <span className="truncate">{source.site ?? hostOf(source.url)}</span>
                    {source.date && <span className="shrink-0 before:me-1.5 before:content-['·']">{source.date}</span>}
                  </span>
                  <span
                    className={cn(
                      "text-sm font-medium text-foreground group-hover/source:underline group-hover/source:underline-offset-4",
                      variant === "cards" ? "line-clamp-2" : "truncate"
                    )}
                  >
                    <span className="sr-only">{`Source ${n}:`}</span>{" "}
                    {source.title}
                  </span>
                  {variant === "cards" && source.snippet && (
                    <span className="line-clamp-2 text-[13px] leading-5 text-muted-foreground">{source.snippet}</span>
                  )}
                </span>
              </a>
            </motion.li>
          )
        })}
      </AnimatePresence>
    </ol>
  )

  const more = hidden > 0 && (
    <button
      type="button"
      onClick={() => setAll(true)}
      className="mt-1 ms-2 inline-flex h-8 items-center rounded-md px-2 text-[13px] font-medium text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      {msg("sources-list.showAll", "Show all")} {sources.length}
    </button>
  )

  if (!collapsible) {
    return (
      <div data-slot="sources-list" className={cn("w-full", className)} {...props}>
        <p className="mb-1.5 px-2.5 text-sm font-medium text-foreground">
          {title} <span className="font-normal text-muted-foreground tabular-nums">{sources.length}</span>
        </p>
        {rows}
        {more}
      </div>
    )
  }

  const stack = sources.slice(0, 4)
  return (
    <CollapsiblePrimitive.Root
      data-slot="sources-list"
      open={open}
      onOpenChange={setOpen}
      className={cn("w-full rounded-xl border bg-card text-card-foreground", className)}
      {...props}
    >
      <CollapsiblePrimitive.Trigger
        data-slot="sources-trigger"
        className="group flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2 text-start text-sm outline-none transition-colors duration-150 hover:bg-accent/50 focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none"
      >
        <span aria-hidden="true" className="flex -space-x-1.5">
          {stack.map((s, i) => (
            <SourceFavicon
              key={s.url}
              source={s}
              className="size-6 rounded-full border-2 border-card text-[10px]"
              style={{ zIndex: stack.length - i }}
            />
          ))}
        </span>
        <span className="font-medium text-foreground">{title}</span>
        <span className="text-muted-foreground tabular-nums">{count}</span>
        <ChevronDown
          aria-hidden="true"
          className="ms-auto size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180 motion-reduce:transition-none"
        />
      </CollapsiblePrimitive.Trigger>
      <CollapsiblePrimitive.Content className="overflow-hidden data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 motion-reduce:animate-none">
        <div className="border-t p-1.5">
          {rows}
          {more}
        </div>
      </CollapsiblePrimitive.Content>
    </CollapsiblePrimitive.Root>
  )
}

export { SourcesList, type SourcesListProps }
