// Ballmac UI: Color Picker. https://ui.ballmac.com/components/color-picker
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type ColorPickerProps = Omit<
  React.ComponentProps<"div">,
  "onChange" | "defaultValue"
> & {
  /** Controlled six-digit hexadecimal color. */
  value?: string
  /** Initial color when uncontrolled. */
  defaultValue?: string
  /** Called when either control edits the color. */
  onValueChange?: (value: string) => void
  /** Accessible name of the picker. */
  label?: string
  /** Native form field name. */
  name?: string
  /** Disable editing. */
  disabled?: boolean
}
function ColorPicker({
  value,
  defaultValue = "",
  onValueChange,
  label = "Color",
  name,
  disabled = false,
  className,
  ...props
}: ColorPickerProps) {
  const [internal, setInternal] = React.useState(defaultValue)
  const current = value ?? internal
  const valid = /^#[0-9a-fA-F]{6}$/.test(current)
  function commit(next: string) {
    if (value === undefined) setInternal(next)
    onValueChange?.(next)
  }
  return (
    <div
      data-slot="color-picker"
      className={cn(
        "flex h-10 w-full min-w-0 items-center gap-2 rounded-md border border-input bg-background px-2 shadow-xs transition-[border-color,box-shadow] duration-150 motion-reduce:transition-none focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
        className,
      )}
      {...props}
    >
      <input
        data-slot="color-picker-native"
        type="color"
        aria-label={`Choose ${label.toLowerCase()}`}
        disabled={disabled}
        value={current}
        onChange={(event) => commit(event.currentTarget.value)}
        className="size-7 shrink-0 cursor-pointer rounded border border-border bg-transparent p-0.5 disabled:opacity-50"
      />
      <input
        data-slot="color-picker-text"
        type="text"
        aria-label={`${label} hex value`}
        aria-invalid={current && !valid ? true : undefined}
        name={name}
        disabled={disabled}
        value={current}
        onChange={(event) => commit(event.currentTarget.value)}
        placeholder="Hex color"
        maxLength={7}
        spellCheck={false}
        className="min-w-0 flex-1 bg-transparent font-mono text-sm text-foreground outline-none placeholder:font-sans placeholder:text-muted-foreground disabled:opacity-50"
      />
      <span
        aria-hidden="true"
        className="size-6 shrink-0 rounded-md border border-border"
        style={{ backgroundColor: valid ? current : "var(--muted)" }}
      />
    </div>
  )
}
export { ColorPicker, type ColorPickerProps }
