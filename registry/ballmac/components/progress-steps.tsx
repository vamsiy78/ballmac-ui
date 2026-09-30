// Ballmac UI: Progress Steps. https://ui.ballmac.com/components/progress-steps
"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

type ProgressStep = {
  /** Stable step ID. */ id: string
  /** Visible step label. */ label: string
  /** Optional short description. */ description?: string
}
type ProgressStepsProps = Omit<React.ComponentProps<"ol">, "children"> & {
  /** Ordered steps in the process. */
  steps: ProgressStep[]
  /** Controlled active step index. */
  activeIndex?: number
  /** Initially active step index. */
  defaultActiveIndex?: number
  /** Called when a navigable step is selected. */
  onActiveIndexChange?: (index: number) => void
  /** Allow returning to completed steps with a button. */
  navigable?: boolean
  /** Accessible name for the sequence. */
  label?: string
}

function ProgressSteps({
  className,
  steps,
  activeIndex,
  defaultActiveIndex = 0,
  onActiveIndexChange,
  navigable = false,
  label = "Progress",
  ...props
}: ProgressStepsProps) {
  const [internal, setInternal] = React.useState(defaultActiveIndex)
  const active = Math.max(
    0,
    Math.min(steps.length - 1, activeIndex ?? internal),
  )
  function choose(index: number) {
    if (activeIndex === undefined) setInternal(index)
    onActiveIndexChange?.(index)
  }
  return (
    <ol
      data-slot="progress-steps"
      aria-label={label}
      className={cn("grid w-full min-w-0 gap-2", className)}
      {...props}
    >
      {steps.map((step, index) => {
        const complete = index < active
        const current = index === active
        const content = (
          <>
            <span
              aria-hidden="true"
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold tabular-nums",
                complete && "border-primary bg-primary text-primary-foreground",
                current && "border-primary text-primary",
                !complete &&
                  !current &&
                  "border-border bg-muted text-muted-foreground",
              )}
            >
              {complete ? <Check className="size-3.5" /> : index + 1}
            </span>
            <span className="min-w-0 text-left">
              <span
                className={cn(
                  "block text-sm font-medium",
                  !complete && !current && "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
              {step.description && (
                <span className="text-muted-foreground block text-xs">
                  {step.description}
                </span>
              )}
            </span>
          </>
        )
        return (
          <li
            key={step.id}
            data-slot="progress-steps-item"
            className="relative min-w-0 pb-2 before:absolute before:top-8 before:bottom-0 before:left-3.5 before:w-px before:bg-border last:pb-0 last:before:hidden"
          >
            {navigable && complete ? (
              <button
                type="button"
                aria-label={`Return to ${step.label}`}
                onClick={() => choose(index)}
                className="hover:bg-accent relative flex min-h-9 w-full items-center gap-3 rounded-md px-1 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {content}
              </button>
            ) : (
              <div
                aria-current={current ? "step" : undefined}
                className="relative flex min-h-9 items-center gap-3 px-1"
              >
                {content}
              </div>
            )}
          </li>
        )
      })}
    </ol>
  )
}

export { ProgressSteps, type ProgressStepsProps, type ProgressStep }
