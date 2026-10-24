// Ballmac UI: Model Compare. https://ui.ballmac.com/components/model-compare
"use client"

import * as React from "react"
import { Check, Lock, Search, Star } from "lucide-react"

import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"

type ModelOption = {
  id: string
  /** The model's name, for example "Sonnet 5.5". */
  name: string
  /** Who makes it, for example "Anthropic". Used to group and filter. */
  provider: string
  description?: string
  /** How capable it is, 1 to 5. */
  intelligence: number
  /** How fast it answers, 1 to 5. */
  speed: number
  /** How much it costs, 1 (cheap) to 5 (expensive). */
  cost: number
  /** The context window in tokens, for example 200000. */
  context?: number
  /** Marks the one most people should pick. */
  recommended?: boolean
  /** Why it cannot be chosen, for example "Needs the Pro plan". The model is shown but disabled. */
  unavailable?: string
}

type ModelCompareProps = Omit<React.ComponentProps<"fieldset">, "onChange" | "defaultValue"> & {
  models: ModelOption[]
  /** The chosen model id. Controlled. */
  value?: string
  /** The chosen model id for uncontrolled use. */
  defaultValue?: string
  onValueChange?: (id: string) => void
  /** Heading above the list. */
  label?: string
  /** Show the search box. On by default when there are more than six models. */
  searchable?: boolean
}

/** 200000 → "200K", 1000000 → "1M". */
function formatTokens(n: number) {
  if (n >= 1_000_000) return `${+(n / 1_000_000).toFixed(1)}M`
  if (n >= 1000) return `${Math.round(n / 1000)}K`
  return String(n)
}

const clamp = (n: number) => Math.min(5, Math.max(0, Math.round(n)))

function Meter({ label, value, text, invert }: { label: string; value: number; text: string; invert?: boolean }) {
  const v = clamp(value)
  return (
    <div role="img" aria-label={text} className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
      <span aria-hidden="true">{label}</span>
      <span aria-hidden="true" className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={cn("h-1.5 w-3 rounded-full", i <= v ? (invert ? "bg-foreground/50" : "bg-foreground") : "bg-muted")} />
        ))}
      </span>
    </div>
  )
}

/**
 * Choosing a model, with what matters shown beside each one: how capable, how fast and how costly it is (as meters that also have a spoken value), its
 * context size, and a Recommended mark. Models can be searched and filtered by provider; a model that is not available says why. Each model is a native
 * radio, so the arrow keys, Space and the browser's own group behaviour work.
 */
