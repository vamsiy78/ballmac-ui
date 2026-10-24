// Ballmac UI: Tool Call Card. https://ui.ballmac.com/components/tool-call-card
"use client"

import * as React from "react"
import { Ban, Check, ChevronRight, CircleCheck, CircleDashed, CircleX, Copy, LoaderCircle, RotateCcw, Wrench } from "lucide-react"
import { motion } from "motion/react"
import { Collapsible as CollapsiblePrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { defineMessage, useMessages, type Message } from "@/lib/ballmac/i18n"
import { useLoopsPaused } from "@/lib/ballmac/motion"

type ToolCallStatus = "pending" | "running" | "success" | "error" | "denied"

const statusConfig: Record<ToolCallStatus, { label: Message; icon: React.ElementType; className: string }> = {
  pending: { label: defineMessage("tool-call-card.statusConfig.pending", "Pending"), icon: CircleDashed, className: "text-muted-foreground" },
  running: { label: defineMessage("tool-call-card.statusConfig.running", "Running"), icon: LoaderCircle, className: "text-foreground" },
  success: { label: defineMessage("tool-call-card.statusConfig.success", "Success"), icon: CircleCheck, className: "text-chart-2" }, // icon only; chart-2 is too light for small text
  error: { label: defineMessage("tool-call-card.statusConfig.error", "Error"), icon: CircleX, className: "text-destructive" },
  denied: { label: defineMessage("tool-call-card.statusConfig.denied", "Denied"), icon: Ban, className: "text-muted-foreground" },
}

/** The colour of the strip down the card's start edge. A strip never carries meaning alone: the status is also written out. */
const rail: Record<ToolCallStatus, string> = { pending: "bg-border", running: "bg-chart-1", success: "bg-chart-2", error: "bg-destructive", denied: "bg-muted-foreground/50" }

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
  const msg = useMessages()
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
      {msg.of(label)}
    </span>
  )
}

/** An object whose values are all plain (strings, numbers, booleans, null) can be listed as keys and values; anything nested stays JSON. */
function flatEntries(value: unknown): [string, string][] | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  const entries = Object.entries(value as Record<string, unknown>)
  if (entries.length === 0 || entries.some(([, v]) => v !== null && typeof v === "object")) return null
  return entries.map(([k, v]) => [k, typeof v === "string" ? v : String(v)])
}

function CopyPayload({ text, label }: { text: string; label: string }) {
  const msg = useMessages()
  const [copied, setCopied] = React.useState(false)
  return (
    <button
      type="button"
      aria-label={msg("tool-call-card.copyLabel", "Copy {label}", { label: label.toLowerCase() })}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        } catch {
          // Clipboard unavailable: the text is still on screen.
        }
      }}
      className="flex h-6 items-center gap-1 rounded-md px-1.5 font-sans text-[11px] tracking-normal text-muted-foreground normal-case outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none"
    >
      {copied ? <Check aria-hidden="true" className="size-3" /> : <Copy aria-hidden="true" className="size-3" />}
      <span aria-live="polite">{copied ? msg("tool-call-card.copied", "Copied") : msg("tool-call-card.copy", "Copy")}</span>
    </button>
  )
}

/** JSON text with its keys quieter than its values, so structure reads at a glance. Plain text, or anything that is not valid JSON, is returned as it is. Weight and tone only (no hues), so contrast holds in every theme. */
function highlightJson(text: string): React.ReactNode {
  try {
    JSON.parse(text)
  } catch {
    return text
  }
  const out: React.ReactNode[] = []
  const re = /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(<span key={`p${last}`} className="text-muted-foreground">{text.slice(last, m.index)}</span>)
    if (m[1] && m[2]) out.push(<span key={m.index} className="text-muted-foreground">{m[1]}{m[2]}</span>)
    else if (m[1]) out.push(<span key={m.index}>{m[1]}</span>)
    else out.push(<span key={m.index} className="font-semibold">{m[0]}</span>)
    last = m.index + m[0].length
  }
  if (last < text.length) out.push(<span key="end" className="text-muted-foreground">{text.slice(last)}</span>)
  return out
}

