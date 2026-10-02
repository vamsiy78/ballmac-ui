// Ballmac UI: Suggestion Chips. https://ui.ballmac.com/components/suggestion-chips
"use client"

import * as React from "react"
import { ArrowUpRight, RefreshCw } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"

type Suggestion = {
  /** Text on the chip. */
  label: string
  /** Text sent when chosen. Defaults to `label`. */
  prompt?: string
  /** Second line, used by the "cards" layout. */
  description?: string
  /** Leading icon. */
  icon?: React.ReactNode
}

type SuggestionChipsProps = Omit<React.ComponentProps<"div">, "onSelect"> & {
  /** The prompts to offer. */
  suggestions: Suggestion[]
  /** Called with the prompt text and the suggestion that was chosen. */
  onSelect?: (prompt: string, suggestion: Suggestion) => void
  /** "pills" wraps onto several lines, "scroll" keeps one swipeable row with faded edges, "cards" is a grid with descriptions. */
  variant?: "pills" | "scroll" | "cards"
  /** Accessible name of the group. */
  label?: string
  /** When set, a refresh button appears after the chips. */
  onRefresh?: () => void
  /** Accessible name of the refresh button. */
  refreshLabel?: string
  /** Disables every chip, for example while a reply is streaming. */
  disabled?: boolean
  /** Shows placeholder chips while suggestions load. */
  loading?: boolean
}

const chipBase =
  "inline-flex shrink-0 items-center gap-2 rounded-full border bg-background text-sm font-medium text-foreground shadow-xs outline-none transition-[color,background-color,border-color,box-shadow,transform] duration-150 select-none hover:border-foreground/25 hover:bg-accent focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none motion-reduce:active:scale-100 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground"

function SuggestionChips({
  suggestions,
  onSelect,
  variant = "pills",
  label,
  onRefresh,
  refreshLabel,
  disabled = false,
  loading = false,
  className,
  ...props
}: SuggestionChipsProps) {
  const msg = useMessages()
  label ??= msg("suggestion-chips.label", "Suggested prompts")
  refreshLabel ??= msg("suggestion-chips.refreshLabel", "Show other suggestions")
  const reduce = useReducedMotion()
  const [spins, setSpins] = React.useState(0)

  function choose(s: Suggestion) {
    onSelect?.(s.prompt ?? s.label, s)
  }

  const rootClass =
    variant === "cards"
      ? "grid w-full gap-2 sm:grid-cols-2"
      : variant === "scroll"
        ? "-mx-1 flex w-full snap-x gap-2 overflow-x-auto px-1 py-1 [-ms-overflow-style:none] [scrollbar-width:none] [mask-image:linear-gradient(to_right,transparent,black_1.25rem,black_calc(100%-1.25rem),transparent)] [&::-webkit-scrollbar]:hidden"
        : "flex w-full flex-wrap gap-2"

  const item = (i: number) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.28, delay: reduce ? 0 : Math.min(i, 8) * 0.04, ease: [0.22, 1, 0.36, 1] as const },
  })

  return (
    <div
      data-slot="suggestion-chips"
      data-variant={variant}
      role="group"
      aria-label={label}
      aria-busy={loading || undefined}
      className={cn(rootClass, className)}
      {...props}
    >
      {loading
        ? Array.from({ length: 4 }, (_, i) => (
            <span
              key={i}
              aria-hidden="true"
              className={cn(
                "animate-pulse bg-muted motion-reduce:animate-none",
                variant === "cards" ? "h-16 rounded-xl" : "h-9 shrink-0 rounded-full",
                variant !== "cards" && ["w-32", "w-44", "w-28", "w-40"][i]
              )}
            />
          ))
        : suggestions.map((s, i) =>
            variant === "cards" ? (
              <motion.button
                key={s.label}
                type="button"
                disabled={disabled}
                onClick={() => choose(s)}
                {...item(i)}
                className="group/chip flex min-w-0 items-start gap-3 rounded-xl border bg-card p-3.5 text-start shadow-xs outline-none transition-[border-color,background-color,box-shadow] duration-150 hover:border-foreground/25 hover:bg-accent/60 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none"
              >
                {s.icon && (
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border bg-muted text-foreground [&_svg]:size-4"
                  >
                    {s.icon}
                  </span>
                )}
                <span className="grid min-w-0 flex-1 gap-0.5">
                  <span className="text-sm font-medium text-foreground">{s.label}</span>
                  {s.description && (
                    <span className="line-clamp-2 text-[13px] leading-5 text-muted-foreground">{s.description}</span>
                  )}
                </span>
                <ArrowUpRight
                  aria-hidden="true"
                  className="mt-1 size-4 shrink-0 text-muted-foreground opacity-0 transition-[opacity,transform] duration-150 group-hover/chip:translate-x-0.5 group-hover/chip:-translate-y-0.5 group-hover/chip:opacity-100 group-focus-visible/chip:opacity-100 motion-reduce:transition-none rtl:-scale-x-100"
                />
              </motion.button>
            ) : (
              <motion.button
                key={s.label}
                type="button"
                disabled={disabled}
                onClick={() => choose(s)}
                {...item(i)}
                className={cn(chipBase, "h-9 px-3.5", variant === "scroll" && "snap-start", s.icon && "ps-3")}
              >
                {s.icon}
                <span className="whitespace-nowrap">{s.label}</span>
              </motion.button>
            )
        )}
      {onRefresh && !loading && (
        <button
          type="button"
          disabled={disabled}
          aria-label={refreshLabel}
          title={refreshLabel}
          onClick={() => {
            setSpins((n) => n + 1)
            onRefresh()
          }}
          className={cn(
            "inline-flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
            variant === "cards" && "justify-self-start sm:col-span-2"
          )}
        >
          <motion.span
            aria-hidden="true"
            animate={{ rotate: reduce ? 0 : spins * 180 }}
            transition={{ type: "spring", stiffness: 240, damping: 20 }}
            className="flex"
          >
            <RefreshCw className="size-4" />
          </motion.span>
        </button>
      )}
    </div>
  )
}

export { SuggestionChips, type SuggestionChipsProps, type Suggestion }
