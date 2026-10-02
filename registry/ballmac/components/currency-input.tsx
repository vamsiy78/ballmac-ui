// Ballmac UI: Currency Input. https://ui.ballmac.com/components/currency-input
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useLocale } from "@/lib/ballmac/i18n"

type CurrencyInputProps = Omit<
  React.ComponentProps<"input">,
  "value" | "defaultValue" | "onChange" | "type"
> & {
  /** Visible and accessible input label. */
  label: string
  /** ISO 4217 currency code. */
  currency?: string
  /** Fixed locale for formatting and parsing. */
  locale?: string
  /** Controlled numeric amount, or null when empty. */
  value?: number | null
  /** Initial numeric amount. */
  defaultValue?: number | null
  /** Called with the parsed numeric amount while editing. */
  onValueChange?: (value: number | null) => void
  /** Smallest allowed amount. */
  min?: number
  /** Largest allowed amount. */
  max?: number
}
function CurrencyInput({
  className,
  label,
  currency = "USD",
  locale,
  value,
  defaultValue = null,
  onValueChange,
  min,
  max,
  onFocus,
  onBlur,
  ...props
}: CurrencyInputProps) {
  const defaultLocale = useLocale()
  locale ??= defaultLocale
  const [internal, setInternal] = React.useState<number | null>(defaultValue)
  const [editing, setEditing] = React.useState(false)
  const [draft, setDraft] = React.useState("")
  const current = value === undefined ? internal : value
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  })
  const decimal =
    formatter.formatToParts(1.1).find((part) => part.type === "decimal")
      ?.value ?? "."
  const group =
    formatter.formatToParts(1000).find((part) => part.type === "group")
      ?.value ?? ","
  const digits = formatter.resolvedOptions().maximumFractionDigits
  const shown = editing
    ? draft
    : current === null
      ? ""
      : formatter.format(current)
  function report(next: number | null) {
    if (value === undefined) setInternal(next)
    onValueChange?.(next)
  }
  function parse(raw: string) {
    const compact = raw
      .replaceAll(group, "")
      .replaceAll(decimal, ".")
      .replace(/[^\d.\-]/g, "")
    if (!compact || compact === "-" || compact === "." || compact === "-.")
      return null
    const parsed = Number(compact)
    return Number.isFinite(parsed) ? parsed : null
  }
  return (
    <label data-slot="currency-input" className="flex min-w-0 flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      <span className="relative">
        <input
          {...props}
          type="text"
          inputMode="decimal"
          aria-label={label}
          value={shown}
          onFocus={(event) => {
            setEditing(true)
            setDraft(
              current === null ? "" : String(current).replace(".", decimal),
            )
            onFocus?.(event)
          }}
          onChange={(event) => {
            const raw = event.target.value
            setDraft(raw)
            if (raw.trim() === "") report(null)
            else {
              const parsed = parse(raw)
              if (parsed !== null) report(parsed)
            }
          }}
          onBlur={(event) => {
            setEditing(false)
            const parsed = parse(draft)
            if (parsed !== null) {
              const bounded = Math.min(
                max ?? Infinity,
                Math.max(min ?? -Infinity, parsed),
              )
              const rounded = Number(bounded.toFixed(digits))
              if (rounded !== current) report(rounded)
            }
            onBlur?.(event)
          }}
          className={cn(
            "border-input bg-background text-foreground h-9 w-full min-w-0 rounded-md border px-3 pe-14 text-sm tabular-nums outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20",
            className,
          )}
        />
        <span
          aria-hidden="true"
          className="text-muted-foreground pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-xs font-medium"
        >
          {currency}
        </span>
      </span>
    </label>
  )
}
export { CurrencyInput, type CurrencyInputProps }
