// Ballmac UI: Survey 1. https://ui.ballmac.com/blocks/survey-1
"use client"

import * as React from "react"
import { ArrowLeft, ArrowRight, CircleAlert, Heart, Loader2, PartyPopper } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { Textarea } from "@/components/ballmac/textarea"
import { formPhase, type FormStateProps } from "@/lib/ballmac/use-resource"
import { cn } from "@/lib/utils"

type Survey1Result = { score: number; reasons: string[]; comment: string; mayContact: boolean }

type Survey1Props = Omit<React.ComponentProps<"section">, "title" | "onSubmit"> &
  FormStateProps & {
    /** The product the question is about. */
    product?: string
    /** Reasons offered to people who gave a low or middling score. */
    lowReasons?: string[]
    /** Reasons offered to people who gave a high score. */
    highReasons?: string[]
    /** The question shown first (0 to 2). */
    defaultStep?: 0 | 1 | 2
    /** A score chosen at first. */
    defaultScore?: number
    /** Called with the answers. Return a promise; reject to show an error and keep what was typed. */
    onSubmit?: (result: Survey1Result) => void | Promise<void>
  }

const low = ["It is hard to learn", "Too slow", "Missing something I need", "Too expensive", "Bugs or crashes", "Support was slow"]
const high = ["Easy to use", "Saves me time", "Looks great", "Great support", "Good value", "Does exactly what I need"]

// What the score means to the person, in their words rather than a bucket name.
const mood = (n: number) => (n <= 6 ? "We missed the mark" : n <= 8 ? "Good, but not great" : "You are a fan")

/**
 * A short feedback survey on one card: the 0 to 10 question as big buttons, then a follow-up that changes with the answer (what went wrong,
 * or what is working), then an optional comment. A progress bar says where you are, Back keeps your answers, and a failed send keeps what
 * you typed.
 */
