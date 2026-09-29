// Ballmac UI: Rating. https://ui.ballmac.com/components/rating
"use client"

import * as React from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

type RatingProps = Omit<
  React.ComponentProps<"fieldset">,
  "onChange" | "defaultValue"
> & {
  /** Controlled rating. Zero means unrated. */
  value?: number
  /** Initial rating when uncontrolled. */
  defaultValue?: number
  /** Called when the rating changes. */
  onValueChange?: (value: number) => void
  /** Highest rating. */
  max?: number
  /** Visible and accessible label. */
  label?: string
  /** Native radio group name. */
  name?: string
  /** Show the current value beside the stars. */
  showValue?: boolean
  /** Disable changes while keeping the rating visible. */
  readOnly?: boolean
}
function Rating({
  value,
  defaultValue = 0,
  onValueChange,
  max = 5,
  label = "Rating",
  name,
  showValue = true,
  readOnly = false,
  disabled = false,
  className,
  ...props
}: RatingProps) {
  const [internal, setInternal] = React.useState(defaultValue)
  const [hovered, setHovered] = React.useState(0)
  const current = value ?? internal
  const groupName = name ?? React.useId()
  const count = Math.max(1, Math.min(10, Math.floor(max)))
  function commit(next: number) {
    if (value === undefined) setInternal(next)
    onValueChange?.(next)
  }
  return (
    <fieldset
      data-slot="rating"
      disabled={disabled}
      className={cn("min-w-0", className)}
      {...props}
    >
      <legend className="mb-1.5 text-sm font-medium">{label}</legend>
      <div
        className="flex flex-wrap items-center gap-1"
        onMouseLeave={() => setHovered(0)}
      >
        {Array.from({ length: count }, (_, index) => index + 1).map(
          (number) => (
            <label
              key={number}
              data-slot="rating-item"
              className={cn(
                "relative flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 motion-reduce:transition-none",
                !readOnly && !disabled && "cursor-pointer hover:bg-accent",
                (hovered || current) >= number && "text-chart-3",
                readOnly && "pointer-events-none",
              )}
              onMouseEnter={() => setHovered(readOnly ? 0 : number)}
            >
              <input
                type="radio"
                name={groupName}
                value={number}
                checked={current === number}
                disabled={disabled || readOnly}
                aria-label={`${number} of ${count} stars`}
                onChange={() => {
                  if (!readOnly) commit(number)
                }}
                className="peer sr-only"
              />
              <Star
                aria-hidden="true"
                className={cn(
                  "size-5 peer-focus-visible:drop-shadow-md",
                  (hovered || current) >= number && "fill-current",
                )}
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-md peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/50"
              />
            </label>
          ),
        )}
        {showValue && (
          <span
            data-slot="rating-value"
            className="ml-2 text-sm text-muted-foreground tabular-nums"
          >
            {current ? `${current} / ${count}` : "Not rated"}
          </span>
        )}
        {!readOnly && current > 0 && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => commit(0)}
            className="ml-1 rounded-md px-2 py-1 text-xs text-muted-foreground outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50"
          >
            Clear
          </button>
        )}
      </div>
    </fieldset>
  )
}
export { Rating, type RatingProps }
