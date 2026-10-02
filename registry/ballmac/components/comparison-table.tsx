// Ballmac UI: Comparison Table. https://ui.ballmac.com/components/comparison-table
"use client"

import * as React from "react"
import { Check, Minus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"

type ComparisonColumn = {
  /** Stable key. */ key: string
  /** Display heading. */ title: string
  /** Optional short description. */ description?: string
  /** Highlight as the recommended choice. */ featured?: boolean
}
type ComparisonRow = {
  /** Feature name. */ label: string
  /** Optional extra context. */ description?: string
  /** Values keyed by column. Booleans render as available/unavailable. */ values: Record<
    string,
    React.ReactNode | boolean
  >
}
type ComparisonTableProps = React.ComponentProps<"div"> & {
  /** Accessible table caption. */ caption: string
  /** Compared choices. */ columns: ComparisonColumn[]
  /** Features or criteria. */ rows: ComparisonRow[]
}
function ComparisonTable({
  className,
  caption,
  columns,
  rows,
  ...props
}: ComparisonTableProps) {
  const msg = useMessages()
  return (
    <div
      data-slot="comparison-table"
      className={cn(
        "relative w-full max-w-full overflow-x-auto rounded-xl border border-border",
        className,
      )}
      tabIndex={0}
      role="region"
      aria-label={caption}
      {...props}
    >
      <table className="w-full min-w-full border-collapse text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="bg-muted/50">
            <th
              scope="col"
              className="text-muted-foreground min-w-28 p-3 text-start font-medium sm:p-4"
            >
              {msg("comparison-table.feature", "Feature")}
            </th>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  "min-w-24 p-3 text-center font-semibold sm:p-4",
                  column.featured && "bg-primary/5 text-primary",
                )}
              >
                {column.title}
                {column.description && (
                  <span className="text-muted-foreground mt-1 block text-xs font-normal">
                    {column.description}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-t border-border">
              <th scope="row" className="p-3 text-start font-medium sm:p-4">
                {row.label}
                {row.description && (
                  <span className="text-muted-foreground mt-1 block text-xs font-normal">
                    {row.description}
                  </span>
                )}
              </th>
              {columns.map((column) => {
                const value = row.values[column.key]
                return (
                  <td
                    key={column.key}
                    className={cn(
                      "p-3 text-center sm:p-4",
                      column.featured && "bg-primary/5",
                    )}
                  >
                    {typeof value === "boolean" ? (
                      <span role="img" aria-label={value ? msg("comparison-table.available", "Available") : msg("comparison-table.unavailable", "Unavailable")} className="inline-flex items-center justify-center gap-1">
                        {value ? (
                          <Check
                            aria-hidden="true"
                            className="text-primary size-4"
                          />
                        ) : (
                          <X
                            aria-hidden="true"
                            className="text-muted-foreground size-4"
                          />
                        )}
                      </span>
                    ) : (
                      (value ?? (
                        <Minus
                          aria-label={msg("comparison-table.notSpecified", "Not specified")}
                          className="text-muted-foreground mx-auto size-4"
                        />
                      ))
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
export {
  ComparisonTable,
  type ComparisonTableProps,
  type ComparisonColumn,
  type ComparisonRow,
}
