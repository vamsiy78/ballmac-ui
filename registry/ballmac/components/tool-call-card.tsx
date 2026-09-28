// Ballmac UI: Tool Call Card. https://ui.ballmac.com/components/tool-call-card
"use client"

import * as React from "react"
import { ChevronRight, CircleCheck, CircleDashed, CircleX, LoaderCircle, Wrench } from "lucide-react"
import { Collapsible as CollapsiblePrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

type ToolCallStatus = "pending" | "running" | "success" | "error"

const statusConfig: Record<ToolCallStatus, { label: string; icon: React.ElementType; className: string }> = {
  pending: { label: "Pending", icon: CircleDashed, className: "text-muted-foreground" },
  running: { label: "Running", icon: LoaderCircle, className: "text-foreground" },
  success: { label: "Success", icon: CircleCheck, className: "text-chart-2" }, // icon only; chart-2 is too light for small text
  error: { label: "Error", icon: CircleX, className: "text-destructive" },
}

/** 340 -> "340ms", 1240 -> "1.2s", 72000 -> "1m 12s". Locale-independent so SSR and the browser agree. */
function formatToolDuration(ms: number) {
  if (ms < 1000) return `${Math.max(0, Math.round(ms))}ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`
  const s = Math.round(ms / 1000)
  return `${Math.floor(s / 60)}m ${s % 60}s`
}

function formatPayload(value: unknown) {
  if (typeof value === "string") return value
  try {
    return JSON.stringify(value, null, 2) ?? String(value)
  } catch {
    return String(value)
  }
}

type ToolCallStatusBadgeProps = React.ComponentProps<"span"> & {
  /** The tool call's lifecycle state. Rendered as an icon plus text, never color alone. */
  status: ToolCallStatus
}

function ToolCallStatusBadge({ status, className, ...props }: ToolCallStatusBadgeProps) {
  const { label, icon: Icon, className: tone } = statusConfig[status]
  return (
    <span
      data-slot="tool-call-status"
      data-status={status}
      className={cn("inline-flex shrink-0 items-center gap-1 text-xs font-medium", status === "pending" ? "text-muted-foreground" : "text-foreground", className)}
      {...props}
    >
      <Icon
        aria-hidden="true"
        className={cn("size-3.5", tone, status === "running" && "animate-spin motion-reduce:animate-none")}
      />
      {label}
    </span>
  )
}

function PayloadBlock({ label, value, tone }: { label: string; value: unknown; tone?: "error" }) {
  return (
    <div data-slot="tool-call-section" className="grid gap-1.5">
      <div className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">{label}</div>
      <pre
        tabIndex={0}
        aria-label={label}
        className={cn(
          "max-h-64 overflow-auto rounded-md border bg-muted/50 px-3 py-2.5 font-mono text-xs leading-5 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
          tone === "error" && "border-destructive/30 text-destructive"
        )}
      >
        {formatPayload(value)}
      </pre>
    </div>
  )
}

type ToolCallCardProps = Omit<React.ComponentProps<"div">, "dir"> & {
  /** Tool name, shown in monospace, for example "search_docs". */
  name: string
  /** Lifecycle state of the call. */
  status?: ToolCallStatus
  /** How long the call took, in milliseconds. */
  duration?: number
  /** Arguments the model passed. Objects are pretty-printed as JSON; strings are shown as-is. */
  input?: unknown
  /** What the tool returned, or the error message when status is "error". */
  result?: unknown
  /** Short human description shown under the name. */
  description?: React.ReactNode
  /** Controlled open state of the details panel. */
  open?: boolean
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean
  /** Called when the details panel opens or closes. */
  onOpenChange?: (open: boolean) => void
}

function ToolCallCard({
  name,
  status = "pending",
  duration,
  input,
  result,
  description,
  open,
  defaultOpen = false,
  onOpenChange,
  className,
  children,
  ...props
}: ToolCallCardProps) {
  const hasInput = input !== undefined
  const hasResult = result !== undefined
  const hasDetails = hasInput || hasResult || children != null

  return (
    <CollapsiblePrimitive.Root
      data-slot="tool-call-card"
      data-status={status}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      disabled={!hasDetails}
      className={cn("group/tool w-full overflow-hidden rounded-xl border bg-card text-card-foreground", className)}
      {...props}
    >
      <div className="flex min-w-0 items-center gap-2 px-3 py-2">
        <CollapsiblePrimitive.Trigger
          data-slot="tool-call-trigger"
          className="-mx-1 flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-1 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-default"
        >
          <ChevronRight
            aria-hidden="true"
            className={cn(
              "size-3.5 shrink-0 text-muted-foreground transition-transform duration-150 group-data-[state=open]/tool:rotate-90 motion-reduce:transition-none",
              !hasDetails && "invisible"
            )}
          />
          <Wrench aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="min-w-0">
            <span className="block truncate font-mono text-[13px] font-medium">{name}</span>
            {description ? <span className="block truncate text-xs text-muted-foreground">{description}</span> : null}
          </span>
        </CollapsiblePrimitive.Trigger>
        <span aria-live="polite" className="flex shrink-0 items-center gap-2.5">
          <ToolCallStatusBadge status={status} />
          {duration !== undefined ? (
            <span className="font-mono text-[11px] text-muted-foreground tabular-nums">{formatToolDuration(duration)}</span>
          ) : null}
        </span>
      </div>
      {hasDetails ? (
        <CollapsiblePrimitive.Content data-slot="tool-call-details" className="grid gap-3 border-t px-3 py-3">
          {hasInput ? <PayloadBlock label="Input" value={input} /> : null}
          {hasResult ? (
            <PayloadBlock
              label={status === "error" ? "Error" : "Result"}
              value={result}
              tone={status === "error" ? "error" : undefined}
            />
          ) : null}
          {children}
        </CollapsiblePrimitive.Content>
      ) : null}
    </CollapsiblePrimitive.Root>
  )
}

export {
  ToolCallCard,
  ToolCallStatusBadge,
  formatToolDuration,
  type ToolCallCardProps,
  type ToolCallStatusBadgeProps,
  type ToolCallStatus,
}
