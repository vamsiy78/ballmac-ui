// Ballmac UI: Native Select. https://ui.ballmac.com/components/native-select
// Based on shadcn/ui's Input (MIT, Copyright (c) 2023 shadcn) for the look, wrapped around the browser's own select.
"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { ChevronDown, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const selectVariants = cva(
  "peer w-full min-w-0 appearance-none rounded-md border border-input bg-background text-foreground shadow-xs outline-none transition-[color,border-color,box-shadow] duration-150 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 motion-reduce:transition-none",
  {
    variants: {
      size: {
        sm: "h-[var(--bm-control-h-sm,calc(var(--spacing)*8))] ps-2.5 text-[13px]",
        default: "h-[var(--bm-control-h,calc(var(--spacing)*9))] ps-3 text-sm",
        lg: "h-[var(--bm-control-h-lg,calc(var(--spacing)*11))] ps-4 text-[15px]",
      },
      // a list box has no arrow, so it needs no room for one
      listbox: {
        false: "cursor-pointer pe-9",
        true: "h-auto py-1 pe-2",
      },
    },
    defaultVariants: { size: "default", listbox: false },
  }
)

type NativeSelectProps = Omit<React.ComponentProps<"select">, "size"> &
  Pick<VariantProps<typeof selectVariants>, "size"> & {
    /** Called with the chosen value, as well as the usual `onChange`. */
    onValueChange?: (value: string) => void
    /** Drawn before the text, such as an icon. Keep it decorative. */
    startIcon?: React.ReactNode
    /** Shows a spinner in place of the arrow and marks the field busy, while the options load. The field stays usable. */
    loading?: boolean
    /** Text of a first, empty choice that asks for a selection. It is not offered once something is chosen. */
    placeholder?: string
    /** Lines to show for a `multiple` select. */
    rows?: number
  }

/**
 * The browser's own select, dressed to match the rest of the form. Because it is the real element, it keeps what people expect: the phone's picker,
 * type to jump, form submission, autofill and every screen reader. It takes the same sizes and states as the input.
 */
function NativeSelect({ className, size = "default", onValueChange, onChange, startIcon, loading = false, placeholder, rows, multiple, children, defaultValue, value, style, ...props }: NativeSelectProps) {
  const listbox = !!multiple
  // with a placeholder, an untouched select starts on it
  const initial = value === undefined && defaultValue === undefined && placeholder ? "" : defaultValue
  return (
    <div data-slot="native-select" data-size={size} className={cn("relative w-full min-w-0", className)}>
      {startIcon && !listbox ? (
        <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-muted-foreground peer-disabled:opacity-50 [&_svg]:size-4">
          {startIcon}
        </span>
      ) : null}
      <select
        data-slot="native-select-field"
        multiple={multiple}
        size={listbox ? (rows ?? 4) : undefined}
        aria-busy={loading || undefined}
        value={value}
        defaultValue={initial}
        onChange={(e) => {
          onChange?.(e)
          onValueChange?.(multiple ? Array.from(e.target.selectedOptions, (o) => o.value).join(",") : e.target.value)
        }}
        className={cn(selectVariants({ size, listbox }), startIcon && !listbox && "ps-9", "invalid:text-muted-foreground [&:has(option[value='']:checked)]:text-muted-foreground")}
        style={style}
        {...props}
      >
        {placeholder ? (
          <option value="" disabled={props.required}>
            {placeholder}
          </option>
        ) : null}
        {children}
      </select>
      {!listbox ? (
        <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-muted-foreground peer-disabled:opacity-50">
          {loading ? <Loader2 className="size-4 animate-spin motion-reduce:animate-none" /> : <ChevronDown className="size-4" />}
        </span>
      ) : null}
    </div>
  )
}

/** One choice. The browser draws it, so only what a native option can do applies: text, a value and `disabled`. */
function NativeSelectOption({ className, ...props }: React.ComponentProps<"option">) {
  return <option data-slot="native-select-option" className={cn("bg-popover text-popover-foreground", className)} {...props} />
}

/** A heading over a set of choices. */
function NativeSelectGroup({ className, ...props }: React.ComponentProps<"optgroup">) {
  return <optgroup data-slot="native-select-group" className={cn("bg-popover font-medium text-muted-foreground", className)} {...props} />
}

export { NativeSelect, NativeSelectGroup, NativeSelectOption, selectVariants, type NativeSelectProps }
