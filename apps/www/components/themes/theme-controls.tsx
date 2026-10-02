"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/** A labelled native range input with a custom track. Native, so arrow keys, Home, End and screen readers just work. */
export function RangeField({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
  valueText,
  track,
  hint,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
  display: string
  valueText?: string
  track?: string
  hint?: string
}) {
  const id = React.useId()
  return (
    <div className="grid gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <output htmlFor={id} className="text-muted-foreground font-mono text-xs tabular-nums">
          {display}
        </output>
      </div>
      <input
        id={id}
        type="range"
        className="bm-range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={valueText ?? display}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onChange={(e) => onChange(Number(e.currentTarget.value))}
        style={track ? ({ "--bm-range-track": track } as React.CSSProperties) : undefined}
      />
      {hint && (
        <p id={`${id}-hint`} className="text-muted-foreground text-xs">
          {hint}
        </p>
      )}
    </div>
  )
}

/** A titled group inside the controls panel. */
export function Group({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <fieldset className={cn("grid min-w-0 gap-4 border-0 p-0", className)}>
      <legend className="text-muted-foreground float-left mb-3 w-full text-xs font-medium tracking-wide uppercase">{title}</legend>
      <div className="clear-both grid gap-4">{children}</div>
    </fieldset>
  )
}

/** A label above a control, linked for screen readers. */
export function Row({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  const id = React.useId()
  return (
    <div className="grid gap-1.5" role="group" aria-labelledby={id}>
      <span id={id} className="text-sm font-medium">
        {label}
      </span>
      {children}
      {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
    </div>
  )
}
