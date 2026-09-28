// Ballmac UI: API Key Field. https://ui.ballmac.com/components/api-key-field
"use client"

import * as React from "react"
import { Check, Copy, Eye, EyeOff, RefreshCw } from "lucide-react"

import { cn } from "@/lib/utils"

const MASK = "••••••••"

/** Masks a secret, keeping `prefix` leading and `suffix` trailing characters. The mask length is fixed so it doesn't leak the key's length. */
function maskSecret(value: string, prefix: number, suffix: number) {
  if (value.length <= prefix + suffix + 4) return MASK
  return `${value.slice(0, prefix)}${MASK}${suffix > 0 ? value.slice(-suffix) : ""}`
}

const iconButton =
  "flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors duration-150 hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-pressed:text-foreground"

type ApiKeyFieldProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** The secret. It is only rendered in full while revealed and is never logged. */
  value: string
  /** Visible label, also the accessible name of the group. */
  label?: React.ReactNode
  /** Helper text under the field, e.g. when the key was created. */
  description?: React.ReactNode
  /** Leading characters left visible while masked, e.g. 8 keeps "sk-live-". */
  visiblePrefix?: number
  /** Trailing characters left visible while masked. */
  visibleSuffix?: number
  /** Controlled reveal state. */
  revealed?: boolean
  /** Initial reveal state when uncontrolled. */
  defaultRevealed?: boolean
  /** Called when the reveal toggle is pressed. */
  onRevealedChange?: (revealed: boolean) => void
  /** Called after the full key was copied to the clipboard. */
  onCopy?: () => void
  /** Shows a regenerate button. Asking for confirmation is up to you. */
  onRegenerate?: () => void
  /** Disables the regenerate button and spins its icon while a new key is created. */
  regenerating?: boolean
}

function ApiKeyField({
  value,
  label = "API key",
  description,
  visiblePrefix = 8,
  visibleSuffix = 4,
  revealed: revealedProp,
  defaultRevealed = false,
  onRevealedChange,
  onCopy,
  onRegenerate,
  regenerating = false,
  className,
  ...props
}: ApiKeyFieldProps) {
  const id = React.useId()
  const labelId = `${id}-label`
  const descriptionId = `${id}-description`
  const [internalRevealed, setInternalRevealed] = React.useState(defaultRevealed)
  const revealed = revealedProp ?? internalRevealed
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  React.useEffect(() => () => clearTimeout(timer.current), [])

  const masked = maskSecret(value, visiblePrefix, visibleSuffix)
  const partial = value.length > visiblePrefix + visibleSuffix + 4
  const head = partial ? value.slice(0, visiblePrefix) : ""
  const tail = partial && visibleSuffix > 0 ? value.slice(-visibleSuffix) : ""

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      return
    }
    setCopied(true)
    onCopy?.()
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1800)
  }

  function toggle() {
    const next = !revealed
    if (revealedProp === undefined) setInternalRevealed(next)
    onRevealedChange?.(next)
  }

  return (
    <div
      data-slot="api-key-field"
      data-revealed={revealed || undefined}
      role="group"
      aria-labelledby={labelId}
      aria-describedby={description ? descriptionId : undefined}
      className={cn("grid w-full min-w-0 gap-2", className)}
      {...props}
    >
      <div id={labelId} className="text-sm font-medium">
        {label}
      </div>
      <div className="flex h-10 min-w-0 items-center gap-1 rounded-md border border-input bg-card pr-1 pl-3 shadow-xs">
        <code
          data-slot="api-key-field-value"
          translate="no"
          className={cn(
            "min-w-0 flex-1 overflow-x-auto font-mono text-[13px] whitespace-nowrap [scrollbar-width:none]",
            revealed ? "select-all" : "select-none"
          )}
        >
          {revealed ? (
            value
          ) : (
            <>
              <span aria-hidden="true">{masked}</span>
              <span className="sr-only">
                {head ? `${head}, rest hidden` : "Hidden"}
                {tail ? `, ends in ${tail}` : ""}
              </span>
            </>
          )}
        </code>
        <button type="button" aria-label="Show key" aria-pressed={revealed} title={revealed ? "Hide key" : "Show key"} onClick={toggle} className={iconButton}>
          {revealed ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
        </button>
        <button type="button" aria-label={copied ? "Copied" : "Copy key"} title="Copy key" onClick={copy} className={iconButton}>
          {copied ? <Check aria-hidden="true" className="size-4" /> : <Copy aria-hidden="true" className="size-4" />}
        </button>
        {onRegenerate ? (
          <button
            type="button"
            aria-label="Regenerate key"
            title="Regenerate key"
            disabled={regenerating}
            aria-busy={regenerating || undefined}
            onClick={onRegenerate}
            className={iconButton}
          >
            <RefreshCw aria-hidden="true" className={cn("size-4", regenerating && "animate-spin motion-reduce:animate-none")} />
          </button>
        ) : null}
      </div>
      {description ? (
        <p id={descriptionId} className="text-xs text-muted-foreground">
          {description}
        </p>
      ) : null}
      <span className="sr-only" aria-live="polite">
        {copied ? "Key copied to clipboard" : ""}
      </span>
    </div>
  )
}

export { ApiKeyField, maskSecret, type ApiKeyFieldProps }
