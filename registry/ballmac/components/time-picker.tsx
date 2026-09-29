// Ballmac UI: Time Picker. https://ui.ballmac.com/components/time-picker
"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

type TimePreset = { label: string; value: string }
type TimePickerProps = Omit<
  React.ComponentProps<"input">,
  "type" | "value" | "defaultValue" | "onChange"
> & {
  /** Controlled time in HH:mm format. */
  value?: string
  /** Initial time when uncontrolled. */
  defaultValue?: string
  /** Called with the new HH:mm time. */
  onValueChange?: (value: string) => void
  /** Accessible name of the time field. */
  label?: string
  /** Optional shortcuts to common times. */
  presets?: TimePreset[]
}
function TimePicker({
  value,
  defaultValue = "",
  onValueChange,
  label = "Time",
  presets = [],
  className,
  disabled,
  ...props
}: TimePickerProps) {
  const [internal, setInternal] = React.useState(defaultValue)
  const current = value ?? internal
  function commit(next: string) {
    if (value === undefined) setInternal(next)
    onValueChange?.(next)
  }
  return (
    <div data-slot="time-picker" className={cn("w-full min-w-0", className)}>
      <div className="flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 shadow-xs transition-[border-color,box-shadow] duration-150 motion-reduce:transition-none focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
        <Clock
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground"
        />
        <input
          data-slot="time-picker-input"
          type="time"
          aria-label={label}
          disabled={disabled}
          value={current}
          onChange={(event) => commit(event.currentTarget.value)}
          className="h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none disabled:opacity-50"
          {...props}
        />
      </div>
      {presets.length > 0 && (
        <div
          data-slot="time-picker-presets"
          className="mt-2 flex flex-wrap gap-1.5"
        >
          {presets.map((preset) => (
            <button
              key={preset.value}
              type="button"
              disabled={disabled}
              onClick={() => commit(preset.value)}
              className={cn(
                "rounded-md border border-border px-2.5 py-1 text-xs outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50",
                current === preset.value && "border-ring bg-accent font-medium",
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
export { TimePicker, type TimePickerProps, type TimePreset }
