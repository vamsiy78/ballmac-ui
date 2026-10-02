// Ballmac UI: Toast Stack. https://ui.ballmac.com/components/toast-stack
"use client"

import * as React from "react"
import { CircleCheck, CircleAlert, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"

type ToastMessage = {
  /** Stable ID used for dismissal and updates. */ id: string
  /** Short notification headline. */ title: string
  /** Optional detail below the headline. */ description?: string
  /** Visual and semantic tone. */ tone?: "info" | "success" | "error"
  /** Optional action label. */ actionLabel?: string
  /** Called when the action is selected. */ onAction?: () => void
}
type ToastStackProps = Omit<React.ComponentProps<"section">, "children"> & {
  /** Controlled toast list. */
  toasts?: ToastMessage[]
  /** Initial toast list when uncontrolled. */
  defaultToasts?: ToastMessage[]
  /** Called when a toast is dismissed. */
  onToastsChange?: (toasts: ToastMessage[]) => void
  /** Auto-dismiss delay; set to 0 to keep toasts until dismissed. */
  durationMs?: number
  /** Accessible label for the stack. */
  label?: string
}

function ToastStack({
  className,
  toasts,
  defaultToasts = [],
  onToastsChange,
  durationMs = 5000,
  label,
  ...props
}: ToastStackProps) {
  const msg = useMessages()
  label ??= msg("toast-stack.label", "Notifications")
  const [internal, setInternal] = React.useState(defaultToasts)
  const [paused, setPaused] = React.useState(false)
  const current = toasts ?? internal
  const dismiss = React.useCallback(
    (id: string) => {
      const next = current.filter((toast) => toast.id !== id)
      if (toasts === undefined) setInternal(next)
      onToastsChange?.(next)
    },
    [current, toasts, onToastsChange],
  )
  React.useEffect(() => {
    if (durationMs <= 0 || paused || !current.length) return
    const timer = window.setTimeout(() => dismiss(current[0].id), durationMs)
    return () => window.clearTimeout(timer)
  }, [current, durationMs, paused, dismiss])
  return (
    <section
      data-slot="toast-stack"
      aria-label={label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false)
      }}
      className={cn("w-full max-w-sm", className)}
      {...props}
    >
      <ol className="flex flex-col gap-2">
        {current.map((toast) => {
          const tone = toast.tone ?? "info"
          const Icon =
            tone === "success"
              ? CircleCheck
              : tone === "error"
                ? CircleAlert
                : Info
          return (
            <li
              key={toast.id}
              data-slot="toast-stack-item"
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault()
                  dismiss(toast.id)
                }
              }}
              className="bg-background/90 flex min-w-0 items-start gap-3 rounded-xl border border-border p-3 shadow-lg backdrop-blur-xl transition-[transform,opacity] duration-200 motion-reduce:transition-none"
            >
              <span
                aria-hidden="true"
                className={cn(
                  "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
                  tone === "info" && "bg-primary/10 text-primary",
                  tone === "success" && "bg-chart-2/10 text-chart-2",
                  tone === "error" && "bg-destructive/10 text-destructive",
                )}
              >
                <Icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{toast.title}</p>
                {toast.description && (
                  <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                    {toast.description}
                  </p>
                )}
                {toast.actionLabel && toast.onAction && (
                  <button
                    type="button"
                    onClick={toast.onAction}
                    className="text-primary hover:underline mt-2 rounded-sm text-xs font-semibold outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    {toast.actionLabel}
                  </button>
                )}
              </div>
              <button
                type="button"
                aria-label={msg("toast-stack.dismiss", "Dismiss {title}", { title: toast.title })}
                onClick={() => dismiss(toast.id)}
                className="text-muted-foreground hover:bg-accent hover:text-foreground flex size-8 shrink-0 items-center justify-center rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </li>
          )
        })}
      </ol>
      <span className="sr-only" aria-live="polite">
        {current.at(-1)?.title ?? ""}
      </span>
    </section>
  )
}

export { ToastStack, type ToastStackProps, type ToastMessage }
