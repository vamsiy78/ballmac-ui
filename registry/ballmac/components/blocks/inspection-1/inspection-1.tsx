// Ballmac UI: Inspection 1. https://ui.ballmac.com/blocks/inspection-1
"use client"

import * as React from "react"
import { Camera, CircleCheck, Loader2, X } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Inspection1Answer = "pass" | "fail" | "na"
type Inspection1Item = { id: string; text: string; /** What to look for. */ hint?: string }
type Inspection1Section = { id: string; title: string; items: Inspection1Item[] }
type Inspection1Result = Record<string, { answer: Inspection1Answer; note?: string; photos?: string[] }>

type Inspection1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    inspection?: { title: string; site: string; inspector: string; sections: Inspection1Section[] } | null
    /** Answers already given. */
    defaultResult?: Inspection1Result
    /** Called with every answer when the inspection is submitted. Reject and it stays open with the message. */
    onSubmit?: (result: Inspection1Result) => void | Promise<void>
  }

const sample = {
  title: "Monthly kitchen safety inspection",
  site: "Harbour Street kitchen",
  inspector: "Marcus Bell",
  sections: [
    { id: "cold", title: "Cold storage", items: [{ id: "c1", text: "Fridge reads 5 °C or below", hint: "Check the display and the probe thermometer." }, { id: "c2", text: "Freezer reads −18 °C or below" }, { id: "c3", text: "Raw and cooked food are kept apart", hint: "Raw meat on the lowest shelf." }] },
    { id: "clean", title: "Cleaning", items: [{ id: "k1", text: "Work surfaces are clean and dry" }, { id: "k2", text: "Hand-wash sink has soap and paper towels" }, { id: "k3", text: "Cleaning chemicals are labelled and stored away from food" }] },
    { id: "fire", title: "Fire safety", items: [{ id: "f1", text: "Exits are clear", hint: "Nothing stored in front of a door or on a route." }, { id: "f2", text: "Extinguisher is in date and in place" }] },
  ],
}

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-4">
      <Skeleton className="h-16 rounded-xl" />
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-40 rounded-xl" />
      ))}
    </div>
  )
}

const ANSWERS: { id: Inspection1Answer; label: string }[] = [{ id: "pass", label: "Pass" }, { id: "fail", label: "Fail" }, { id: "na", label: "Not applicable" }]

/**
 * A checklist inspection for a site visit: every item answered Pass, Fail or Not applicable, a note that is required when something fails, photos that can be
 * attached, and a running count of what is left and what failed. It can only be submitted when every item has an answer and every failure has a note.
 */
