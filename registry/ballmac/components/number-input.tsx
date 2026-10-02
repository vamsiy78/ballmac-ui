// Ballmac UI: Number Input. https://ui.ballmac.com/components/number-input
"use client"

import * as React from "react"
import { Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"

type NumberInputProps = Omit<
  React.ComponentProps<"div">,
  "onChange" | "defaultValue"
> & {
  /** Controlled numeric value. Null renders an empty field. */
  value?: number | null
  /** Initial value when uncontrolled. */
  defaultValue?: number | null
  /** Called when the number changes. */
  onValueChange?: (value: number | null) => void
  /** Lowest allowed value. */
  min?: number
  /** Highest allowed value. */
  max?: number
  /** Increment used by buttons and arrow keys. */
  step?: number
  /** Accessible name for the input. */
  label?: string
  /** Native form field name. */
  name?: string
  /** Disable input and buttons. */
  disabled?: boolean
}
function NumberInput({
  value,
  defaultValue = 0,
  onValueChange,
  min,
  max,
  step = 1,
  label,
  name,
  disabled = false,
  className,
  ...props
}: NumberInputProps) {
  const msg = useMessages()
  label ??= msg("number-input.label", "Number")
  const [internal, setInternal] = React.useState<number | null>(defaultValue)
  const current = value !== undefined ? value : internal
  const safeStep = Number.isFinite(step) && step > 0 ? step : 1
  function clamp(next: number) {
    return Math.min(
      max ?? Infinity,
      Math.max(min ?? -Infinity, Math.round(next * 1e8) / 1e8),
    )
  }
  function commit(next: number | null) {
    if (value === undefined) setInternal(next)
    onValueChange?.(next)
  }
  function change(delta: number) {
    commit(clamp((current ?? min ?? 0) + delta * safeStep))
  }
  return (
    <div
      data-slot="number-input"
      className={cn(
        "flex h-9 w-full min-w-0 items-center rounded-md border border-input bg-background shadow-xs transition-[border-color,box-shadow] duration-150 motion-reduce:transition-none focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
        className,
      )}
      {...props}
    >
      <button
        type="button"
        aria-label={msg("number-input.decrease", "Decrease {label}", { label })}
        disabled={
          disabled || (current != null && min != null && current <= min)
        }
        onClick={() => change(-1)}
        className="flex size-9 shrink-0 items-center justify-center rounded-s-md outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50"
      >
        <Minus aria-hidden="true" className="size-4" />
      </button>
      <input
        data-slot="number-input-field"
        type="number"
        inputMode="decimal"
        aria-label={label}
        name={name}
        min={min}
        max={max}
        step={safeStep}
        disabled={disabled}
        value={current ?? ""}
        onChange={(event) => {
          const next = event.currentTarget.value
          commit(next === "" ? null : Number(next))
        }}
        onBlur={() => {
          if (current != null) commit(clamp(current))
        }}
        className="h-full min-w-0 flex-1 appearance-none border-x border-input bg-transparent px-2 text-center text-sm tabular-nums text-foreground outline-none disabled:opacity-50 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        aria-label={msg("number-input.increase", "Increase {label}", { label })}
        disabled={
          disabled || (current != null && max != null && current >= max)
        }
        onClick={() => change(1)}
        className="flex size-9 shrink-0 items-center justify-center rounded-e-md outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50"
      >
        <Plus aria-hidden="true" className="size-4" />
      </button>
    </div>
  )
}
export { NumberInput, type NumberInputProps }
