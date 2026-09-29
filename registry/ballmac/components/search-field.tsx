// Ballmac UI: Search Field. https://ui.ballmac.com/components/search-field
"use client"

import * as React from "react"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

type SearchFieldProps = Omit<
  React.ComponentProps<"input">,
  "type" | "value" | "defaultValue" | "onChange"
> & {
  /** Controlled search query. */
  value?: string
  /** Initial query when uncontrolled. */
  defaultValue?: string
  /** Called whenever the query changes or clears. */
  onValueChange?: (value: string) => void
  /** Called when Enter submits the query. */
  onSearch?: (value: string) => void
  /** Accessible name of the search field. */
  label?: string
}
function SearchField({
  value,
  defaultValue = "",
  onValueChange,
  onSearch,
  label = "Search",
  className,
  disabled,
  onKeyDown,
  ...props
}: SearchFieldProps) {
  const [internal, setInternal] = React.useState(defaultValue)
  const current = value ?? internal
  const inputRef = React.useRef<HTMLInputElement>(null)
  function commit(next: string) {
    if (value === undefined) setInternal(next)
    onValueChange?.(next)
  }
  return (
    <div
      data-slot="search-field"
      className={cn(
        "flex h-9 w-full min-w-0 items-center gap-2 rounded-md border border-input bg-background px-3 shadow-xs transition-[border-color,box-shadow] duration-150 motion-reduce:transition-none focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
        className,
      )}
    >
      <Search
        aria-hidden="true"
        className="size-4 shrink-0 text-muted-foreground"
      />
      <input
        ref={inputRef}
        data-slot="search-field-input"
        type="search"
        aria-label={label}
        disabled={disabled}
        value={current}
        onChange={(event) => commit(event.currentTarget.value)}
        onKeyDown={(event) => {
          onKeyDown?.(event)
          if (!event.defaultPrevented && event.key === "Enter")
            onSearch?.(current)
        }}
        className="h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-50 [&::-webkit-search-cancel-button]:hidden"
        {...props}
      />
      {current && (
        <button
          type="button"
          aria-label="Clear search"
          disabled={disabled}
          onClick={() => {
            commit("")
            inputRef.current?.focus()
          }}
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      )}
    </div>
  )
}
export { SearchField, type SearchFieldProps }
