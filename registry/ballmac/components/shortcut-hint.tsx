// Ballmac UI: Shortcut Hint. https://ui.ballmac.com/components/shortcut-hint
import * as React from "react"
import { cn } from "@/lib/utils"

type ShortcutHintProps = React.ComponentProps<"span"> & {
  /** Keys in order, such as ["⌘", "K"]. */
  keys: string[]
  /** Action explained by the shortcut. */
  label: string
  /** Render compact keycaps for dense menus. */
  compact?: boolean
}

function ShortcutHint({
  className,
  keys,
  label,
  compact = false,
  ...props
}: ShortcutHintProps) {
  return (
    <span
      data-slot="shortcut-hint"
      role="note"
      aria-label={`${label}: ${keys.join(" plus ")}`}
      className={cn(
        "inline-flex min-w-0 items-center gap-1 text-sm",
        className,
      )}
      {...props}
    >
      <span aria-hidden="true" className="text-muted-foreground mr-1 truncate">
        {label}
      </span>
      <span
        aria-hidden="true"
        className="inline-flex shrink-0 items-center gap-0.5"
      >
        {keys.map((key, index) => (
          <kbd
            key={`${key}-${index}`}
            data-slot="shortcut-hint-key"
            className={cn(
              "bg-muted text-muted-foreground inline-flex items-center justify-center rounded border border-border font-mono shadow-sm",
              compact
                ? "min-w-5 px-1 py-0.5 text-[10px]"
                : "min-w-6 px-1.5 py-0.5 text-xs",
            )}
          >
            {key}
          </kbd>
        ))}
      </span>
    </span>
  )
}

export { ShortcutHint, type ShortcutHintProps }
