// Ballmac UI: Status Dot. https://ui.ballmac.com/components/status-dot
import * as React from "react"
import { cn } from "@/lib/utils"

type StatusDotProps = React.ComponentProps<"span"> & {
  /** Visible status text; color is never the only cue. */
  label: string
  /** Semantic status tone. */
  status?: "online" | "busy" | "away" | "offline"
  /** Gently pulse active statuses; stops for reduced motion. */
  pulse?: boolean
  /** Announce a changed status to assistive technology. */
  announce?: boolean
}

function StatusDot({
  className,
  label,
  status = "online",
  pulse = false,
  announce = false,
  ...props
}: StatusDotProps) {
  return (
    <span
      data-slot="status-dot"
      role={announce ? "status" : undefined}
      className={cn(
        "text-foreground inline-flex min-w-0 items-center gap-2 text-sm",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          "relative size-2.5 shrink-0 rounded-full",
          status === "online" && "bg-chart-2",
          status === "busy" && "bg-destructive",
          status === "away" && "bg-chart-3",
          status === "offline" && "bg-muted-foreground",
          pulse &&
            status !== "offline" &&
            "after:absolute after:inset-0 after:animate-ping after:rounded-full after:bg-inherit after:opacity-20 motion-reduce:after:animate-none",
        )}
      />
      <span className="truncate">{label}</span>
    </span>
  )
}

export { StatusDot, type StatusDotProps }
