// Ballmac UI: Run Ledger. https://ui.ballmac.com/components/run-ledger
"use client"

import * as React from "react"
import { AlertTriangle, ArrowDown, ArrowUp, ChevronsUpDown, Info } from "lucide-react"

import { cn } from "@/lib/utils"
import { useMessages, type Msg } from "@/lib/ballmac/i18n"

type LedgerRow = {
  id: string
  /** The step, agent or tool the cost belongs to. */
  label: string
  /** What kind of work it was, for example "Model" or "Tool". */
  kind?: string
  /** Tokens sent in. */
  tokensIn?: number
  /** Tokens received. */
  tokensOut?: number
  /** Time taken, in milliseconds. */
  ms: number
  /** Cost, in the ledger's currency. */
  cost: number
}

type SortKey = "cost" | "time" | "tokens" | "label"

/** 850 → "850 ms", 4200 → "4.2 s", 125000 → "2 min 5 s". */
function formatDuration(ms: number) {
  if (!Number.isFinite(ms) || ms < 0) return "0 ms"
  if (ms < 1000) return `${Math.round(ms)} ms`
  const s = ms / 1000
  if (s < 60) return `${+s.toFixed(1)} s`
  const m = Math.floor(s / 60)
  const r = Math.round(s - m * 60)
  return r === 60 ? `${m + 1} min` : r === 0 ? `${m} min` : `${m} min ${r} s`
}

function formatTokens(n: number) {
  if (n >= 1_000_000) return `${+(n / 1_000_000).toFixed(2)}M`
  if (n >= 10_000) return `${+(n / 1000).toFixed(1)}k`
  return n.toLocaleString("en-US")
}

type RunLedgerProps = Omit<React.ComponentProps<"div">, "title"> & {
  /** One row per step, agent or tool. */
  rows: LedgerRow[]
  /** Spending limit for the run, in the same currency. Adds a budget bar with a warning. */
  budget?: number
  /** Percent of the budget at which the warning starts. */
  warnAt?: number
  /** ISO currency code. */
  currency?: string
  /** Locale for money. Fixed by default so the server and browser agree. */
  locale?: string
  /** Heading. */
  title?: string
  /** Which column is sorted first. */
  defaultSort?: SortKey
}

function money(value: number, currency: string, locale: string) {
  const digits = Math.abs(value) > 0 && Math.abs(value) < 1 ? 4 : 2
  return new Intl.NumberFormat(locale, { style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: digits }).format(value)
}

function budgetText(msg: Msg, state: "ok" | "warning" | "over", left: string, over: string) {
  if (state === "over") return msg("run-ledger.over", "Over budget by {amount}", { amount: over })
  if (state === "warning") return msg("run-ledger.nearing", "Nearing the budget, {amount} left", { amount: left })
  return msg("run-ledger.left", "{amount} left in the budget", { amount: left })
}

/**
 * What a run cost, step by step: time, tokens and money with the share each row takes, sortable columns, a total, and an optional budget that warns in words.
 * The bars are decoration; every number is also text.
 */
