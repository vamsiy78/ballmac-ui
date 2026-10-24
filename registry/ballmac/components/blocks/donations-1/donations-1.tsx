// Ballmac UI: Donations 1. https://ui.ballmac.com/blocks/donations-1
"use client"

import * as React from "react"
import { Heart, Loader2 } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Donations1Cause = { id: string; name: string; /** What the money does. */ detail: string }
type Donations1Gift = { amount: number; cause: string; monthly: boolean; coverFees: boolean; name: string; email: string; anonymous: boolean }

type Donations1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    /** What a gift is worth in plain words, by amount: the amount in the preset list says what it does. */
    presets?: { amount: number; impact: string }[]
    causes?: Donations1Cause[]
    title?: string
    description?: string
    /** Raised so far and the goal, for the progress bar. */
    raised?: number
    goal?: number
    donors?: number
    /** ISO currency code. */
    currency?: string
    /** Share of a gift that card fees take, as a fraction. Offered as "cover the fees". */
    feeRate?: number
    /** Called with the gift. Reject and the form stays filled with the message. */
    onDonate?: (gift: Donations1Gift) => void | Promise<void>
  }

const presets = [
  { amount: 10, impact: "feeds a family for two days" },
  { amount: 25, impact: "stocks a school library shelf" },
  { amount: 50, impact: "pays for a week of clean water for a village" },
  { amount: 100, impact: "trains a community health worker" },
]
const causes: Donations1Cause[] = [
  { id: "water", name: "Clean water", detail: "Wells and filters for villages without a safe supply." },
  { id: "school", name: "Schools", detail: "Books, desks and teacher training." },
  { id: "any", name: "Where it is needed most", detail: "We put it where the gap is biggest this month." },
]

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <Skeleton className="h-64 rounded-2xl" />
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  )
}

/**
 * A donation page: what a gift does at each amount, once or every month, which cause, and whether to cover the card fees.
 * The total is always spelled out before the button, a custom amount is checked, and the thank you says what was given.
 */