function PayloadBlock({ label, value, tone }: { label: string; value: unknown; tone?: "error" }) {
  const rows = tone ? null : flatEntries(value)
  return (
    <div data-slot="tool-call-section" className="grid gap-1.5">
      <div className="flex items-center justify-between gap-2 font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
        <span>{label}</span>
        <CopyPayload text={formatPayload(value)} label={label} />
      </div>
      {rows ? (
        <dl dir="ltr" tabIndex={0} aria-label={label} className="grid max-h-64 grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 overflow-auto rounded-md border bg-muted/50 px-3 py-2.5 font-mono text-xs leading-5 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
          {rows.map(([k, v]) => (
            <React.Fragment key={k}>
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="m-0 break-words whitespace-pre-wrap">{v}</dd>
            </React.Fragment>
          ))}
        </dl>
      ) : (
      <pre dir="ltr"
        tabIndex={0}
        aria-label={label}
        className={cn(
          "max-h-64 overflow-auto rounded-md border bg-muted/50 px-3 py-2.5 font-mono text-xs leading-5 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
          tone === "error" && "border-destructive/30 text-destructive"
        )}
      >
        {tone ? formatPayload(value) : highlightJson(formatPayload(value))}
      </pre>
      )}
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
  /** Where the tool lives, for example "stripe" for an MCP server. Shown as a small tag after the name. */
  server?: string
  /** An icon or logo for the tool, shown in a tile in place of the wrench. */
  icon?: React.ReactNode
  /** Adds a Retry button to a failed call. Reject and the card says why. */
  onRetry?: () => void | Promise<void>
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
  server,
  icon,
  onRetry,
  open,
  defaultOpen = false,
  onOpenChange,
  className,
  children,
  ...props
}: ToolCallCardProps) {
  const msg = useMessages()
  const paused = useLoopsPaused()
  const [retrying, setRetrying] = React.useState(false)
  const [retryError, setRetryError] = React.useState<string | null>(null)
  async function retry() {
    setRetrying(true)
    setRetryError(null)
    try {
      await onRetry?.()
    } catch (e) {
      setRetryError(e instanceof Error ? e.message : msg("tool-call-card.retryFailed", "It could not be retried."))
    } finally {
      setRetrying(false)
    }
  }
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
      className={cn("group/tool relative w-full overflow-hidden rounded-xl border bg-card text-card-foreground", className)}
      {...props}
    >
      <span aria-hidden="true" className={cn("absolute inset-y-0 start-0 w-1", rail[status])} />
      <div className="flex min-w-0 items-center gap-2 py-2 ps-4 pe-3">
        <CollapsiblePrimitive.Trigger
          data-slot="tool-call-trigger"
          className="-mx-1 flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-1 text-start outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-default"
        >
          <ChevronRight
            aria-hidden="true"
            className={cn(
              "size-3.5 shrink-0 text-muted-foreground transition-transform duration-150 group-data-[state=open]/tool:rotate-90 rtl:group-data-[state=closed]/tool:rotate-180 motion-reduce:transition-none",
              !hasDetails && "invisible"
            )}
          />
          <span aria-hidden="true" className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground [&>svg]:size-3.5">{icon ?? <Wrench />}</span>
          <span className="min-w-0">
            <span className="flex min-w-0 items-center gap-2">
              <span className="truncate font-mono text-[13px] font-medium">{name}</span>
              {server && <span className="shrink-0 rounded-full border px-2 py-px text-[11px] text-muted-foreground">{server}</span>}
            </span>
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
      {status === "running" && (
        <div dir="ltr" aria-hidden="true" className="relative h-0.5 overflow-hidden bg-muted/60">
          {paused ? (
            <span className="absolute inset-y-0 start-0 w-1/3 bg-foreground/60" />
          ) : (
            <motion.span className="absolute inset-y-0 w-1/3 rounded-full bg-foreground/70" initial={{ x: "-100%" }} animate={{ x: "300%" }} transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }} />
          )}
        </div>
      )}
      {hasDetails ? (
        <CollapsiblePrimitive.Content data-slot="tool-call-details" className="grid gap-3 border-t py-3 ps-4 pe-3">
          {hasInput ? <PayloadBlock label="Input" value={input} /> : null}
          {hasResult ? (
            <PayloadBlock
              label={status === "error" ? "Error" : "Result"}
              value={result}
              tone={status === "error" ? "error" : undefined}
            />
          ) : null}
          {status === "error" && onRetry && (
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" disabled={retrying} onClick={() => void retry()} className="inline-flex h-8 items-center gap-1.5 rounded-md border bg-background px-2.5 text-xs font-medium outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-60">
                {retrying ? <LoaderCircle aria-hidden="true" className="size-3.5 animate-spin" /> : <RotateCcw aria-hidden="true" className="size-3.5" />}
                {msg("tool-call-card.retry", "Retry")}
              </button>
              {retryError && <p role="alert" className="text-sm font-medium text-destructive">{retryError}</p>}
            </div>
          )}
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
