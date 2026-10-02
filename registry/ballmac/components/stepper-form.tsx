// Ballmac UI: Stepper Form. https://ui.ballmac.com/components/stepper-form
"use client"

import * as React from "react"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"

type StepperStep = {
  /** Stable step ID. */
  id: string
  /** Short step title. */
  title: string
  /** Optional supporting detail. */
  description?: string
  /** Fields or content for this step. */
  content: React.ReactNode
  /** Return false to block moving forward. */
  validate?: () => boolean
}
type StepperFormProps = React.ComponentProps<"div"> & {
  /** Ordered steps in the flow. */
  steps: StepperStep[]
  /** Controlled zero-based step index. */
  value?: number
  /** Initial zero-based step index. */
  defaultValue?: number
  /** Called when the step changes. */
  onValueChange?: (index: number) => void
  /** Called after the last step is completed. */
  onComplete?: () => void
  /** Label for the final action. */
  completeLabel?: string
}
function StepperForm({
  className,
  steps,
  value,
  defaultValue = 0,
  onValueChange,
  onComplete,
  completeLabel,
  ...props
}: StepperFormProps) {
  const msg = useMessages()
  completeLabel ??= msg("stepper-form.completeLabel", "Complete")
  const [internal, setInternal] = React.useState(defaultValue)
  const [furthest, setFurthest] = React.useState(defaultValue)
  const [error, setError] = React.useState("")
  const current = Math.max(0, Math.min(steps.length - 1, value ?? internal))
  const step = steps[current]
  function change(index: number) {
    if (value === undefined) setInternal(index)
    setFurthest((previous) => Math.max(previous, index))
    setError("")
    onValueChange?.(index)
  }
  function next() {
    if (!step) return
    if (step.validate && !step.validate()) {
      setError("Complete this step before continuing.")
      return
    }
    if (current === steps.length - 1) onComplete?.()
    else change(current + 1)
  }
  if (!step) return null
  return (
    <div
      data-slot="stepper-form"
      className={cn(
        "bg-card min-w-0 rounded-xl border border-border p-5 shadow-sm",
        className,
      )}
      {...props}
    >
      <ol aria-label={msg("stepper-form.progress", "Progress")} className="flex items-start gap-1">
        {steps.map((item, index) => (
          <li key={item.id} className="flex min-w-0 flex-1 items-start gap-2">
            <button
              type="button"
              aria-current={index === current ? "step" : undefined}
              aria-label={index < current ? msg("stepper-form.stepCompleted", "{title}, step {n} of {total}, completed", { title: item.title, n: index + 1, total: steps.length }) : msg("stepper-form.stepLabel", "{title}, step {n} of {total}", { title: item.title, n: index + 1, total: steps.length })}
              disabled={index > furthest}
              onClick={() => change(index)}
              className={cn(
                "border-border bg-background text-muted-foreground flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold outline-none transition-colors duration-150 focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed motion-reduce:transition-none",
                index === current &&
                  "border-primary bg-primary text-primary-foreground",
                index < current && "border-primary text-primary",
              )}
            >
              {index < current ? (
                <Check aria-hidden="true" className="size-3.5" />
              ) : (
                index + 1
              )}
            </button>
            <span className="hidden min-w-0 pt-1 text-xs font-medium sm:block">
              {item.title}
            </span>
            {index < steps.length - 1 && (
              <span
                aria-hidden="true"
                className="bg-border mt-3 h-px min-w-2 flex-1"
              />
            )}
          </li>
        ))}
      </ol>
      <div className="mt-6 border-t border-border pt-5">
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
          {msg("stepper-form.stepOf", "Step {n} of {total}", { n: current + 1, total: steps.length })}
        </p>
        <h3 className="mt-1 text-lg font-semibold">{step.title}</h3>
        {step.description && (
          <p className="text-muted-foreground mt-1 text-sm">
            {step.description}
          </p>
        )}
        <div data-slot="stepper-form-content" className="mt-5">
          {step.content}
        </div>
        <p
          role="status"
          aria-live="polite"
          className={cn("text-destructive mt-3 text-xs", !error && "sr-only")}
        >
          {error || msg("stepper-form.ready", "Ready")}
        </p>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
        <button
          type="button"
          onClick={() => change(current - 1)}
          disabled={current === 0}
          className="text-muted-foreground hover:text-foreground inline-flex h-9 items-center gap-2 rounded-md px-2 text-sm font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-40"
        >
          <ArrowLeft aria-hidden="true" className="size-4 rtl:rotate-180" />
          {msg("stepper-form.back", "Back")}
        </button>
        <button
          type="button"
          onClick={next}
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center gap-2 rounded-md px-4 text-sm font-medium outline-none transition-colors duration-150 focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none"
        >
          {current === steps.length - 1 ? completeLabel : "Continue"}
          {current < steps.length - 1 && (
            <ArrowRight aria-hidden="true" className="size-4 rtl:rotate-180" />
          )}
        </button>
      </div>
    </div>
  )
}
export { StepperForm, type StepperFormProps, type StepperStep }