function Donations1({ presets: ps = presets, causes: cs = causes, title = "Help us finish the job", description = "Every gift goes to the work. We publish where it went each quarter.", raised = 38400, goal = 50000, donors = 612, currency = "USD", feeRate = 0.03, onDonate, state = "ready", onRetry, emptyState, errorState, className, ...props }: Donations1Props) {
  const id = React.useId()
  const [monthly, setMonthly] = React.useState(false)
  const [preset, setPreset] = React.useState<number | "other">(ps[1]?.amount ?? 25)
  const [custom, setCustom] = React.useState("")
  const [cause, setCause] = React.useState(cs[0]?.id ?? "")
  const [fees, setFees] = React.useState(true)
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [anon, setAnon] = React.useState(false)
  const [tried, setTried] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [result, setResult] = React.useState<{ ok: boolean; text: string } | null>(null)
  const view = state === "ready" && ps.length === 0 ? "empty" : state
  const money = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: Number.isInteger(n) ? 0 : 2 }).format(n)

  const amount = preset === "other" ? Number.parseFloat(custom) : preset
  const validAmount = Number.isFinite(amount) && amount >= 1
  const feeAmount = validAmount ? Math.round(amount * feeRate * 100) / 100 : 0
  const total = validAmount ? Math.round((amount + (fees ? feeAmount : 0)) * 100) / 100 : 0
  const impact = ps.find((p) => p.amount === preset)?.impact
  const pct = Math.min(100, Math.round((raised / Math.max(goal, 1)) * 100))
  const emailBad = !/^\S+@\S+\.\S+$/.test(email)
  const nameBad = !anon && !name.trim()

  async function give(e: React.FormEvent) {
    e.preventDefault()
    setTried(true)
    if (!validAmount || emailBad || nameBad) return
    setBusy(true)
    setResult(null)
    try {
      await onDonate?.({ amount, cause, monthly, coverFees: fees, name: anon ? "" : name.trim(), email, anonymous: anon })
      setResult({ ok: true, text: `Thank you. ${money(total)}${monthly ? " a month" : ""} is on its way${impact && preset !== "other" ? `, and it ${impact}` : ""}. A receipt is coming to ${email}.` })
    } catch (err) {
      setResult({ ok: false, text: err instanceof Error ? err.message : "The gift was not made and you were not charged." })
    } finally {
      setBusy(false)
    }
  }

  const input = "bg-background focus-visible:ring-ring/50 h-11 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-[3px]"
  const pill = "bg-card peer-checked:border-foreground peer-checked:bg-accent/40 peer-focus-visible:ring-ring/50 block rounded-xl border px-4 py-3 text-center text-sm font-medium transition-colors peer-focus-visible:ring-[3px] motion-reduce:transition-none"

  return (
    <section data-slot="donations-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-5xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <StateView state={view} onRetry={onRetry} label="Loading the donation page" loading={<Skel />} empty={{ title: "Giving is not open yet", description: "There are no gift amounts set up.", ...emptyState }} error={{ title: "The donation page could not be loaded", description: "You were not charged. Check your connection and try again.", ...errorState }}>
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-12">
          <div className="grid gap-6">
            <div>
              <h1 id={`${id}-title`} className="text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl">{title}</h1>
              <p className="text-muted-foreground mt-3 text-pretty">{description}</p>
            </div>
            <div className="bg-card rounded-2xl border p-5">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-2xl font-semibold tabular-nums">{money(raised)}</p>
                <p className="text-muted-foreground text-sm tabular-nums">of {money(goal)}</p>
              </div>
              <div role="progressbar" aria-label="Raised so far" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-valuetext={`${pct}% of the goal`} className="bg-muted mt-3 h-2.5 overflow-hidden rounded-full">
                <div className="bg-foreground h-full rounded-full transition-[width] motion-reduce:transition-none" style={{ width: `${pct}%` }} />
              </div>
              <p className="text-muted-foreground mt-3 text-sm tabular-nums">{pct}% there · {donors.toLocaleString("en-US")} people have given</p>
            </div>
          </div>

          <form onSubmit={(e) => void give(e)} noValidate className="bg-card grid gap-6 rounded-2xl border p-5 sm:p-6">
            <fieldset>
              <legend className="sr-only">How often</legend>
              <div className="bg-muted grid grid-cols-2 gap-1 rounded-xl p-1">
                {[false, true].map((m) => (
                  <label key={String(m)} className="relative cursor-pointer">
                    <input type="radio" name={`${id}-freq`} checked={monthly === m} onChange={() => setMonthly(m)} className="peer sr-only" />
                    <span className="peer-checked:bg-background peer-checked:shadow-xs peer-focus-visible:ring-ring/50 block rounded-lg py-2 text-center text-sm font-medium transition-colors peer-focus-visible:ring-[3px] motion-reduce:transition-none">{m ? "Every month" : "Once"}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-3 text-sm font-medium">Amount</legend>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
                {ps.map((p) => (
                  <label key={p.amount} className="relative cursor-pointer">
                    <input type="radio" name={`${id}-amt`} checked={preset === p.amount} onChange={() => setPreset(p.amount)} className="peer sr-only" />
                    <span className={cn(pill, "tabular-nums")}>{money(p.amount)}</span>
                  </label>
                ))}
                <label className="relative cursor-pointer">
                  <input type="radio" name={`${id}-amt`} checked={preset === "other"} onChange={() => setPreset("other")} className="peer sr-only" />
                  <span className={pill}>Other</span>
                </label>
              </div>
              {preset === "other" && (
                <div className="mt-3">
                  <label htmlFor={`${id}-custom`} className="text-muted-foreground mb-1.5 block text-xs">Your amount</label>
                  <input id={`${id}-custom`} inputMode="decimal" autoFocus value={custom} onChange={(e) => setCustom(e.target.value)} aria-invalid={tried && !validAmount} aria-describedby={tried && !validAmount ? `${id}-amt-err` : undefined} className={cn(input, "tabular-nums")} placeholder="35" />
                  {tried && !validAmount && <p id={`${id}-amt-err`} role="alert" className="text-destructive mt-1.5 text-sm font-medium">Enter an amount of at least {money(1)}.</p>}
                </div>
              )}
              <p aria-live="polite" className="text-muted-foreground mt-3 flex min-h-5 items-center gap-2 text-sm"><Heart aria-hidden="true" className="size-3.5 shrink-0" />{impact && preset !== "other" ? `${money(preset as number)} ${impact}.` : "Every gift counts."}</p>
            </fieldset>

            {cs.length > 1 && (
              <div>
                <label htmlFor={`${id}-cause`} className="mb-1.5 block text-sm font-medium">Where it goes</label>
                <select id={`${id}-cause`} value={cause} onChange={(e) => setCause(e.target.value)} className={input}>
                  {cs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <p className="text-muted-foreground mt-1.5 text-xs">{cs.find((c) => c.id === cause)?.detail}</p>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor={`${id}-name`} className="mb-1.5 block text-sm font-medium">Name</label>
                <input id={`${id}-name`} autoComplete="name" disabled={anon} value={name} onChange={(e) => setName(e.target.value)} aria-invalid={tried && nameBad} aria-describedby={tried && nameBad ? `${id}-name-err` : undefined} className={cn(input, "disabled:opacity-50")} />
                {tried && nameBad && <p id={`${id}-name-err`} role="alert" className="text-destructive mt-1.5 text-sm font-medium">Enter your name, or give anonymously.</p>}
              </div>
              <div>
                <label htmlFor={`${id}-email`} className="mb-1.5 block text-sm font-medium">Email for the receipt</label>
                <input id={`${id}-email`} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={tried && emailBad} aria-describedby={tried && emailBad ? `${id}-email-err` : undefined} className={input} />
                {tried && emailBad && <p id={`${id}-email-err`} role="alert" className="text-destructive mt-1.5 text-sm font-medium">Enter an email address like name@example.com.</p>}
              </div>
            </div>

            <div className="grid gap-2.5 text-sm">
              <label className="flex items-start gap-2.5"><input type="checkbox" checked={anon} onChange={(e) => setAnon(e.target.checked)} className="mt-0.5 size-4" /><span>Give anonymously. Your name is not shown or kept.</span></label>
              <label className="flex items-start gap-2.5"><input type="checkbox" checked={fees} onChange={(e) => setFees(e.target.checked)} className="mt-0.5 size-4" /><span>Add {validAmount ? money(feeAmount) : `${Math.round(feeRate * 100)}%`} to cover card fees, so all of {validAmount ? money(amount) : "your gift"} reaches the work.</span></label>
            </div>

            <div className="border-t pt-4">
              <p className="flex items-baseline justify-between gap-3 text-sm"><span className="text-muted-foreground">You give</span><span className="text-lg font-semibold tabular-nums">{validAmount ? money(total) : "–"}{monthly && validAmount ? " a month" : ""}</span></p>
              <Button type="submit" size="lg" className="mt-3 w-full" disabled={busy || result?.ok === true}>
                {busy ? <Loader2 aria-hidden="true" className="animate-spin" /> : <Heart aria-hidden="true" />} {monthly ? "Give every month" : "Give now"}
              </Button>
              <p aria-live="polite" role={result && !result.ok ? "alert" : undefined} className={cn("mt-3 text-sm", result && !result.ok ? "text-destructive font-medium" : "text-muted-foreground")}>{result?.text}</p>
            </div>
          </form>
        </div>
      </StateView>
    </section>
  )
}

export { Donations1, type Donations1Cause, type Donations1Gift, type Donations1Props }
