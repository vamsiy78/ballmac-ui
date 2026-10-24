// Ballmac UI: Secrets 1. https://ui.ballmac.com/blocks/secrets-1
"use client"

import * as React from "react"
import { KeyRound, Loader2, RefreshCw, Search, ShieldAlert } from "lucide-react"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ballmac/alert-dialog"
import { Button } from "@/components/ballmac/button"
import { MatchHighlight, matchesAll, queryTokens } from "@/components/ballmac/match-highlight"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { useReturnFocus } from "@/lib/ballmac/return-focus"
import { cn } from "@/lib/utils"

type Secrets1Env = "production" | "staging" | "development"

type Secrets1Secret = {
  id: string
  /** The name code reads it by, for example "STRIPE_SECRET_KEY". Values are never shown. */
  name: string
  environment: Secrets1Env
  owner: string
  /** Days since it was last changed. */
  rotatedDays: number
  /** When it was last read by something, already formatted, such as "2 hours ago". */
  lastUsed: string
  /** What reads it, such as "billing-api". */
  usedBy?: string
}

type Secrets1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    secrets?: Secrets1Secret[]
    title?: string
    /** A secret not changed for this many days is called out. */
    maxAgeDays?: number
    /** Called after the confirmation. Return a promise; reject and the secret stays as it was with the message. */
    onRotate?: (secret: Secrets1Secret) => void | Promise<void>
  }

const sample: Secrets1Secret[] = [
  { id: "k1", name: "STRIPE_SECRET_KEY", environment: "production", owner: "Billing", rotatedDays: 214, lastUsed: "4 minutes ago", usedBy: "billing-api" },
  { id: "k2", name: "DATABASE_URL", environment: "production", owner: "Platform", rotatedDays: 61, lastUsed: "Just now", usedBy: "api, workers" },
  { id: "k3", name: "OPENAI_API_KEY", environment: "production", owner: "AI", rotatedDays: 33, lastUsed: "12 minutes ago", usedBy: "assistant" },
  { id: "k4", name: "SENDGRID_API_KEY", environment: "production", owner: "Growth", rotatedDays: 128, lastUsed: "2 hours ago", usedBy: "notifications" },
  { id: "k5", name: "STRIPE_SECRET_KEY", environment: "staging", owner: "Billing", rotatedDays: 19, lastUsed: "Yesterday", usedBy: "billing-api" },
  { id: "k6", name: "JWT_SIGNING_KEY", environment: "production", owner: "Platform", rotatedDays: 97, lastUsed: "Just now", usedBy: "auth" },
  { id: "k7", name: "S3_ACCESS_KEY", environment: "development", owner: "Platform", rotatedDays: 340, lastUsed: "3 weeks ago" },
]

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-2">
      <Skeleton className="h-10 rounded-lg" />
      {[0, 1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-16 rounded-lg" />
      ))}
    </div>
  )
}

/**
 * An inventory of secrets that never shows a value: the name, where it runs, who owns it, how long since it was changed and when it was last read. Old ones are
 * called out in words, and Rotate asks first and says what happens. Search, an environment filter and an oldest-first order help find the ones that matter.
 */