function RunLedger({ rows, budget, warnAt = 80, currency = "USD", locale = "en-US", title, defaultSort = "cost", className, ...props }: RunLedgerProps) {
  const msg = useMessages()
  title ??= msg("run-ledger.title", "Run ledger")
  const [sort, setSort] = React.useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: defaultSort, dir: defaultSort === "label" ? "asc" : "desc" })

  const total = React.useMemo(
    () => rows.reduce((t, r) => ({ cost: t.cost + r.cost, ms: t.ms + r.ms, tokens: t.tokens + (r.tokensIn ?? 0) + (r.tokensOut ?? 0) }), { cost: 0, ms: 0, tokens: 0 }),
    [rows]
  )
  const maxCost = Math.max(...rows.map((r) => r.cost), 0)
  const sorted = React.useMemo(() => {
    const value = (r: LedgerRow) => (sort.key === "cost" ? r.cost : sort.key === "time" ? r.ms : sort.key === "tokens" ? (r.tokensIn ?? 0) + (r.tokensOut ?? 0) : r.label.toLowerCase())
    const out = [...rows].sort((a, b) => (value(a) < value(b) ? -1 : value(a) > value(b) ? 1 : 0))
    return sort.dir === "desc" ? out.reverse() : out
  }, [rows, sort])

  const percent = budget && budget > 0 ? (total.cost / budget) * 100 : 0
  const state = budget ? (percent >= 100 ? "over" : percent >= warnAt ? "warning" : "ok") : "ok"

  function header(key: SortKey, text: string, align: "start" | "end" = "end") {
    const active = sort.key === key
    const Icon = !active ? ChevronsUpDown : sort.dir === "asc" ? ArrowUp : ArrowDown
    return (
      <th scope="col" aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"} className={cn("px-3 py-2 font-medium", align === "end" ? "text-end" : "text-start")}>
        <button
          type="button"
          onClick={() => setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: key === "label" ? "asc" : "desc" }))}
          className={cn("inline-flex items-center gap-1 rounded-md px-1 py-0.5 text-xs outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50", active ? "text-foreground" : "text-muted-foreground")}
        >
          {text}
          <Icon aria-hidden="true" className="size-3" />
        </button>
      </th>
    )
  }

  return (
    <div data-slot="run-ledger" data-budget={state} className={cn("grid w-full min-w-0 gap-4 rounded-xl border bg-card p-4 text-card-foreground sm:p-5", className)} {...props}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground tabular-nums">
          {msg("run-ledger.summary", "{count} steps, {time}, {tokens} tokens", { count: rows.length, time: formatDuration(total.ms), tokens: formatTokens(total.tokens) })}
        </p>
      </div>

      {budget !== undefined && budget > 0 && (
        <div className="grid gap-2">
          <div
            role="meter"
            aria-label={msg("run-ledger.budget", "Budget")}
            aria-valuemin={0}
            aria-valuemax={budget}
            aria-valuenow={Math.min(budget, total.cost)}
            aria-valuetext={`${money(total.cost, currency, locale)} of ${money(budget, currency, locale)}. ${budgetText(msg, state, money(Math.max(0, budget - total.cost), currency, locale), money(total.cost - budget, currency, locale))}`}
            className="h-2.5 overflow-hidden rounded-full bg-muted"
          >
            <div className={cn("h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none", state === "over" ? "bg-destructive" : state === "warning" ? "bg-chart-3" : "bg-foreground")} style={{ width: `${Math.min(100, percent)}%` }} />
          </div>
          <p role={state === "ok" ? undefined : "status"} className="flex items-center gap-1.5 text-[13px]">
            {state === "ok" ? <Info aria-hidden="true" className="size-3.5 text-muted-foreground" /> : <AlertTriangle aria-hidden="true" className={cn("size-3.5", state === "over" ? "text-destructive" : "text-chart-3")} />}
            <span className="tabular-nums">{money(total.cost, currency, locale)}</span>
            <span className="text-muted-foreground">/ {money(budget, currency, locale)}</span>
            <span className="ms-auto">{budgetText(msg, state, money(Math.max(0, budget - total.cost), currency, locale), money(total.cost - budget, currency, locale))}</span>
          </p>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[34rem] border-collapse text-[13px]">
          <caption className="sr-only">{title}</caption>
          <thead className="bg-muted/40">
            <tr>
              {header("label", msg("run-ledger.step", "Step"), "start")}
              {header("time", msg("run-ledger.time", "Time"))}
              {header("tokens", msg("run-ledger.tokens", "Tokens"))}
              {header("cost", msg("run-ledger.cost", "Cost"))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {sorted.map((r) => {
              const share = total.cost > 0 ? (r.cost / total.cost) * 100 : 0
              const top = r.cost === maxCost && maxCost > 0 && rows.length > 1
              return (
                <tr key={r.id} data-top={top || undefined}>
                  <th scope="row" className="px-3 py-2.5 text-start font-normal">
                    <span className="flex items-center gap-2">
                      <span className="truncate font-medium text-foreground">{r.label}</span>
                      {r.kind && <span className="shrink-0 rounded-full border px-1.5 py-px text-[11px] text-muted-foreground">{r.kind}</span>}
                      {top && <span className="shrink-0 rounded-full bg-foreground px-1.5 py-px text-[11px] font-medium text-background">{msg("run-ledger.top", "Most expensive")}</span>}
                    </span>
                    <span aria-hidden="true" className="mt-1.5 block h-1 overflow-hidden rounded-full bg-muted">
                      <span className="block h-full rounded-full bg-chart-1" style={{ width: `${maxCost > 0 ? (r.cost / maxCost) * 100 : 0}%` }} />
                    </span>
                  </th>
                  <td className="px-3 py-2.5 text-end text-muted-foreground tabular-nums">{formatDuration(r.ms)}</td>
                  <td className="px-3 py-2.5 text-end text-muted-foreground tabular-nums">{r.tokensIn !== undefined || r.tokensOut !== undefined ? formatTokens((r.tokensIn ?? 0) + (r.tokensOut ?? 0)) : "—"}</td>
                  <td className="px-3 py-2.5 text-end tabular-nums">
                    <span className="font-medium text-foreground">{money(r.cost, currency, locale)}</span>
                    <span className="ms-1.5 text-xs text-muted-foreground">{Math.round(share)}%</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot className="border-t bg-muted/30 font-medium">
            <tr>
              <th scope="row" className="px-3 py-2.5 text-start">{msg("run-ledger.total", "Total")}</th>
              <td className="px-3 py-2.5 text-end tabular-nums">{formatDuration(total.ms)}</td>
              <td className="px-3 py-2.5 text-end tabular-nums">{formatTokens(total.tokens)}</td>
              <td className="px-3 py-2.5 text-end tabular-nums">{money(total.cost, currency, locale)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

export { RunLedger, formatDuration, type LedgerRow, type RunLedgerProps, type SortKey }
