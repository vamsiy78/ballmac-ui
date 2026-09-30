// Ballmac UI: Diff Viewer. https://ui.ballmac.com/components/diff-viewer
import * as React from "react"
import { cn } from "@/lib/utils"

type DiffViewerProps = React.ComponentProps<"div"> & {
  /** Original text. */
  before: string
  /** Updated text. */
  after: string
  /** Accessible name, usually a filename. */
  label: string
  /** Show line numbers in the gutter. */
  lineNumbers?: boolean
}
type DiffLine = {
  kind: "same" | "added" | "removed"
  text: string
  before?: number
  after?: number
}
function compare(before: string, after: string): DiffLine[] {
  const oldLines = before.split("\n")
  const newLines = after.split("\n")
  const table = Array.from(
    { length: oldLines.length + 1 },
    () => new Uint32Array(newLines.length + 1),
  )
  for (let i = oldLines.length - 1; i >= 0; i--)
    for (let j = newLines.length - 1; j >= 0; j--)
      table[i][j] =
        oldLines[i] === newLines[j]
          ? 1 + table[i + 1][j + 1]
          : Math.max(table[i + 1][j], table[i][j + 1])
  const result: DiffLine[] = []
  let i = 0,
    j = 0
  while (i < oldLines.length || j < newLines.length) {
    if (
      i < oldLines.length &&
      j < newLines.length &&
      oldLines[i] === newLines[j]
    ) {
      result.push({ kind: "same", text: oldLines[i], before: ++i, after: ++j })
      continue
    }
    if (
      i < oldLines.length &&
      (j >= newLines.length || table[i + 1][j] >= table[i][j + 1])
    ) {
      result.push({ kind: "removed", text: oldLines[i], before: ++i })
      continue
    }
    result.push({ kind: "added", text: newLines[j], after: ++j })
  }
  return result
}
function DiffViewer({
  className,
  before,
  after,
  label,
  lineNumbers = true,
  ...props
}: DiffViewerProps) {
  const lines = compare(before, after)
  const added = lines.filter((line) => line.kind === "added").length
  const removed = lines.filter((line) => line.kind === "removed").length
  return (
    <div
      data-slot="diff-viewer"
      role="region"
      aria-label={`${label} diff`}
      tabIndex={0}
      className={cn(
        "bg-card min-w-0 max-w-full overflow-auto rounded-xl border border-border outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        className,
      )}
      {...props}
    >
      <div
        data-slot="diff-viewer-header"
        className="flex min-w-max items-center justify-between gap-4 border-b border-border px-4 py-2 text-xs"
      >
        <span className="truncate font-mono font-medium">{label}</span>
        <span className="text-muted-foreground shrink-0 tabular-nums">
          {added} added · {removed} removed
        </span>
      </div>
      <div className="min-w-max py-2 font-mono text-xs leading-6">
        {lines.map((line, index) => (
          <div
            key={index}
            data-slot="diff-viewer-line"
            data-kind={line.kind}
            className={cn(
              "relative flex min-h-6 pr-4",
              line.kind === "added" && "bg-primary/10",
              line.kind === "removed" && "bg-destructive/10",
            )}
          >
            <span
              aria-hidden="true"
              className="text-muted-foreground w-10 shrink-0 select-none pr-2 text-right tabular-nums"
            >
              {lineNumbers ? (line.after ?? line.before) : ""}
            </span>
            <span
              aria-hidden="true"
              className="text-muted-foreground w-5 shrink-0 select-none text-center"
            >
              {line.kind === "added"
                ? "+"
                : line.kind === "removed"
                  ? "−"
                  : " "}
            </span>
            <code className="whitespace-pre">
              {line.kind !== "same" && (
                <span className="sr-only select-none">
                  {line.kind === "added" ? "Added" : "Removed"}:{" "}
                </span>
              )}
              {line.text || " "}
            </code>
          </div>
        ))}
      </div>
    </div>
  )
}
export { DiffViewer, type DiffViewerProps }