function Inspection1({ inspection = sample, defaultResult = {}, onSubmit, state = "ready", onRetry, emptyState, errorState, className, ...props }: Inspection1Props) {
  const id = React.useId()
  const [result, setResult] = React.useState<Inspection1Result>(defaultResult)
  const [busy, setBusy] = React.useState(false)
  const [message, setMessage] = React.useState<{ ok: boolean; text: string } | null>(null)
  const [tried, setTried] = React.useState(false)
  const view = state === "ready" && !inspection ? "empty" : state
  const items = inspection?.sections.flatMap((s) => s.items) ?? []
  const answered = items.filter((i) => result[i.id]).length
  const fails = items.filter((i) => result[i.id]?.answer === "fail")
  const missingNotes = fails.filter((i) => !result[i.id]?.note?.trim())
  const ready = items.length > 0 && answered === items.length && missingNotes.length === 0

  const set = (itemId: string, patch: Partial<Inspection1Result[string]>) => {
    setMessage(null)
    setResult((r) => ({ ...r, [itemId]: { ...(r[itemId] ?? { answer: "pass" }), ...patch } as Inspection1Result[string] }))
  }
  async function submit() {
    setTried(true)
    if (!ready) return
    setBusy(true)
    setMessage(null)
    try {
      await onSubmit?.(result)
      setMessage({ ok: true, text: fails.length ? `Inspection submitted with ${fails.length} ${fails.length === 1 ? "failure" : "failures"} to follow up.` : "Inspection submitted. Everything passed." })
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : "The inspection was not submitted. Your answers are still here." })
    } finally {
      setBusy(false)
    }
  }

  return (
    <section data-slot="inspection-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-3xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <StateView state={view} onRetry={onRetry} label="Loading the inspection" loading={<Skel />} empty={{ title: "No inspection to do", description: "When one is scheduled for you it will open here.", ...emptyState }} error={{ title: "The inspection could not be loaded", description: "Nothing was submitted. Check your connection and try again.", ...errorState }}>
        {inspection && (
          <>
            <header className="mb-6">
              <h1 id={`${id}-title`} className="text-3xl font-semibold tracking-[-0.035em] text-balance">{inspection.title}</h1>
              <p className="text-muted-foreground mt-2">{inspection.site} · inspector {inspection.inspector}</p>
            </header>
            <div className="bg-card mb-6 grid gap-2.5 rounded-xl border p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                <p className="font-medium tabular-nums">{answered} of {items.length} answered</p>
                <p aria-live="polite" className={cn("text-xs tabular-nums", fails.length ? "text-foreground font-medium" : "text-muted-foreground")}>{fails.length ? `${fails.length} failed` : "No failures so far"}</p>
              </div>
              <div role="meter" aria-label="Items answered" aria-valuemin={0} aria-valuemax={items.length} aria-valuenow={answered} aria-valuetext={`${answered} of ${items.length} answered`} className="bg-muted h-2 overflow-hidden rounded-full">
                <div className="bg-foreground h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${items.length ? (answered / items.length) * 100 : 0}%` }} />
              </div>
            </div>

            <div className="grid gap-6">
              {inspection.sections.map((sec) => (
                <section key={sec.id} aria-labelledby={`${id}-${sec.id}`}>
                  <h2 id={`${id}-${sec.id}`} className="mb-3 text-lg font-semibold tracking-tight">{sec.title}</h2>
                  <ul className="grid gap-3">
                    {sec.items.map((it) => {
                      const r = result[it.id]
                      const needsNote = r?.answer === "fail" && !r.note?.trim()
                      const unanswered = tried && !r
                      return (
                        <li key={it.id} data-answer={r?.answer} className={cn("bg-card rounded-xl border p-4", r?.answer === "fail" && "border-destructive/60")}>
                          <fieldset>
                            <legend className="text-sm font-medium">{it.text}</legend>
                            {it.hint && <p className="text-muted-foreground mt-0.5 text-xs">{it.hint}</p>}
                            <div className="bg-muted/60 mt-3 inline-flex rounded-full p-0.5">
                              {ANSWERS.map((a) => (
                                <label key={a.id} className="relative cursor-pointer">
                                  <input type="radio" name={`${id}-${it.id}`} value={a.id} checked={r?.answer === a.id} onChange={() => set(it.id, { answer: a.id })} className="peer sr-only" />
                                  <span className={cn("peer-focus-visible:ring-ring/50 block rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors peer-focus-visible:ring-[3px] motion-reduce:transition-none", r?.answer === a.id ? (a.id === "fail" ? "bg-destructive text-white" : "bg-foreground text-background") : "text-muted-foreground hover:text-foreground")}>{a.label}</span>
                                </label>
                              ))}
                            </div>
                            {unanswered && <p role="alert" className="text-destructive mt-2 text-xs font-medium">Answer this item.</p>}
                            {r?.answer === "fail" && (
                              <div className="mt-3 grid gap-2">
                                <label htmlFor={`${id}-${it.id}-note`} className="text-xs font-medium">What is wrong? <span className="text-muted-foreground font-normal">Required for a failure.</span></label>
                                <textarea id={`${id}-${it.id}-note`} value={r.note ?? ""} onChange={(e) => set(it.id, { note: e.target.value })} aria-invalid={tried && needsNote} rows={2} className="aria-invalid:border-destructive bg-background focus-visible:ring-ring/50 w-full resize-y rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-[3px]" />
                                {tried && needsNote && <p role="alert" className="text-destructive text-xs font-medium">Say what is wrong so someone can fix it.</p>}
                                <div className="flex flex-wrap items-center gap-2">
                                  <label className="focus-within:ring-ring/50 hover:bg-accent inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border px-3 text-xs font-medium focus-within:ring-[3px]">
                                    <Camera aria-hidden="true" className="size-3.5" /> Add a photo
                                    <input type="file" accept="image/*" multiple className="sr-only" aria-label={`Add photos for ${it.text}`} onChange={(e) => { const names = [...(e.target.files ?? [])].map((f) => f.name); if (names.length) set(it.id, { photos: [...(r.photos ?? []), ...names] }); e.target.value = "" }} />
                                  </label>
                                  {(r.photos ?? []).map((p) => (
                                    <span key={p} className="bg-muted inline-flex items-center gap-1 rounded-full py-0.5 ps-2.5 pe-1 text-xs">
                                      {p}
                                      <button type="button" aria-label={`Remove ${p}`} onClick={() => set(it.id, { photos: (r.photos ?? []).filter((x) => x !== p) })} className="hover:bg-accent focus-visible:ring-ring/50 flex size-5 items-center justify-center rounded-full outline-none focus-visible:ring-[3px]"><X aria-hidden="true" className="size-3" /></button>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </fieldset>
                        </li>
                      )
                    })}
                  </ul>
                </section>
              ))}
            </div>

            <div className="bg-background/90 sticky bottom-3 mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-3 shadow-lg backdrop-blur">
              <p aria-live="polite" role={message && !message.ok ? "alert" : undefined} className={cn("flex items-center gap-2 text-sm", message && !message.ok && "text-destructive font-medium")}>
                {message?.ok && <CircleCheck aria-hidden="true" className="size-4" />}
                {message ? message.text : answered < items.length ? `${items.length - answered} still to answer.` : missingNotes.length ? `${missingNotes.length} ${missingNotes.length === 1 ? "failure needs" : "failures need"} a note.` : "Ready to submit."}
              </p>
              <Button disabled={busy || message?.ok === true} onClick={() => void submit()}>
                {busy && <Loader2 aria-hidden="true" className="animate-spin" />} Submit inspection
              </Button>
            </div>
          </>
        )}
      </StateView>
    </section>
  )
}

export { Inspection1, type Inspection1Answer, type Inspection1Item, type Inspection1Props, type Inspection1Result, type Inspection1Section }
