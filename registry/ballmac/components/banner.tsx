// Ballmac UI: Banner. https://ui.ballmac.com/components/banner
"use client"

import * as React from "react"
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react"
import { cn } from "@/lib/utils"

type BannerProps = Omit<React.ComponentProps<"section">, "title"> & {
  /** Short headline that names the announcement. */
  title: string
  /** Supporting detail, kept concise for a page-wide banner. */
  description?: React.ReactNode
  /** Semantic tone of the announcement. */
  tone?: "info" | "success" | "warning"
  /** Optional link or button placed after the message. */
  action?: React.ReactNode
  /** Show a dismiss button. */
  dismissible?: boolean
  /** Controlled visibility. */
  visible?: boolean
  /** Initial visibility when uncontrolled. */
  defaultVisible?: boolean
  /** Called when visibility changes. */
  onVisibleChange?: (visible: boolean) => void
}

function Banner({
  className,
  title,
  description,
  tone = "info",
  action,
  dismissible = false,
  visible,
  defaultVisible = true,
  onVisibleChange,
  ...props
}: BannerProps) {
  const [internalVisible, setInternalVisible] = React.useState(defaultVisible)
  const shown = visible ?? internalVisible
  if (!shown) return null
  const Icon =
    tone === "success"
      ? CheckCircle2
      : tone === "warning"
        ? TriangleAlert
        : Info
  function dismiss() {
    if (visible === undefined) setInternalVisible(false)
    onVisibleChange?.(false)
  }
  return (
    <section
      data-slot="banner"
      aria-label={title}
      className={cn(
        "grid w-full min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-3 gap-y-2 rounded-xl border px-4 py-3 text-sm shadow-sm sm:flex sm:flex-wrap sm:items-center",
        tone === "info" && "border-primary/25 bg-primary/5",
        tone === "success" && "border-chart-2/30 bg-chart-2/10",
        tone === "warning" && "border-chart-3/30 bg-chart-3/10",
        className,
      )}
      {...props}
    >
      <Icon aria-hidden="true" className="text-foreground col-start-1 row-start-1 mt-0.5 size-4 shrink-0 sm:mt-0" />
      <div className="col-start-2 row-start-1 min-w-0 flex-1 leading-5">
        <strong className="font-semibold">{title}</strong>
        {description && (
          <span className="text-muted-foreground block sm:ml-1.5 sm:inline">{description}</span>
        )}
      </div>
      {action && (
        <div data-slot="banner-action" className="col-start-2 row-start-2 shrink-0">
          {action}
        </div>
      )}
      {dismissible && (
        <button
          type="button"
          aria-label={`Dismiss ${title}`}
          onClick={dismiss}
          className="text-muted-foreground hover:bg-accent hover:text-foreground col-start-3 row-start-1 flex size-8 shrink-0 items-center justify-center rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      )}
    </section>
  )
}

export { Banner, type BannerProps }
