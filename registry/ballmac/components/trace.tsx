// Ballmac UI: Trace. https://ui.ballmac.com/components/trace
// Based on shadcn/ui's Trace (MIT, Copyright (c) 2023 shadcn): the same parts and props, restyled with tokens, a shimmer that follows the theme, and no Radix UI.
"use client"

import * as React from "react"
import { ChevronRight } from "lucide-react"

import { ShimmerText } from "@/components/ballmac/shimmer-text"
import { cn } from "@/lib/utils"

type TraceStatus = "running" | "error" | "pending"

const StatusContext = React.createContext<TraceStatus | undefined>(undefined)

/** A list of rows. It also styles any trigger or link that wraps a `TraceLine`, so a row looks the same whatever it does. */
function Trace({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="trace"
      className={cn(
        "flex w-full min-w-0 flex-col text-sm",
        "*:has-[>[data-slot=trace-line]]:flex *:has-[>[data-slot=trace-line]]:w-fit *:has-[>[data-slot=trace-line]]:max-w-full *:has-[>[data-slot=trace-line]]:min-w-0 *:has-[>[data-slot=trace-line]]:text-start *:has-[>[data-slot=trace-line]]:outline-none",
        "*:has-[>[data-slot=trace-line]]:rounded-md *:has-[>[data-slot=trace-line]]:focus-visible:ring-[3px] *:has-[>[data-slot=trace-line]]:focus-visible:ring-ring/50",
        className
      )}
      {...props}
    />
  )
}

type TraceLineProps = React.ComponentProps<"span"> & {
  /** The state of the work the line reports. Say it in the title too: color and motion alone are not read out. */
  status?: TraceStatus
}

/** One line: an icon and a title. It is a span, so it is not a button or a tab stop: wrap it in a trigger or a link to make it do something. */
function TraceLine({ className, status, ...props }: TraceLineProps) {
  return (
    <StatusContext.Provider value={status}>
      <span
        data-slot="trace-line"
        data-status={status}
        className={cn(
          "flex w-fit min-w-0 max-w-full items-center gap-2 py-1 text-muted-foreground transition-colors motion-reduce:transition-none",
          "in-[a,button]:cursor-pointer in-[a:hover,button:hover]:text-foreground",
          "data-[status=error]:text-destructive data-[status=error]:in-[a:hover,button:hover]:text-destructive data-[status=pending]:opacity-60",
          className
        )}
        {...props}
      />
    </StatusContext.Provider>
  )
}

/** A decorative icon slot, hidden from assistive technology. Before the title it names the action; after it, it is the indicator. */
function TraceIcon({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="trace-icon" aria-hidden="true" className={cn("flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4", className)} {...props} />
}

/** One sentence on one line. It truncates, and shimmers while the line is running (and holds still when motion is reduced). */
function TraceTitle({ className, children, ...props }: React.ComponentProps<"span">) {
  const status = React.useContext(StatusContext)
  return (
    <span data-slot="trace-title" className={cn("min-w-0 truncate", className)} {...props}>
      {status === "running" && typeof children === "string" ? <ShimmerText className="max-w-full truncate align-bottom">{children}</ShimmerText> : children}
    </span>
  )
}

/** Secondary text after the title, such as a count or a duration. It does not truncate. */
function TraceDescription({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="trace-description" className={cn("shrink-0 tabular-nums text-muted-foreground/70", className)} {...props} />
}

// ------------------------------------------------------------------------------------------------- the row that expands

type CollapsibleState = { open: boolean; setOpen: (open: boolean) => void; contentId: string; triggerId: string; disabled: boolean }
const CollapsibleContext = React.createContext<CollapsibleState | null>(null)
const useRow = () => {
  const c = React.useContext(CollapsibleContext)
  if (!c) throw new Error("TraceCollapsibleTrigger and TraceCollapsibleContent must be used inside <TraceCollapsible>.")
  return c
}

type TraceCollapsibleProps = Omit<React.ComponentProps<"div">, "defaultValue"> & {
  /** The controlled open state. Pass it with `onOpenChange`. */
  open?: boolean
  /** Whether the row starts open. */
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
}

/** A row that expands. It takes the props of a collapsible: `open`, `defaultOpen`, `onOpenChange` and `disabled`. */
function TraceCollapsible({ open: openProp, defaultOpen = false, onOpenChange, disabled = false, className, children, ...props }: TraceCollapsibleProps) {
  const [inner, setInner] = React.useState(defaultOpen)
  const open = openProp ?? inner
  const id = React.useId()
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (openProp === undefined) setInner(next)
      onOpenChange?.(next)
    },
    [openProp, onOpenChange]
  )
  const value = React.useMemo(() => ({ open, setOpen, contentId: `${id}-content`, triggerId: `${id}-trigger`, disabled }), [open, setOpen, id, disabled])
  return (
    <CollapsibleContext.Provider value={value}>
      <div data-slot="trace-collapsible" data-state={open ? "open" : "closed"} className={cn("flex w-full min-w-0 flex-col", className)} {...props}>
        {children}
      </div>
    </CollapsibleContext.Provider>
  )
}

type TraceCollapsibleTriggerProps = Omit<React.ComponentProps<"button">, "type">

/** The button that opens and closes the row. Put a `TraceLine` inside it; it adds a chevron after the line. */
function TraceCollapsibleTrigger({ className, children, onClick, ...props }: TraceCollapsibleTriggerProps) {
  const row = useRow()
  return (
    <button
      type="button"
      id={row.triggerId}
      data-slot="trace-collapsible-trigger"
      data-state={row.open ? "open" : "closed"}
      aria-expanded={row.open}
      aria-controls={row.contentId}
      disabled={row.disabled}
      onClick={(e) => {
        onClick?.(e)
        if (!e.defaultPrevented) row.setOpen(!row.open)
      }}
      className={cn(
        "flex w-fit min-w-0 max-w-full cursor-pointer items-center gap-2 rounded-md text-start text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 has-[[data-status=error]]:text-destructive motion-reduce:transition-none",
        className
      )}
      {...props}
    >
      {children}
      <TraceIcon className="-ms-1">
        <ChevronRight className={cn("transition-transform duration-200 motion-reduce:transition-none", row.open ? "rotate-90" : "rtl:rotate-180")} />
      </TraceIcon>
    </button>
  )
}

type TraceCollapsibleContentProps = React.ComponentProps<"div">

/** The detail of a row that expands. Closed, it is out of the tab order and hidden from screen readers. Its text is muted: give blocks inside it `text-foreground`. */
function TraceCollapsibleContent({ className, children, ...props }: TraceCollapsibleContentProps) {
  const row = useRow()
  return (
    <div
      id={row.contentId}
      role="region"
      aria-labelledby={row.triggerId}
      data-slot="trace-collapsible-content"
      data-state={row.open ? "open" : "closed"}
      inert={!row.open}
      aria-hidden={!row.open || undefined}
      className={cn("grid min-w-0 transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none", row.open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
    >
      <div className="min-h-0 overflow-hidden">
        <div data-slot="trace-collapsible-content-inner" className={cn("min-w-0 break-words py-1 text-muted-foreground", className)} {...props}>
          {children}
        </div>
      </div>
    </div>
  )
}

export {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
  type TraceCollapsibleContentProps,
  type TraceCollapsibleProps,
  type TraceCollapsibleTriggerProps,
  type TraceLineProps,
  type TraceStatus,
}
