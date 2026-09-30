// Ballmac UI: Approval Card. https://ui.ballmac.com/components/approval-card
"use client"

import * as React from "react"
import { Check, OctagonAlert, ShieldAlert, ShieldCheck, Timer, X } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type ApprovalRisk = "low" | "medium" | "high"
type ApprovalStatus = "pending" | "approved" | "denied" | "expired"

const RISK: Record<ApprovalRisk, { label: string; hint: string; icon: React.ComponentType<{ className?: string }>; bar: string; chip: string }> = {
  low: { label: "Low risk", hint: "Reads data or changes nothing", icon: ShieldCheck, bar: "bg-chart-2", chip: "border-chart-2/30 bg-chart-2/10" },
  medium: { label: "Medium risk", hint: "Changes files or settings you can undo", icon: ShieldAlert, bar: "bg-chart-3", chip: "border-chart-3/30 bg-chart-3/10" },
  high: { label: "High risk", hint: "Hard to undo or sends data out", icon: OctagonAlert, bar: "bg-destructive", chip: "border-destructive/30 bg-destructive/10" },
}

type ApprovalDetail = {
  /** Label, such as "Directory". */
  label: string
  /** Value, such as a path or host. Shown in mono type. */
  value: string
}

type ApprovalCardProps = Omit<React.ComponentProps<"section">, "title"> & {
  /** What the agent wants to do, as a short sentence, for example "Run a shell command". */
  title: string
  /** Why the agent wants to do it. */
  description?: string
  /** How much damage a mistake could do. Sets the accent color, icon and wording. */
  risk?: ApprovalRisk
  /** Label/value rows under the description. */
  details?: ApprovalDetail[]
  /** The exact thing that will run: a command, a diff or a request body. */
  preview?: React.ReactNode
  /** Accessible name of the scrollable preview. */
  previewLabel?: string
  /** Current status (controlled). Without it the card keeps its own status after a button is pressed. */
  status?: ApprovalStatus
  /** Called when Approve is pressed. */
  onApprove?: () => void
  /** Called when Deny is pressed. */
  onDeny?: () => void
  /** Adds a third button that approves now and asks not to be asked again. */
  onAlwaysAllow?: () => void
  /** Text of the always-allow button. */
  alwaysAllowLabel?: string
  /** Seconds until the request is denied on its own. The card counts down and calls `onExpire`. */
  expiresIn?: number
  /** Called when the countdown reaches zero. */
  onExpire?: () => void
  /** Text after the decision, such as "by you at 10:42". */
  resolvedNote?: string
  /** Approve button text. */
  approveLabel?: string
  /** Deny button text. */
  denyLabel?: string
}