function ModelCompare({ models, value: valueProp, defaultValue, onValueChange, label, searchable, className, ...props }: ModelCompareProps) {
  const msg = useMessages()
  const name = React.useId()
  label ??= msg("model-compare.label", "Choose a model")
  const [inner, setInner] = React.useState(defaultValue ?? models.find((m) => !m.unavailable)?.id)
  const value = valueProp ?? inner
  const [query, setQuery] = React.useState("")
  const [provider, setProvider] = React.useState<string | null>(null)
  const providers = React.useMemo(() => [...new Set(models.map((m) => m.provider))], [models])
  const q = query.trim().toLowerCase()
  const shown = models.filter((m) => (!provider || m.provider === provider) && (!q || `${m.name} ${m.provider} ${m.description ?? ""}`.toLowerCase().includes(q)))
  const chosen = models.find((m) => m.id === value)
  const showSearch = searchable ?? models.length > 6

  function pick(id: string) {
    if (valueProp === undefined) setInner(id)
    onValueChange?.(id)
  }

  return (
    <fieldset data-slot="model-compare" className={cn("grid min-w-0 gap-4", className)} {...props}>
      <legend className="mb-1 text-sm font-medium text-foreground">{label}</legend>

      {(showSearch || providers.length > 1) && (
        <div className="flex flex-wrap items-center gap-2">
          {showSearch && (
            <div className="flex h-9 min-w-48 flex-1 items-center gap-2 rounded-lg border bg-background px-3 focus-within:ring-[3px] focus-within:ring-ring/50">
              <Search aria-hidden="true" className="size-4 text-muted-foreground" />
              <input type="search" aria-label={msg("model-compare.search", "Search models")} placeholder={msg("model-compare.searchPlaceholder", "Search models")} value={query} onChange={(e) => setQuery(e.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
            </div>
          )}
          {providers.length > 1 && (
            <div role="group" aria-label={msg("model-compare.provider", "Provider")} className="flex flex-wrap gap-1.5">
              {[null, ...providers].map((p) => (
                <button key={p ?? "all"} type="button" aria-pressed={provider === p} onClick={() => setProvider(p)} className={cn("h-8 rounded-full border px-3 text-xs font-medium outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none", provider === p ? "border-foreground bg-foreground text-background" : "hover:bg-accent")}>
                  {p ?? msg("model-compare.all", "All")}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {shown.length === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">{msg("model-compare.none", "No models match.")}</p>
      ) : (
        <div className="grid gap-2.5 [grid-template-columns:repeat(auto-fit,minmax(15rem,1fr))]">
          {shown.map((m) => {
            const off = !!m.unavailable
            return (
              <label key={m.id} data-unavailable={off || undefined} className={cn("group/model relative flex min-w-0 flex-col gap-3 rounded-xl border bg-card p-4 text-card-foreground transition-[border-color,background-color] duration-150 motion-reduce:transition-none", off ? "cursor-not-allowed opacity-70" : "cursor-pointer hover:bg-accent/40", "has-[:checked]:border-foreground has-[:checked]:bg-accent/40 has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50")}>
                <input type="radio" name={name} value={m.id} checked={value === m.id} disabled={off} onChange={() => pick(m.id)} aria-describedby={`${name}-${m.id}`} className="peer sr-only" />
                <div className="flex items-start gap-3">
                  <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-semibold text-muted-foreground">{m.provider.slice(0, 1).toUpperCase()}</span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-foreground">
                      {m.name}
                      {m.recommended && !off && (
                        <span className="inline-flex items-center gap-1 rounded-full border px-2 py-px text-[11px] font-medium"><Star aria-hidden="true" className="size-3" />{msg("model-compare.recommended", "Recommended")}</span>
                      )}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{m.provider}{m.context ? ` · ${msg("model-compare.context", "{size} context", { size: formatTokens(m.context) })}` : ""}</p>
                  </div>
                  {value === m.id && !off && <span aria-hidden="true" className="flex size-5 shrink-0 items-center justify-center rounded-full bg-foreground text-background"><Check className="size-3" /></span>}
                </div>
                {m.description && <p id={`${name}-${m.id}`} className="text-[13px] leading-snug text-muted-foreground">{m.description}</p>}
                <div className="mt-auto grid gap-1.5">
                  <Meter label={msg("model-compare.intelligence", "Intelligence")} value={m.intelligence} text={msg("model-compare.intelligenceValue", "Intelligence {value} of 5", { value: clamp(m.intelligence) })} />
                  <Meter label={msg("model-compare.speed", "Speed")} value={m.speed} text={msg("model-compare.speedValue", "Speed {value} of 5", { value: clamp(m.speed) })} />
                  <Meter label={msg("model-compare.cost", "Cost")} value={m.cost} invert text={msg("model-compare.costValue", "Cost {value} of 5, lower is cheaper", { value: clamp(m.cost) })} />
                </div>
                {off && <p className="flex items-center gap-1.5 text-xs font-medium text-foreground"><Lock aria-hidden="true" className="size-3.5" />{m.unavailable}</p>}
              </label>
            )
          })}
        </div>
      )}

      <p aria-live="polite" className="text-[13px] text-muted-foreground">
        {chosen ? msg("model-compare.chosen", "{name} by {provider} is selected.", { name: chosen.name, provider: chosen.provider }) : msg("model-compare.hint", "Pick a model to continue.")}
      </p>
    </fieldset>
  )
}

export { ModelCompare, formatTokens, type ModelOption, type ModelCompareProps }
