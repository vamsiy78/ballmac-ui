// Ballmac UI: Flags 1. https://ui.ballmac.com/blocks/flags-1
"use client"

import * as React from "react"
import { ChevronDown, Flag, Loader2, Search, ShieldAlert, Sparkles } from "lucide-react"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ballmac/alert-dialog"
import { Button } from "@/components/ballmac/button"
import { MatchHighlight, matchesAll, queryTokens } from "@/components/ballmac/match-highlight"
import { Skeleton } from "@/components/ballmac/skeleton"
import { Slider } from "@/components/ballmac/slider"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { Switch } from "@/components/ballmac/switch"
import { useReturnFocus } from "@/lib/ballmac/return-focus"
import { cn } from "@/lib/utils"

type Flags1Env = "dev" | "staging" | "production"

type Flags1Flag = {
  id: string
  /** The key your code reads, such as "checkout-v2". */
  key: string
  description: string
  enabled: Record<Flags1Env, boolean>
  /** Share of production users who get it when it is on, 0 to 100. */
  rollout: number
  /** Who gets it first, in words: "Staff, and the Beta group". */
  rules?: string
  owner: string
  /** Days since it last changed. */
  changedDays: number
}

type Flags1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    flags?: Flags1Flag[]
    title?: string
    /** The flag whose rollout and details are open at first. */
    defaultOpenId?: string
    /** Called when a switch or rollout is saved. Return a promise; reject and the change is undone with a message. */
    onChange?: (flag: Flags1Flag) => void | Promise<void>
  }

const sample: Flags1Flag[] = [
  { id: "f1", key: "checkout-v2", description: "The new one-page checkout", enabled: { dev: true, staging: true, production: true }, rollout: 25, rules: "Staff, and anyone in the Beta group", owner: "Priya Shah", changedDays: 3 },
  { id: "f2", key: "ai-summaries", description: "AI summaries at the top of long threads", enabled: { dev: true, staging: true, production: false }, rollout: 0, rules: "Nobody yet", owner: "Theo Nakamura", changedDays: 1 },
  { id: "f3", key: "dark-mode-default", description: "Follow the device setting on first visit", enabled: { dev: true, staging: true, production: true }, rollout: 100, owner: "Noor Haddad", changedDays: 142 },
  { id: "f4", key: "bulk-export", description: "Export more than 10,000 rows at once", enabled: { dev: true, staging: false, production: false }, rollout: 0, rules: "Enterprise plans", owner: "Kofi Mensah", changedDays: 9 },
  { id: "f5", key: "new-onboarding", description: "The three-step setup checklist", enabled: { dev: true, staging: true, production: true }, rollout: 100, owner: "Ana Souza", changedDays: 118 },
  { id: "f6", key: "legacy-invoice-pdf", description: "The old invoice layout, kept for a few customers", enabled: { dev: true, staging: true, production: true }, rollout: 8, rules: "Accounts created before 2024", owner: "Oliver Reed", changedDays: 61 },
]

const envs: { id: Flags1Env; label: string }[] = [{ id: "dev", label: "Development" }, { id: "staging", label: "Staging" }, { id: "production", label: "Production" }]

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-3">
      {[0, 1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-20 rounded-2xl" />
      ))}
    </div>
  )
}

/**
 * A feature flags manager: every flag with a switch for each environment, a rollout slider for production, who gets it first, and a flag that
 * has been fully on for months marked ready to remove. Anything that changes production asks first and says who it affects, and a change that
 * fails to save is undone with the reason. Search and filters narrow the list and the count follows.
 */
