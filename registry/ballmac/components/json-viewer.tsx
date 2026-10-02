// Ballmac UI: JSON Viewer. https://ui.ballmac.com/components/json-viewer
"use client"

import * as React from "react"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"

type JsonViewerProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** JSON-compatible value to inspect. */
  value: unknown
  /** Accessible label for the data. */
  label?: string
  /** Number of levels open initially. */
  defaultExpandedDepth?: number
}

function JsonViewer({
  className,
  value,
  label,
  defaultExpandedDepth = 1,
  ...props
}: JsonViewerProps) {
  const msg = useMessages()
  label ??= msg("json-viewer.label", "JSON data")
  const [overrides, setOverrides] = React.useState<Record<string, boolean>>({})
  function renderNode(
    name: string | undefined,
    item: unknown,
    path: string,
    depth: number,
  ): React.ReactNode {
    const nested = item !== null && typeof item === "object"
    const entries = nested
      ? Object.entries(item as Record<string, unknown>)
      : []
    const expanded = overrides[path] ?? depth < defaultExpandedDepth
    const summary = Array.isArray(item)
      ? `[${entries.length}]`
      : `{${entries.length}}`
    return (
      <div key={path} data-slot="json-viewer-node" className="min-w-0">
        <div
          className="flex min-w-0 items-start gap-1 leading-6"
          style={{ paddingInlineStart: `${depth * 16}px` }}
        >
          {nested ? (
            <button
              type="button"
              data-slot="json-viewer-toggle"
              aria-label={expanded ? msg("json-viewer.collapse", "Collapse {name}", { name: name ?? msg("json-viewer.root", "root") }) : msg("json-viewer.expand", "Expand {name}", { name: name ?? msg("json-viewer.root", "root") })}
              aria-expanded={expanded}
              onClick={() =>
                setOverrides((current) => ({ ...current, [path]: !expanded }))
              }
              className="hover:bg-accent mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <ChevronRight
                aria-hidden="true"
                className={cn(
                  "size-3.5 transition-transform duration-150 motion-reduce:transition-none",
                  expanded ? "rotate-90" : "rtl:rotate-180",
                )}
              />
            </button>
          ) : (
            <span aria-hidden="true" className="size-5 shrink-0" />
          )}
          <span className="min-w-0 break-all">
            {name !== undefined && (
              <span className="text-muted-foreground">
                {JSON.stringify(name)}:{" "}
              </span>
            )}
            {nested ? (
              <span className="text-muted-foreground">{summary}</span>
            ) : (
              <span
                className={cn(
                  typeof item === "string"
                    ? "text-foreground"
                    : typeof item === "number" || typeof item === "boolean"
                      ? "text-primary"
                      : "text-muted-foreground",
                )}
              >
                {JSON.stringify(item) ?? "undefined"}
              </span>
            )}
          </span>
        </div>
        {nested && expanded && (
          <div data-slot="json-viewer-children">
            {entries.map(([key, child]) =>
              renderNode(
                key,
                child,
                `${path}.${JSON.stringify(key)}`,
                depth + 1,
              ),
            )}
          </div>
        )}
      </div>
    )
  }
  return (
    <div
      data-slot="json-viewer"
      dir="ltr"
      role="region"
      aria-label={label}
      tabIndex={0}
      className={cn(
        "bg-card max-h-72 min-w-0 max-w-full overflow-auto rounded-xl border border-border p-3 font-mono text-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        className,
      )}
      {...props}
    >
      {renderNode(undefined, value, "$", 0)}
    </div>
  )
}
export { JsonViewer, type JsonViewerProps }