function ApprovalCard({
  title,
  description,
  risk = "medium",
  details,
  preview,
  previewLabel = "Exactly what will run",
  status: statusProp,
  onApprove,
  onDeny,
  onAlwaysAllow,
  alwaysAllowLabel = "Always allow",
  expiresIn,
  onExpire,
  resolvedNote,
  approveLabel = "Approve",
  denyLabel = "Deny",
  className,
  ...props
}: ApprovalCardProps) {
  const reduce = useReducedMotion()
  const id = React.useId()
  const [internal, setInternal] = React.useState<ApprovalStatus>("pending")
  const status = statusProp ?? internal
  const [left, setLeft] = React.useState(expiresIn ?? 0)
  const resolvedRef = React.useRef<HTMLDivElement>(null)
  const wasPending = React.useRef(true)
  const meta = RISK[risk]
  const RiskIcon = meta.icon
  const onExpireRef = React.useRef(onExpire)
  React.useEffect(() => {
    onExpireRef.current = onExpire
  })

  React.useEffect(() => {
    if (expiresIn === undefined || status !== "pending") return
    setLeft(expiresIn)
    const timer = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          clearInterval(timer)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [expiresIn, status])

  React.useEffect(() => {
    if (expiresIn !== undefined && status === "pending" && left === 0) {
      setInternal("expired")
      onExpireRef.current?.()
    }
  }, [left, expiresIn, status])

  // Buttons disappear on a decision, so move focus to the result instead of dropping it on the page.
  React.useEffect(() => {
    if (status !== "pending" && wasPending.current) resolvedRef.current?.focus()
    wasPending.current = status === "pending"
  }, [status])

  function decide(next: "approved" | "denied", cb?: () => void) {
    setInternal(next)
    cb?.()
  }

  const pending = status === "pending"
  const resolvedText =
    status === "approved" ? "Approved" : status === "denied" ? "Denied" : "Timed out and denied"

  return (
    <section
      data-slot="approval-card"
      data-status={status}
      data-risk={risk}
      aria-labelledby={`${id}-title`}
      className={cn(
        "relative w-full overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xs",
        className
      )}
      {...props}
    >
      <span aria-hidden="true" className={cn("absolute inset-y-0 left-0 w-1", pending ? meta.bar : "bg-border")} />
      <div className="grid gap-3.5 p-4 pl-5 sm:p-5 sm:pl-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 id={`${id}-title`} className="text-sm leading-6 font-semibold text-foreground">
              {title}
            </h3>
            {description && <p className="mt-0.5 text-[13px] leading-5 text-muted-foreground">{description}</p>}
          </div>
          <span
            title={meta.hint}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium text-foreground",
              meta.chip
            )}
          >
            <RiskIcon aria-hidden="true" className="size-3.5" />
            {meta.label}
            <span className="sr-only">. {meta.hint}</span>
          </span>
        </div>

        {details && details.length > 0 && (
          <dl className="grid gap-1.5 text-[13px]">
            {details.map((d) => (
              <div key={d.label} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                <dt className="w-24 shrink-0 text-muted-foreground">{d.label}</dt>
                <dd className="min-w-0 font-mono text-xs break-all text-foreground">{d.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {preview && (
          <div
            role="region"
            aria-label={previewLabel}
            tabIndex={0}
            className="max-h-44 overflow-auto rounded-lg border bg-muted/50 px-3 py-2.5 font-mono whitespace-pre-wrap break-words text-xs leading-5 text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            {preview}
          </div>
        )}

        {pending ? (
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <button
              type="button"
              onClick={() => decide("approved", onApprove)}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-[inset_0_1px_0_0_rgb(255_255_255/0.12),0_1px_2px_0_rgb(0_0_0/0.12)] outline-none transition-colors hover:bg-primary/90 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Check aria-hidden="true" className="size-4" />
              {approveLabel}
            </button>
            <button
              type="button"
              onClick={() => decide("denied", onDeny)}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border bg-background px-4 text-sm font-medium shadow-xs outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <X aria-hidden="true" className="size-4" />
              {denyLabel}
            </button>
            {onAlwaysAllow && (
              <button
                type="button"
                onClick={() => decide("approved", onAlwaysAllow)}
                className="inline-flex h-9 items-center rounded-md px-3 text-[13px] font-medium text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {alwaysAllowLabel}
              </button>
            )}
            {expiresIn !== undefined && (
              <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
                <Timer aria-hidden="true" className="size-3.5" />
                Denies itself in {left}s
              </span>
            )}
          </div>
        ) : null}
      </div>

      {pending && expiresIn !== undefined && (
        <motion.span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-foreground/60"
          initial={false}
          animate={{ scaleX: expiresIn > 0 ? left / expiresIn : 0 }}
          transition={reduce ? { duration: 0 } : { duration: 1, ease: "linear" }}
        />
      )}

      <div
        ref={resolvedRef}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        className={cn(
          "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
          !pending && "border-t bg-muted/40 px-5 py-2.5 sm:px-6"
        )}
      >
        {!pending && (
          <p className="flex items-center gap-2 text-[13px] font-medium text-foreground">
            {status === "approved" ? (
              <Check aria-hidden="true" className="size-4" />
            ) : status === "denied" ? (
              <X aria-hidden="true" className="size-4" />
            ) : (
              <Timer aria-hidden="true" className="size-4" />
            )}
            {resolvedText}
            {resolvedNote && <span className="font-normal text-muted-foreground">{resolvedNote}</span>}
          </p>
        )}
      </div>
    </section>
  )
}

export { ApprovalCard, type ApprovalCardProps, type ApprovalRisk, type ApprovalStatus, type ApprovalDetail }
