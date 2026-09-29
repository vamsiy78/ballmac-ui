// Ballmac UI: Multi Select. https://ui.ballmac.com/components/multi-select
"use client"

import * as React from "react"
import { Check, ChevronDown, Search } from "lucide-react"
import { Popover as PopoverPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"

type MultiSelectOption = { value: string; label: string; disabled?: boolean }
type MultiSelectProps = Omit<React.ComponentProps<"div">, "onChange"> & {
  /** Options available for selection. */
  options: MultiSelectOption[]
  /** Controlled selected values. */
  value?: string[]
  /** Initial values when uncontrolled. */
  defaultValue?: string[]
  /** Called with all selected values after a change. */
  onValueChange?: (value: string[]) => void
  /** Accessible name of the selector. */
  label?: string
  /** Placeholder when no option is selected. */
  placeholder?: string
  /** Maximum number of selections. */
  maxSelected?: number
  /** Disable the selector. */
  disabled?: boolean
  /** Name for repeated hidden form inputs. */
  name?: string
}
function MultiSelect({
  options,
  value,
  defaultValue = [],
  onValueChange,
  label = "Select options",
  placeholder = "Choose options",
  maxSelected = Number.POSITIVE_INFINITY,
  disabled = false,
  name,
  className,
  ...props
}: MultiSelectProps) {
  const [internal, setInternal] = React.useState(defaultValue)
  const [query, setQuery] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const selected = value ?? internal
  const id = React.useId()
  const filtered = options.filter((option) =>
    option.label
      .toLocaleLowerCase("en-US")
      .includes(query.toLocaleLowerCase("en-US")),
  )
  function commit(next: string[]) {
    if (value === undefined) setInternal(next)
    onValueChange?.(next)
  }
  function toggle(item: string) {
    if (selected.includes(item))
      commit(selected.filter((value) => value !== item))
    else if (selected.length < maxSelected) commit([...selected, item])
  }
  return (
    <div
      data-slot="multi-select"
      className={cn("w-full min-w-0", className)}
      {...props}
    >
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        <PopoverPrimitive.Trigger
          data-slot="multi-select-trigger"
          disabled={disabled}
          aria-label={label}
          className="flex min-h-9 w-full min-w-0 items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-left text-sm shadow-xs outline-none transition-[border-color,box-shadow] duration-150 motion-reduce:transition-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50"
        >
          {selected.length ? (
            <span className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
              {selected.slice(0, 2).map((item) => (
                <span
                  key={item}
                  className="max-w-24 shrink-0 truncate rounded bg-secondary px-1.5 py-0.5 text-xs text-secondary-foreground"
                >
                  {options.find((option) => option.value === item)?.label ?? item}
                </span>
              ))}
              {selected.length > 2 && (
                <span className="shrink-0 text-xs text-muted-foreground">
                  +{selected.length - 2}
                </span>
              )}
            </span>
          ) : (
            <span className="min-w-0 truncate text-muted-foreground">
              {placeholder}
            </span>
          )}
          <ChevronDown
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground"
          />
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            data-slot="multi-select-content"
            align="start"
            sideOffset={5}
            className="z-50 w-[min(var(--radix-popover-trigger-width),calc(100vw-2rem))] rounded-xl border bg-popover p-2 text-popover-foreground shadow-lg outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 motion-reduce:animate-none"
          >
            <div className="flex items-center gap-2 rounded-md border border-input px-2 focus-within:ring-[3px] focus-within:ring-ring/50">
              <Search
                aria-hidden="true"
                className="size-4 text-muted-foreground"
              />
              <input
                data-slot="multi-select-search"
                aria-label="Search options"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-9 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                placeholder="Search options…"
              />
            </div>
            <div
              role="group"
              aria-label={label}
              tabIndex={0}
              className="mt-1 max-h-56 overflow-y-auto outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              {filtered.length ? (
                filtered.map((option) => {
                  const checked = selected.includes(option.value)
                  return (
                    <label
                      key={option.value}
                      className={cn(
                        "flex min-h-9 cursor-pointer items-center gap-2 rounded-md px-2 text-sm hover:bg-accent",
                        (option.disabled ||
                          (!checked && selected.length >= maxSelected)) &&
                          "cursor-not-allowed opacity-50",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={
                          option.disabled ||
                          (!checked && selected.length >= maxSelected)
                        }
                        onChange={() => toggle(option.value)}
                        className="sr-only peer"
                      />
                      <span
                        aria-hidden="true"
                        className="flex size-4 items-center justify-center rounded border border-input peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/50"
                      >
                        <Check className={cn("size-3", !checked && "hidden")} />
                      </span>
                      <span className="min-w-0 flex-1 truncate">
                        {option.label}
                      </span>
                    </label>
                  )
                })
              ) : (
                <p className="px-2 py-4 text-center text-sm text-muted-foreground">
                  No matching options
                </p>
              )}
            </div>
            <p id={id} className="mt-1 px-2 text-xs text-muted-foreground">
              {selected.length} selected
              {Number.isFinite(maxSelected) ? ` of ${maxSelected}` : ""}
            </p>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
      {name &&
        selected.map((item) => (
          <input key={item} type="hidden" name={name} value={item} />
        ))}
    </div>
  )
}
export { MultiSelect, type MultiSelectProps, type MultiSelectOption }
