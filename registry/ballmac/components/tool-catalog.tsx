// Ballmac UI: Tool Catalog. https://ui.ballmac.com/components/tool-catalog
"use client"

import * as React from "react"
import { ChevronDown, Search, ShieldAlert, Wrench } from "lucide-react"

import { MatchHighlight, matchesAll, queryTokens } from "@/components/ballmac/match-highlight"
import { Switch } from "@/components/ballmac/switch"
import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"

type CatalogTool = {
  id: string
  /** The name the agent calls it by, for example "search_orders". */
  name: string
  description: string
  enabled: boolean
  /** How much harm a mistake could do. */
  risk?: "low" | "medium" | "high"
  /** Calls in the last seven days. */
  calls?: number
  /** Share of calls that failed, 0 to 1. */
  errorRate?: number
  /** Typical time a call takes, in milliseconds. */
  latencyMs?: number
  /** The input the tool takes, as JSON text. Shown when the tool is opened. */
  schema?: string
}

type ToolCatalogProps = Omit<React.ComponentProps<"section">, "title"> & {
  tools: CatalogTool[]
  /** Called when a tool is switched on or off. Reject and the switch goes back with the message. */
  onToggle?: (tool: CatalogTool, enabled: boolean) => void | Promise<void>
  /** Heading. */
  title?: string
}

type Filter = "all" | "on" | "off" | "attention"
const needsAttention = (t: CatalogTool) => (t.errorRate ?? 0) >= 0.05 || (t.risk === "high" && t.enabled)

/**
 * Everything an agent can call, with a switch for each: what it does, how risky it is, how often it is used and how often it fails, and its input
 * schema one click away. High-risk tools that are on, and tools that fail often, are gathered under "Needs attention". A switch that fails to save goes back
 * with the reason.
 */
