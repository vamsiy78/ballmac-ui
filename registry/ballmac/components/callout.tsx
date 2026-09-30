// Ballmac UI: Callout. https://ui.ballmac.com/components/callout
import * as React from "react"
import { Lightbulb, BookOpen, TriangleAlert } from "lucide-react"
import { cn } from "@/lib/utils"

type CalloutProps = Omit<React.ComponentProps<"aside">, "title"> & {
  /** Headline for the guidance. */
  title: string
  /** Guidance type, represented by both icon and text. */
  kind?: "tip" | "note" | "caution"
  /** Optional action link or button. */
  action?: React.ReactNode
}

function Callout({
  className,
  title,
  kind = "tip",
  action,
  children,
  ...props
}: CalloutProps) {
  const Icon =
    kind === "tip" ? Lightbulb : kind === "caution" ? TriangleAlert : BookOpen
  return (
    <aside
      data-slot="callout"
      aria-label={title}
      className={cn(
        "bg-card relative w-full min-w-0 overflow-hidden rounded-xl border border-border p-5 shadow-sm",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-y-0 left-0 w-1",
          kind === "tip" && "bg-primary",
          kind === "note" && "bg-chart-2",
          kind === "caution" && "bg-chart-3",
        )}
      />
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="bg-muted text-foreground flex size-9 shrink-0 items-center justify-center rounded-lg"
        >
          <Icon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
            {kind}
          </p>
          <h3 className="text-foreground mt-0.5 text-sm font-semibold">
            {title}
          </h3>
          <div
            data-slot="callout-content"
            className="text-muted-foreground mt-1.5 text-sm leading-relaxed"
          >
            {children}
          </div>
          {action && (
            <div data-slot="callout-action" className="mt-3">
              {action}
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

export { Callout, type CalloutProps }
