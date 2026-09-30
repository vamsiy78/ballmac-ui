// Ballmac UI: Inline Alert. https://ui.ballmac.com/components/inline-alert
import * as React from "react"
import { CircleAlert, CircleCheck, Info } from "lucide-react"
import { cn } from "@/lib/utils"

type InlineAlertProps = React.ComponentProps<"div"> & {
  /** Concise status or validation message. */
  message: string
  /** Message tone and announcement priority. */
  tone?: "info" | "success" | "error"
  /** Optional corrective link or button. */
  action?: React.ReactNode
}

function InlineAlert({
  className,
  message,
  tone = "info",
  action,
  ...props
}: InlineAlertProps) {
  const Icon =
    tone === "error" ? CircleAlert : tone === "success" ? CircleCheck : Info
  return (
    <div
      data-slot="inline-alert"
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex w-full min-w-0 flex-wrap items-center gap-x-2 gap-y-1 rounded-md border px-3 py-2 text-sm",
        tone === "info" && "border-primary/25 bg-primary/5",
        tone === "success" && "border-chart-2/30 bg-chart-2/10",
        tone === "error" && "border-destructive/30 bg-destructive/10",
        className,
      )}
      {...props}
    >
      <Icon aria-hidden="true" className="size-4 shrink-0" />
      <span className="min-w-0 flex-1">{message}</span>
      {action && (
        <span data-slot="inline-alert-action" className="shrink-0">
          {action}
        </span>
      )}
    </div>
  )
}

export { InlineAlert, type InlineAlertProps }
