// Ballmac UI: Date Range Picker. https://ui.ballmac.com/components/date-range-picker
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"

type DateRange = {
  /** Inclusive start date in YYYY-MM-DD form. */ from: string
  /** Inclusive end date in YYYY-MM-DD form. */ to: string
}
type DateRangePreset = DateRange & {
  /** Button label for the preset. */ label: string
}
type DateRangePickerProps = Omit<
  React.ComponentProps<"fieldset">,
  "defaultValue" | "value" | "onChange"
> & {
  /** Visible and accessible group label. */
  label: string
  /** Controlled date range. */
  value?: DateRange
  /** Initial date range. */
  defaultValue?: DateRange
  /** Called when either endpoint or a preset changes. */
  onValueChange?: (range: DateRange) => void
  /** Quick selections shown below the inputs. */
  presets?: DateRangePreset[]
  /** Earliest selectable date. */
  min?: string
  /** Latest selectable date. */
  max?: string
  /** Disable both inputs and presets. */
  disabled?: boolean
  /** Optional form field prefix for the start and end dates. */
  name?: string
}
function DateRangePicker({
  className,
  label,
  value,
  defaultValue = { from: "", to: "" },
  onValueChange,
  presets = [],
  min,
  max,
  disabled = false,
  name,
  ...props
}: DateRangePickerProps) {
  const msg = useMessages()
  const [internal, setInternal] = React.useState(defaultValue)
  const current = value ?? internal
  function set(next: DateRange) {
    if (value === undefined) setInternal(next)
    onValueChange?.(next)
  }
  function clamp(date: string) {
    return date && min && date < min
      ? min
      : date && max && date > max
        ? max
        : date
  }
  function change(side: "from" | "to", date: string) {
    const next = { ...current, [side]: clamp(date) }
    if (next.from && next.to && next.from > next.to) {
      if (side === "from") next.to = next.from
      else next.from = next.to
    }
    set(next)
  }
  return (
    <fieldset
      data-slot="date-range-picker"
      disabled={disabled}
      className={cn(
        "bg-card flex min-w-0 flex-col gap-3 rounded-xl border border-border p-4",
        className,
      )}
      {...props}
    >
      <legend className="px-1 text-sm font-medium">{label}</legend>
      <div className="grid min-w-0 gap-3 sm:grid-cols-2">
        <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-muted-foreground">
          <span>{msg("date-range-picker.from", "From")}</span>
          <span>
            <input
              data-slot="date-range-from"
              type="date"
              name={name ? `${name}.from` : undefined}
              value={current.from}
              min={min}
              max={max}
              onChange={(event) => change("from", event.target.value)}
              disabled={disabled}
              className="border-input bg-background text-foreground h-9 w-full min-w-0 rounded-md border px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50"
            />
          </span>
        </label>
        <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-muted-foreground">
          <span>{msg("date-range-picker.to", "To")}</span>
          <span>
            <input
              data-slot="date-range-to"
              type="date"
              name={name ? `${name}.to` : undefined}
              value={current.to}
              min={min}
              max={max}
              onChange={(event) => change("to", event.target.value)}
              disabled={disabled}
              className="border-input bg-background text-foreground h-9 w-full min-w-0 rounded-md border px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50"
            />
          </span>
        </label>
      </div>
      {presets.length > 0 && (
        <div
          data-slot="date-range-presets"
          className="flex flex-wrap gap-2 border-t border-border pt-3"
        >
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              disabled={disabled}
              aria-pressed={
                current.from === clamp(preset.from) &&
                current.to === clamp(preset.to)
              }
              onClick={() =>
                set({ from: clamp(preset.from), to: clamp(preset.to) })
              }
              className="bg-secondary text-secondary-foreground hover:bg-accent h-8 rounded-full px-3 text-xs font-medium outline-none transition-colors duration-150 focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50 motion-reduce:transition-none"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </fieldset>
  )
}
export {
  DateRangePicker,
  type DateRangePickerProps,
  type DateRange,
  type DateRangePreset,
}