function Flags1({ flags: flagsProp = sample, title = "Feature flags", defaultOpenId, onChange, state = "ready", onRetry, emptyState, errorState, className, ...props }: Flags1Props) {
  const id = React.useId()
  const [flags, setFlags] = React.useState<Flags1Flag[]>(flagsProp)
  React.useEffect(() => setFlags(flagsProp), [flagsProp])
  const list = state === "empty" ? [] : flags
  const [query, setQuery] = React.useState("")
  const [filter, setFilter] = React.useState<"all" | "live" | "stale">("all")
  const [open, setOpen] = React.useState<string | null>(defaultOpenId ?? null)
  const [draft, setDraft] = React.useState<Record<string, number>>({})
  const [confirm, setConfirm] = React.useState<{ flag: Flags1Flag; next: Flags1Flag; text: string } | null>(null)
  const [busy, setBusy] = React.useState<string | null>(null)
  const [error, setError] = React.useState<{ id: string; text: string } | null>(null)
  const ret = useReturnFocus(!!confirm)
  const tokens = queryTokens(query)

  const stale = (f: Flags1Flag) => f.enabled.production && f.rollout === 100 && f.changedDays >= 90
  const live = (f: Flags1Flag) => f.enabled.production && f.rollout > 0
  const shown = list.filter((f) => (!tokens.length || matchesAll(`${f.key} ${f.description} ${f.owner}`, tokens)) && (filter === "all" || (filter === "live" ? live(f) : stale(f))))

  async function commit(f: Flags1Flag, next: Flags1Flag) {
    setError(null)
    setBusy(f.id)
    setFlags((x) => x.map((y) => (y.id === f.id ? next : y)))
    try {
      await onChange?.(next)
    } catch (e) {
      setFlags((x) => x.map((y) => (y.id === f.id ? f : y)))
      setError({ id: f.id, text: e instanceof Error ? e.message : `${f.key} could not be saved, so it was put back as it was.` })
    } finally {
      setBusy(null)
    }
  }
  function toggle(f: Flags1Flag, env: Flags1Env, on: boolean) {
    const next = { ...f, enabled: { ...f.enabled, [env]: on }, changedDays: 0 }
    if (env === "production") {
      const who = f.rollout === 100 ? "everyone" : `${f.rollout}% of users`
      setConfirm({ flag: f, next, text: on ? `${f.key} will switch on in Production for ${who}${f.rules ? `, starting with ${f.rules.charAt(0).toLowerCase()}${f.rules.slice(1)}` : ""}.` : `${f.key} will switch off in Production for ${who}. Anyone using it right now will lose it.` })
    } else void commit(f, next)
  }

  const content = !list.length ? (
    <div className="bg-card rounded-2xl border px-6 py-16 text-center">
      <span aria-hidden="true" className="bg-muted mx-auto flex size-12 items-center justify-center rounded-full">
        <Flag className="size-6" />
      </span>
      <h2 className="mt-5 text-lg font-semibold tracking-tight">{emptyState?.title ?? "No flags yet"}</h2>
      <p className="text-muted-foreground mx-auto mt-1.5 max-w-sm text-sm text-pretty">{emptyState?.description ?? "A flag lets you ship code switched off, then turn it on for a few people before everyone."}</p>
      {emptyState?.action}
    </div>
  ) : (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="bg-background focus-within:ring-ring/50 flex h-10 flex-1 items-center gap-2 rounded-lg border px-3 focus-within:ring-[3px]">
          <Search aria-hidden="true" className="text-muted-foreground size-4" />
          <input type="search" aria-label="Search flags" placeholder="Search by key, description or owner" value={query} onChange={(e) => setQuery(e.target.value)} className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-sm outline-none" />
        </div>
        <div role="group" aria-label="Filter" className="flex flex-wrap gap-2">
          {([["all", "All"], ["live", "Live in production"], ["stale", "Ready to remove"]] as const).map(([k, l]) => (
            <button key={k} type="button" aria-pressed={filter === k} onClick={() => setFilter(k)} className={cn("focus-visible:ring-ring/50 shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px] motion-reduce:transition-none", filter === k ? "bg-foreground text-background border-foreground" : "hover:bg-accent")}>
              {l} <span className={cn("tabular-nums", filter === k ? "opacity-70" : "text-muted-foreground")}>{k === "all" ? list.length : list.filter(k === "live" ? live : stale).length}</span>
            </button>
          ))}
        </div>
      </div>
      <p aria-live="polite" className="text-muted-foreground mt-4 text-sm">
        {shown.length} {shown.length === 1 ? "flag" : "flags"}
      </p>
      {shown.length ? (
        <ul className="mt-3 grid gap-3">
          {shown.map((f) => {
            const isOpen = open === f.id
            const dirty = draft[f.id] !== undefined && draft[f.id] !== f.rollout
            return (
              <li key={f.id} className="bg-card rounded-2xl border">
                <div className="grid items-center gap-x-6 gap-y-3 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto]">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2">
                      <button type="button" aria-expanded={isOpen} aria-controls={`${id}-${f.id}`} onClick={() => setOpen(isOpen ? null : f.id)} className="focus-visible:ring-ring/50 -ms-1 flex items-center gap-2 rounded-md px-1 text-start outline-none focus-visible:ring-[3px]">
                        <ChevronDown aria-hidden="true" className={cn("text-muted-foreground size-4 transition-transform motion-reduce:transition-none", !isOpen && "-rotate-90 rtl:rotate-90")} />
                        <span className="font-mono text-sm font-semibold" dir="ltr">
                          <MatchHighlight text={f.key} query={tokens} />
                        </span>
                      </button>
                      {stale(f) ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium">
                          <Sparkles aria-hidden="true" className="size-3" />
                          Ready to remove
                        </span>
                      ) : null}
                    </p>
                    <p className="text-muted-foreground mt-1 ps-6 text-sm text-pretty">
                      <MatchHighlight text={f.description} query={tokens} />
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 ps-6 lg:ps-0">
                    {envs.map((e) => (
                      <label key={e.id} className="flex items-center gap-2 text-sm">
                        <span className={cn(e.id === "production" && "font-medium")}>{e.label}</span>
                        <Switch size="sm" checked={f.enabled[e.id]} disabled={busy === f.id} onCheckedChange={(v) => toggle(f, e.id, v)} aria-label={`${f.key} in ${e.label}`} />
                      </label>
                    ))}
                  </div>
                </div>
                {error?.id === f.id ? (
                  <p role="alert" className="text-destructive border-t px-5 py-3 text-sm">
                    {error.text}
                  </p>
                ) : null}
                {isOpen ? (
                  <div id={`${id}-${f.id}`} className="bg-muted/30 grid gap-6 border-t p-5 sm:grid-cols-2">
                    <div>
                      <p id={`${id}-${f.id}-r`} className="text-sm font-medium">
                        Production rollout
                      </p>
                      <p className="text-muted-foreground mt-0.5 text-xs">{f.enabled.production ? "Share of users who get it when it is on." : "Switched off in Production, so nobody gets it yet."}</p>
                      <div className="mt-5 flex items-center gap-4">
                        <Slider aria-labelledby={`${id}-${f.id}-r`} min={0} max={100} step={5} value={[draft[f.id] ?? f.rollout]} onValueChange={([n]) => setDraft((d) => ({ ...d, [f.id]: n! }))} formatValue={(n) => `${n}%`} className="flex-1" />
                        <span className="w-12 text-end text-xl font-semibold tabular-nums">{draft[f.id] ?? f.rollout}%</span>
                      </div>
                      {dirty ? (
                        <div className="mt-4 flex items-center gap-2">
                          <Button size="sm" disabled={busy === f.id} onClick={() => { const n = { ...f, rollout: draft[f.id]!, changedDays: 0 }; setDraft((d) => { const { [f.id]: _drop, ...rest } = d; return rest }); void commit(f, n) }}>
                            {busy === f.id ? <Loader2 aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : null}
                            Save rollout
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setDraft((d) => { const { [f.id]: _drop, ...rest } = d; return rest })}>
                            Cancel
                          </Button>
                        </div>
                      ) : null}
                    </div>
                    <dl className="grid content-start gap-3 text-sm">
                      <div>
                        <dt className="text-muted-foreground text-xs font-medium">Gets it first</dt>
                        <dd className="mt-0.5">{f.rules ?? "No special rules. Everyone in the rollout."}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground text-xs font-medium">Owner</dt>
                        <dd className="mt-0.5">{f.owner}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground text-xs font-medium">Last changed</dt>
                        <dd className="mt-0.5">{f.changedDays === 0 ? "Just now" : f.changedDays === 1 ? "Yesterday" : `${f.changedDays} days ago`}</dd>
                      </div>
                    </dl>
                  </div>
                ) : null}
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="mt-3 rounded-2xl border border-dashed px-6 py-12 text-center">
          <p className="font-medium">No flags match</p>
          <p className="text-muted-foreground mt-1 text-sm">Try another word, or look at all flags.</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => { setQuery(""); setFilter("all") }}>
            Clear filters
          </Button>
        </div>
      )}
    </>
  )

  return (
    <section data-slot="flags-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-5xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-8">
        <h1 id={`${id}-title`} className="text-3xl font-semibold tracking-[-0.035em] text-balance">
          {title}
        </h1>
        <p className="text-muted-foreground mt-2 max-w-xl text-pretty">Ship code switched off, then turn it on for a few people before everyone.</p>
      </header>
      <StateView state={state === "loading" || state === "error" ? state : "ready"} onRetry={onRetry} label="Loading flags" loading={<Skel />} error={{ title: errorState?.title ?? "Flags could not be loaded", description: errorState?.description ?? "Nothing was changed. Check your connection and try again.", ...errorState }}>
        {content}
      </StateView>

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent {...ret}>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ShieldAlert aria-hidden="true" className="size-5" />
              Change Production?
            </AlertDialogTitle>
            <AlertDialogDescription>{confirm?.text}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction destructive={confirm ? !confirm.next.enabled.production : false} onClick={() => confirm && void commit(confirm.flag, confirm.next)}>
              {confirm?.next.enabled.production ? "Switch on" : "Switch off"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}

export { Flags1, type Flags1Props, type Flags1Flag, type Flags1Env }