function Survey1({
  product = "Acme",
  lowReasons = low,
  highReasons = high,
  defaultStep = 0,
  defaultScore,
  onSubmit,
  state: stateProp,
  errorState,
  className,
  ...props
}: Survey1Props) {
  const id = React.useId()
  const [step, setStep] = React.useState<number>(defaultStep)
  const [score, setScore] = React.useState<number | null>(defaultScore ?? null)
  const [reasons, setReasons] = React.useState<string[]>([])
  const [comment, setComment] = React.useState("")
  const [mayContact, setMayContact] = React.useState(false)
  const [internal, setInternal] = React.useState<"idle" | "sending" | "done" | "error">("idle")
  const state = formPhase(stateProp) ?? internal
  const headingRef = React.useRef<HTMLHeadingElement>(null)
  const first = React.useRef(true)
  const happy = (score ?? 0) >= 9
  const choices = happy ? highReasons : lowReasons

  // Move focus to the new step's heading so a keyboard or screen-reader user is not left on a button that is gone.
  React.useEffect(() => {
    if (first.current) first.current = false
    else headingRef.current?.focus()
  }, [step, state])

  const pickScore = (n: number) => {
    if (score !== null && (score >= 9) !== (n >= 9)) setReasons([])
    setScore(n)
  }
  const toggle = (r: string) => setReasons((rs) => (rs.includes(r) ? rs.filter((x) => x !== r) : [...rs, r]))

  async function send() {
    if (score === null) return
    setInternal("sending")
    try {
      if (onSubmit) await onSubmit({ score, reasons, comment: comment.trim(), mayContact })
      else await new Promise((r) => setTimeout(r, 800))
      setInternal("done")
    } catch {
      setInternal("error")
    }
  }

  const sending = state === "sending"
  const progress = state === "done" ? 100 : ((step + 1) / 3) * 100

  return (
    <section data-slot="survey-1" aria-labelledby={`${id}-h`} aria-busy={sending} className={cn("mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 sm:py-20", className)} {...props}>
      <div className="bg-card overflow-hidden rounded-3xl border shadow-sm">
        <div role="progressbar" aria-label="Survey progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)} className="bg-muted h-1.5">
          <div className="bg-foreground h-full transition-[width] duration-500 ease-out motion-reduce:transition-none" style={{ width: `${progress}%` }} />
        </div>

        <div className="p-6 sm:p-10">
          {state === "done" ? (
            <div role="status" className="py-6 text-center">
              <span aria-hidden="true" className="bg-chart-2/15 mx-auto flex size-14 items-center justify-center rounded-full">
                {happy ? <Heart className="size-7" /> : <PartyPopper className="size-7" />}
              </span>
              <h2 id={`${id}-h`} ref={headingRef} tabIndex={-1} className="mt-6 text-2xl font-semibold tracking-tight outline-none">
                Thank you
              </h2>
              <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-pretty">
                {happy ? `That means a lot to the whole ${product} team.` : `Someone on the ${product} team will read this, and ${mayContact ? "may write back." : "it will shape what we fix next."}`}
              </p>
            </div>
          ) : (
            <>
              <p className="text-muted-foreground text-sm font-medium tabular-nums">Question {step + 1} of 3</p>

              {step === 0 ? (
                <div>
                  <h2 id={`${id}-h`} ref={headingRef} tabIndex={-1} className="mt-2 text-2xl font-semibold tracking-tight text-balance outline-none sm:text-3xl">
                    How likely are you to recommend {product} to a friend or colleague?
                  </h2>
                  <div role="radiogroup" aria-labelledby={`${id}-h`} className="mt-8 grid grid-cols-6 gap-2 sm:grid-cols-11">
                    {Array.from({ length: 11 }, (_, n) => (
                      <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={score === n}
                        aria-label={`${n}${n === 0 ? ", not at all likely" : n === 10 ? ", extremely likely" : ""}`}
                        onClick={() => pickScore(n)}
                        onKeyDown={(e) => {
                          const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0
                          if (!d) return
                          e.preventDefault()
                          const next = Math.max(0, Math.min(10, (score ?? n) + d))
                          pickScore(next)
                          ;(e.currentTarget.parentElement?.children[next] as HTMLElement | undefined)?.focus()
                        }}
                        tabIndex={score === n || (score === null && n === 0) ? 0 : -1}
                        className={cn(
                          "focus-visible:ring-ring/50 aspect-square rounded-xl border text-lg font-semibold tabular-nums outline-none transition-all duration-150 focus-visible:ring-[3px] motion-reduce:transition-none sm:aspect-[3/4]",
                          score === n ? "bg-foreground text-background border-foreground scale-105 shadow-md" : "hover:bg-accent hover:border-foreground/30"
                        )}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <div aria-hidden="true" className="text-muted-foreground mt-3 flex justify-between text-xs">
                    <span>Not at all likely</span>
                    <span>Extremely likely</span>
                  </div>
                  <p aria-live="polite" className={cn("mt-6 h-6 text-center text-sm font-medium transition-opacity motion-reduce:transition-none", score === null && "opacity-0")}>
                    {score === null ? "" : mood(score)}
                  </p>
                </div>
              ) : null}

              {step === 1 ? (
                <div>
                  <h2 id={`${id}-h`} ref={headingRef} tabIndex={-1} className="mt-2 text-2xl font-semibold tracking-tight text-balance outline-none sm:text-3xl">
                    {happy ? "What do you like most?" : "What got in your way?"}
                  </h2>
                  <p className="text-muted-foreground mt-2 text-sm">Choose any that fit.</p>
                  <div role="group" aria-labelledby={`${id}-h`} className="mt-6 flex flex-wrap gap-2.5">
                    {choices.map((r) => (
                      <button
                        key={r}
                        type="button"
                        aria-pressed={reasons.includes(r)}
                        onClick={() => toggle(r)}
                        className={cn("focus-visible:ring-ring/50 rounded-full border px-4 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px] motion-reduce:transition-none", reasons.includes(r) ? "bg-foreground text-background border-foreground" : "hover:bg-accent")}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {step === 2 ? (
                <div>
                  <h2 id={`${id}-h`} ref={headingRef} tabIndex={-1} className="mt-2 text-2xl font-semibold tracking-tight text-balance outline-none sm:text-3xl">
                    Anything you would like to add?
                  </h2>
                  <label htmlFor={`${id}-c`} className="text-muted-foreground mt-2 block text-sm">
                    Optional. A sentence is plenty.
                  </label>
                  <Textarea id={`${id}-c`} value={comment} onChange={(e) => setComment(e.target.value)} rows={5} maxLength={1000} disabled={sending} className="mt-4" />
                  <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm">
                    <input type="checkbox" checked={mayContact} onChange={(e) => setMayContact(e.target.checked)} disabled={sending} className="accent-foreground mt-0.5 size-4" />
                    <span>You may contact me about this answer.</span>
                  </label>
                  {state === "error" ? (
                    <p role="alert" className="text-destructive mt-5 flex items-start gap-2 text-sm">
                      <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                      {errorState?.description ?? "We could not send your answers. Nothing you typed was lost, so try again."}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div className="mt-10 flex items-center justify-between gap-3">
                <Button variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={step === 0 || sending} className={cn(step === 0 && "invisible")}>
                  <ArrowLeft aria-hidden="true" className="rtl:rotate-180" />
                  Back
                </Button>
                {step < 2 ? (
                  <Button onClick={() => setStep((s) => s + 1)} disabled={step === 0 && score === null} aria-describedby={step === 0 && score === null ? `${id}-need` : undefined}>
                    Next
                    <ArrowRight aria-hidden="true" className="rtl:rotate-180" />
                  </Button>
                ) : (
                  <Button onClick={send} disabled={sending}>
                    {sending ? <Loader2 aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : null}
                    {sending ? "Sending" : state === "error" ? "Try again" : "Send"}
                  </Button>
                )}
              </div>
              {step === 0 && score === null ? (
                <p id={`${id}-need`} className="sr-only">
                  Choose a number to continue.
                </p>
              ) : null}
            </>
          )}
        </div>
      </div>
    </section>
  )
}

export { Survey1, type Survey1Props, type Survey1Result }