function ToolCatalog({ tools: toolsProp, onToggle, title, className, ...props }: ToolCatalogProps) {
  const msg = useMessages()
  const uid = React.useId()
  title ??= msg("tool-catalog.title", "Tools")
  const [tools, setTools] = React.useState(toolsProp)
  React.useEffect(() => setTools(toolsProp), [toolsProp])
  const [query, setQuery] = React.useState("")
  const [filter, setFilter] = React.useState<Filter>("all")
  const [open, setOpen] = React.useState<string | null>(null)
  const [busy, setBusy] = React.useState<string | null>(null)
  const [error, setError] = React.useState<{ id: string; text: string } | null>(null)
  const tokens = queryTokens(query)
  const shown = tools.filter((t) => (filter === "all" || (filter === "on" ? t.enabled : filter === "off" ? !t.enabled : needsAttention(t))) && (!tokens.length || matchesAll(`${t.name} ${t.description}`, tokens)))
  const count = (f: Filter) => tools.filter((t) => (f === "all" ? true : f === "on" ? t.enabled : f === "off" ? !t.enabled : needsAttention(t))).length

  async function toggle(t: CatalogTool, enabled: boolean) {
    setBusy(t.id)
    setError(null)
    setTools((l) => l.map((x) => (x.id === t.id ? { ...x, enabled } : x)))
    try {
      await onToggle?.(t, enabled)
    } catch (e) {
      setTools((l) => l.map((x) => (x.id === t.id ? t : x)))
      setError({ id: t.id, text: e instanceof Error ? e.message : msg("tool-catalog.failed", "{name} could not be changed, so it is as it was.", { name: t.name }) })
    } finally {
      setBusy(null)
    }
  }
  const risk = (r: NonNullable<CatalogTool["risk"]>) => msg(`tool-catalog.risk.${r}`, r === "low" ? "Low risk" : r === "medium" ? "Medium risk" : "High risk")

  return (
    <section data-slot="tool-catalog" aria-labelledby={`${uid}-t`} className={cn("grid w-full min-w-0 gap-4 rounded-xl border bg-card p-4 text-card-foreground sm:p-5", className)} {...props}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 id={`${uid}-t`} className="flex items-center gap-2 text-sm font-medium"><Wrench aria-hidden="true" className="size-4" /> {title}</h3>
        <div role="group" aria-label={msg("tool-catalog.filter", "Filter tools")} className="flex flex-wrap gap-1.5">
          {([["all", msg("tool-catalog.all", "All")], ["on", msg("tool-catalog.on", "On")], ["off", msg("tool-catalog.off", "Off")], ["attention", msg("tool-catalog.attention", "Needs attention")]] as const).map(([k, l]) => (
            <button key={k} type="button" aria-pressed={filter === k} onClick={() => setFilter(k)} className={cn("h-8 rounded-full border px-3 text-xs font-medium outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none", filter === k ? "border-foreground bg-foreground text-background" : "hover:bg-accent")}>
              {l} <span className={cn("tabular-nums", filter === k ? "opacity-70" : "text-muted-foreground")}>{count(k)}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex h-10 items-center gap-2 rounded-lg border bg-background px-3 focus-within:ring-[3px] focus-within:ring-ring/50">
        <Search aria-hidden="true" className="size-4 text-muted-foreground" />
        <input type="search" aria-label={msg("tool-catalog.search", "Search tools")} placeholder={msg("tool-catalog.searchPlaceholder", "Search by name or description")} value={query} onChange={(e) => setQuery(e.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
      </div>
      <p aria-live="polite" className="text-xs text-muted-foreground">{msg("tool-catalog.count", "{count} tools shown", { count: shown.length })}</p>

      {shown.length === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">{msg("tool-catalog.none", "No tools match.")}</p>
      ) : (
        <ul className="grid gap-2.5">
          {shown.map((t) => {
            const isOpen = open === t.id
            const flaky = (t.errorRate ?? 0) >= 0.05
            return (
              <li key={t.id} data-enabled={t.enabled} className="rounded-lg border">
                <div className="flex items-start justify-between gap-4 p-3.5">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <code className="font-mono text-sm font-semibold text-foreground" dir="ltr"><MatchHighlight text={t.name} query={tokens} /></code>
                      {t.risk && (
                        <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-px text-[11px]", t.risk === "high" ? "border-destructive/50 text-destructive" : "text-muted-foreground")}>
                          {t.risk === "high" && <ShieldAlert aria-hidden="true" className="size-3" />}
                          {risk(t.risk)}
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-[13px] leading-snug text-muted-foreground"><MatchHighlight text={t.description} query={tokens} /></p>
                    {(t.calls !== undefined || t.errorRate !== undefined || t.latencyMs !== undefined) && (
                      <p className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-xs tabular-nums text-muted-foreground">
                        {t.calls !== undefined && <span>{msg("tool-catalog.calls", "{count} calls this week", { count: t.calls.toLocaleString("en-US") })}</span>}
                        {t.errorRate !== undefined && <span className={cn(flaky && "font-medium text-destructive")}>{msg("tool-catalog.errors", "{rate}% fail", { rate: Math.round(t.errorRate * 1000) / 10 })}{flaky ? ` · ${msg("tool-catalog.flaky", "fails often")}` : ""}</span>}
                        {t.latencyMs !== undefined && <span>{msg("tool-catalog.latency", "{ms} ms typical", { ms: t.latencyMs.toLocaleString("en-US") })}</span>}
                      </p>
                    )}
                    {t.risk === "high" && t.enabled && <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-foreground"><ShieldAlert aria-hidden="true" className="size-3.5 text-destructive" /> {msg("tool-catalog.highOn", "On for a high-risk tool: check it is meant to be.")}</p>}
                  </div>
                  <Switch aria-label={msg("tool-catalog.switch", "{name} is on", { name: t.name })} checked={t.enabled} disabled={busy === t.id} onCheckedChange={(v) => void toggle(t, v)} />
                </div>
                {error?.id === t.id && <p role="alert" className="px-3.5 pb-3 text-sm font-medium text-destructive">{error.text}</p>}
                {t.schema && (
                  <div className="border-t">
                    <button type="button" aria-expanded={isOpen} aria-controls={`${uid}-${t.id}`} onClick={() => setOpen(isOpen ? null : t.id)} className="flex w-full items-center justify-between gap-2 px-3.5 py-2 text-start text-xs font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset motion-reduce:transition-none">
                      {msg("tool-catalog.schema", "Input schema")}
                      <ChevronDown aria-hidden="true" className={cn("size-4 transition-transform motion-reduce:transition-none", isOpen && "rotate-180")} />
                    </button>
                    {isOpen && (
                      <pre id={`${uid}-${t.id}`} dir="ltr" tabIndex={0} aria-label={msg("tool-catalog.schema", "{name} input schema", { name: t.name })} className="max-h-56 overflow-auto border-t bg-muted/30 px-3.5 py-3 font-mono text-xs leading-relaxed outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset">{t.schema}</pre>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export { ToolCatalog, needsAttention, type CatalogTool, type ToolCatalogProps }