function Secrets1({ secrets: secretsProp = sample, title = "Secrets", maxAgeDays = 90, onRotate, state = "ready", onRetry, emptyState, errorState, className, ...props }: Secrets1Props) {
  const id = React.useId()
  const [secrets, setSecrets] = React.useState(secretsProp)
  React.useEffect(() => setSecrets(secretsProp), [secretsProp])
  const [query, setQuery] = React.useState("")
  const [env, setEnv] = React.useState<Secrets1Env | "all">("all")
  const [oldestFirst, setOldestFirst] = React.useState(true)
  const [confirm, setConfirm] = React.useState<Secrets1Secret | null>(null)
  const [busy, setBusy] = React.useState<string | null>(null)
  const [note, setNote] = React.useState<{ ok: boolean; text: string } | null>(null)
  const ret = useReturnFocus(!!confirm)
  const tokens = queryTokens(query)
  const view = state === "ready" && secrets.length === 0 ? "empty" : state
  const stale = (s: Secrets1Secret) => s.rotatedDays >= maxAgeDays
  const shown = secrets
    .filter((s) => (env === "all" || s.environment === env) && (!tokens.length || matchesAll(`${s.name} ${s.owner} ${s.usedBy ?? ""}`, tokens)))
    .sort((a, b) => (oldestFirst ? b.rotatedDays - a.rotatedDays : a.rotatedDays - b.rotatedDays))
  const staleCount = secrets.filter(stale).length

  async function rotate(s: Secrets1Secret) {
    setBusy(s.id)
    setNote(null)
    try {
      await onRotate?.(s)
      setSecrets((l) => l.map((x) => (x.id === s.id ? { ...x, rotatedDays: 0 } : x)))
      setNote({ ok: true, text: `${s.name} in ${s.environment} was rotated. Things that read it pick up the new value on their next start.` })
    } catch (e) {
      setNote({ ok: false, text: e instanceof Error ? e.message : `${s.name} could not be rotated, so it is as it was.` })
    } finally {
      setBusy(null)
    }
  }

  return (
    <section data-slot="secrets-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-5xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-8">
        <h1 id={`${id}-title`} className="text-3xl font-semibold tracking-[-0.035em] text-balance">
          {title}
        </h1>
        <p className="text-muted-foreground mt-2 max-w-xl text-pretty">Where every secret runs and how old it is. Values are never shown here.</p>
      </header>
      <StateView state={view} onRetry={onRetry} label="Loading secrets" loading={<Skel />} empty={{ title: "No secrets yet", description: "Secrets your services read will be listed here, without their values.", ...emptyState }} error={{ title: "Secrets could not be loaded", description: "Nothing was rotated or changed. Check your connection and try again.", ...errorState }}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="bg-background focus-within:ring-ring/50 flex h-10 flex-1 items-center gap-2 rounded-lg border px-3 focus-within:ring-[3px]">
            <Search aria-hidden="true" className="text-muted-foreground size-4" />
            <input type="search" aria-label="Search secrets" placeholder="Search by name, owner or service" value={query} onChange={(e) => setQuery(e.target.value)} className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-sm outline-none" />
          </div>
          <select aria-label="Environment" value={env} onChange={(e) => setEnv(e.target.value as Secrets1Env | "all")} className="bg-background focus-visible:ring-ring/50 h-10 rounded-lg border px-3 text-sm outline-none focus-visible:ring-[3px]">
            <option value="all">All environments</option>
            <option value="production">Production</option>
            <option value="staging">Staging</option>
            <option value="development">Development</option>
          </select>
          <Button variant="outline" aria-pressed={oldestFirst} onClick={() => setOldestFirst((v) => !v)}>{oldestFirst ? "Oldest first" : "Newest first"}</Button>
        </div>
        <p aria-live="polite" className="text-muted-foreground mt-4 text-sm">
          {shown.length} {shown.length === 1 ? "secret" : "secrets"}
          {staleCount > 0 && <> · <strong className="text-foreground">{staleCount} not changed for {maxAgeDays} days or more</strong></>}
        </p>
        {note && <p role={note.ok ? "status" : "alert"} className={cn("mt-2 text-sm font-medium", !note.ok && "text-destructive")}>{note.text}</p>}

        {shown.length ? (
          <ul className="mt-3 grid gap-2.5">
            {shown.map((s) => (
              <li key={s.id} data-stale={stale(s) || undefined} className={cn("bg-card flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-xl border p-4", stale(s) && "border-chart-3/70")}>
                <div className="flex min-w-0 items-start gap-3">
                  <span aria-hidden="true" className="bg-muted mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg"><KeyRound className="size-4" /></span>
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <code className="font-mono text-sm font-semibold" dir="ltr"><MatchHighlight text={s.name} query={tokens} /></code>
                      <span className="rounded-full border px-2 py-px text-[11px] capitalize">{s.environment}</span>
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">Owner: <MatchHighlight text={s.owner} query={tokens} />{s.usedBy ? <> · Read by <MatchHighlight text={s.usedBy} query={tokens} /></> : " · Not read by anything lately"} · Last read {s.lastUsed.toLowerCase()}</p>
                    <p className={cn("mt-1.5 flex items-center gap-1.5 text-xs tabular-nums", stale(s) ? "text-foreground font-medium" : "text-muted-foreground")}>
                      {stale(s) && <ShieldAlert aria-hidden="true" className="text-chart-3 size-3.5" />}
                      {s.rotatedDays === 0 ? "Changed today" : `Not changed for ${s.rotatedDays} ${s.rotatedDays === 1 ? "day" : "days"}`}
                      {stale(s) && " · due for rotation"}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant={stale(s) ? "default" : "outline"} disabled={busy === s.id} onClick={() => setConfirm(s)} aria-label={`Rotate ${s.name} in ${s.environment}`}>
                  {busy === s.id ? <Loader2 aria-hidden="true" className="animate-spin" /> : <RefreshCw aria-hidden="true" />} Rotate
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground mt-3 rounded-xl border border-dashed px-4 py-12 text-center text-sm">No secrets match. Try another search or environment.</p>
        )}
      </StateView>

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent {...ret}>
          <AlertDialogHeader>
            <AlertDialogTitle>Rotate {confirm?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              A new value is created for {confirm?.environment}. {confirm?.usedBy ? `${confirm.usedBy} picks` : "Anything that reads it picks"} it up on its next start, so check that it can restart cleanly first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirm && void rotate(confirm)}>Rotate</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}

export { Secrets1, type Secrets1Env, type Secrets1Props, type Secrets1Secret }
