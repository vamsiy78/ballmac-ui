// Ballmac UI: State View. https://ui.ballmac.com/components/state-view
"use client"

import * as React from "react"
import { CircleAlert, Inbox, RotateCw } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { Empty, EmptyAction, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ballmac/empty"
import { Skeleton } from "@/components/ballmac/skeleton"
import { useMessages } from "@/lib/ballmac/i18n"
import { isBusy, type BlockState } from "@/lib/ballmac/use-resource"
import { cn } from "@/lib/utils"

type EmptyConfig = {
  title?: string
  description?: string
  icon?: React.ReactNode
  /** The way out of the empty state: usually a button that creates the first item. */
  action?: React.ReactNode
}

type ErrorConfig = {
  title?: string
  description?: string
  /** Technical detail for people who want it, shown behind a disclosure. */
  details?: string
  retryLabel?: string
  /** Replace the retry button, for example with a link to status. */
  action?: React.ReactNode
}

type StateViewProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** What to show. `submitting` and `success` belong to forms and render the children. */
  state: BlockState
  /** Shown while loading. Make it the same shape as the ready content so nothing jumps. A plain set of lines is used if you leave it out. */
  loading?: React.ReactNode
  /** Copy and action for the empty state, or your own node. */
  empty?: EmptyConfig | React.ReactNode
  /** Copy for the error state, or your own node. */
  error?: ErrorConfig | React.ReactNode
  /** Called by the retry button. Without it the button is not drawn. */
  onRetry?: () => void
  /** Text announced to assistive technology while loading. */
  label?: string
  /** Drop the empty and error panels' border and tint, for use inside a frame that already has them. */
  bare?: boolean
  /** The ready content. */
  children?: React.ReactNode
}

/** The props every block with states takes, so they all behave the same way. */
type StateProps = {
  /** What the block shows. Defaults to `ready`. */
  state?: BlockState
  /** Called by the retry button in the error state. Without it the button is not drawn. */
  onRetry?: () => void
  /** Copy and action for the empty state. */
  emptyState?: EmptyConfig
  /** Copy for the error state. */
  errorState?: ErrorConfig
}

const FRAME_ATTRS = new Set(["id", "style", "lang", "dir", "role", "hidden", "title", "tabIndex"])

/**
 * The props a block should put on its own frame while it shows a state instead of its content: plain HTML attributes only.
 * Without this a block's own props (`messages`, `onSend`, `getSeries`) would be spread onto a DOM element.
 */
function frameProps(props: object): React.HTMLAttributes<HTMLElement> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(props)) if (FRAME_ATTRS.has(k) || k.startsWith("aria-") || k.startsWith("data-")) out[k] = v
  return out
}

const isNode = (v: unknown): v is React.ReactElement => React.isValidElement(v)

/** Placeholder lines for when no skeleton is given. */
function DefaultSkeleton() {
  return (
    <div className="grid gap-3" aria-hidden="true">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-11/12" />
      <Skeleton className="h-4 w-4/5" />
    </div>
  )
}

/**
 * Shows the right thing for what the data is doing: a skeleton while loading, a helpful empty state, an error with a way
 * to try again, or your content when it is ready. It announces every change to screen readers, marks the region busy while
 * loading, fades between states with the theme's motion, and never moves focus on its own.
 */
function StateView({ state, loading, empty, error, onRetry, label, bare = false, className, children, ...props }: StateViewProps) {
  const msg = useMessages()
  const e: EmptyConfig = isNode(empty) ? {} : ((empty as EmptyConfig | undefined) ?? {})
  const x: ErrorConfig = isNode(error) ? {} : ((error as ErrorConfig | undefined) ?? {})
  const view = state === "loading" || state === "empty" || state === "error" ? state : "ready"
  return (
    <div
      data-slot="state-view"
      data-state={state}
      aria-busy={isBusy(state) || undefined}
      className={cn("min-w-0", className)}
      {...props}
    >
      {/* keyed by the view, so each change plays the enter animation; durations follow the theme's speed */}
      <div
        key={view}
        className="animate-in fade-in-0 slide-in-from-bottom-1 h-full motion-reduce:animate-none [--tw-enter-translate-y:calc(var(--bm-distance,10px)*0.4)]"
      >
        {view === "loading" ? (
          <div role="status" data-slot="state-view-loading" className="h-full">
            <span className="sr-only">{label ?? msg("state-view.loading", "Loading")}</span>
            {loading ?? <DefaultSkeleton />}
          </div>
        ) : view === "empty" ? (
          isNode(empty) ? (
            empty
          ) : (
            <Empty data-slot="state-view-empty" className={cn("h-full bg-card/60", bare && "border-0 bg-transparent")}>
              <EmptyMedia>{e.icon ?? <Inbox />}</EmptyMedia>
              <EmptyTitle>{e.title ?? msg("state-view.emptyTitle", "Nothing here yet")}</EmptyTitle>
              <EmptyDescription>{e.description ?? msg("state-view.emptyDescription", "When there is something to show, it will appear here.")}</EmptyDescription>
              {e.action ? <EmptyAction>{e.action}</EmptyAction> : null}
            </Empty>
          )
        ) : view === "error" ? (
          isNode(error) ? (
            error
          ) : (
            <div
              role="alert"
              data-slot="state-view-error"
              className={cn("border-destructive/25 bg-destructive/[0.04] flex h-full w-full min-w-0 flex-col items-center justify-center rounded-xl border px-5 py-10 text-center", bare && "border-0 bg-transparent")}
            >
              <span aria-hidden="true" className="bg-destructive/10 text-destructive mb-4 flex size-11 items-center justify-center rounded-full [&>svg]:size-5">
                <CircleAlert />
              </span>
              <h3 className="text-sm font-semibold">{x.title ?? msg("state-view.errorTitle", "Something went wrong")}</h3>
              <p className="text-muted-foreground mt-1 max-w-sm text-sm leading-relaxed">
                {x.description ?? msg("state-view.errorDescription", "We could not load this. Check your connection and try again.")}
              </p>
              {x.details ? (
                <details className="text-muted-foreground mt-3 max-w-full text-xs">
                  <summary className="focus-visible:ring-[3px] focus-visible:ring-ring/50 cursor-default rounded-sm outline-none select-none">{msg("state-view.details", "Details")}</summary>
                  <pre className="bg-muted mt-2 max-w-full overflow-auto rounded-md p-2 text-start font-mono whitespace-pre-wrap">{x.details}</pre>
                </details>
              ) : null}
              {x.action || onRetry ? (
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  {onRetry ? (
                    <Button variant="outline" size="sm" onClick={onRetry}>
                      <RotateCw aria-hidden="true" />
                      {x.retryLabel ?? msg("state-view.retry", "Try again")}
                    </Button>
                  ) : null}
                  {x.action}
                </div>
              ) : null}
            </div>
          )
        ) : (
          children
        )}
      </div>
    </div>
  )
}

export { StateView, frameProps, type StateViewProps, type StateProps, type EmptyConfig, type ErrorConfig }
