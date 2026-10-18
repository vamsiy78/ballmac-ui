// Ballmac UI: Quiz 1. https://ui.ballmac.com/blocks/quiz-1
"use client"

import * as React from "react"
import { ArrowRight, Check, CircleAlert, CircleCheck, RotateCcw, X } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { cn } from "@/lib/utils"

type Quiz1Question = {
  id: string
  prompt: string
  options: { id: string; text: string }[]
  /** The id of the right option, or ids when more than one is right. */
  answer: string | string[]
  /** Why it is right, shown after checking. */
  explanation?: string
}

type Quiz1Result = { score: number; total: number; passed: boolean; answers: Record<string, string[]> }

type Quiz1Props = Omit<React.ComponentProps<"section">, "title" | "onSubmit"> & {
  title?: string
  questions?: Quiz1Question[]
  /** Share needed to pass, from 0 to 1. */
  passMark?: number
  /** Called once when the last answer is checked. */
  onComplete?: (result: Quiz1Result) => void
  /** Start on the result with these answers (question id to chosen option ids), for showing the end screen. */
  defaultAnswers?: Record<string, string[]>
}

const sample: Quiz1Question[] = [
  { id: "q1", prompt: "A task has no due date and nobody assigned. What is the first thing to do?", options: [{ id: "a", text: "Give it the earliest date you can" }, { id: "b", text: "Decide who owns it" }, { id: "c", text: "Leave it until someone asks" }, { id: "d", text: "Split it into five smaller tasks" }], answer: "b", explanation: "Work without an owner does not move. A date can follow once someone is responsible." },
  { id: "q2", prompt: "Which of these make an estimate more reliable? Choose all that apply.", options: [{ id: "a", text: "Using how long similar work took before" }, { id: "b", text: "Asking the person who will do it" }, { id: "c", text: "Picking the number your manager hopes for" }, { id: "d", text: "Adding time for review and fixes" }], answer: ["a", "b", "d"], explanation: "Evidence, the person doing the work, and honest slack beat optimism every time." },
  { id: "q3", prompt: "Two tasks depend on the same unfinished task. What should you watch?", options: [{ id: "a", text: "Only the two later tasks" }, { id: "b", text: "The unfinished task they both wait for" }, { id: "c", text: "Nothing until a date slips" }], answer: "b", explanation: "A delay in the shared task moves both. It is the one to protect." },
  { id: "q4", prompt: "How often should a weekly plan be reviewed?", options: [{ id: "a", text: "At the start of the week, and when something big changes" }, { id: "b", text: "Only at the end of the month" }, { id: "c", text: "Never, plans should not change" }], answer: "a", explanation: "A plan is a guess that gets better as you learn. Review it when it can still change the week." },
]

const asArray = (a: string | string[]) => (Array.isArray(a) ? a : [a])
const same = (x: string[], y: string[]) => x.length === y.length && x.every((v) => y.includes(v))

function Ring({ value, pass }: { value: number; pass: boolean }) {
  const r = 52
  const c = 2 * Math.PI * r
  return (
    <svg aria-hidden="true" viewBox="0 0 120 120" className="size-36 -rotate-90 rtl:rotate-90">
      <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10" className="stroke-muted" />
      <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value)} className={cn("transition-[stroke-dashoffset] duration-1000 ease-out motion-reduce:transition-none", pass ? "stroke-chart-2" : "stroke-destructive")} />
    </svg>
  )
}

/**
 * A short quiz: one question at a time with a progress bar, single or multiple answers chosen with radio buttons or checkboxes (number keys pick
 * too), checking an answer says right or wrong at once with why, and the end shows the score against the pass mark with a review of every
 * question and a retake. Answers are locked once checked, so the review is honest.
 */
function Quiz1({ title = "Check your understanding", questions = sample, passMark = 0.7, onComplete, defaultAnswers, className, ...props }: Quiz1Props) {
  const id = React.useId()
  const [i, setI] = React.useState(0)
  const [picked, setPicked] = React.useState<string[]>([])
  const [checked, setChecked] = React.useState(false)
  const [answers, setAnswers] = React.useState<Record<string, string[]>>(defaultAnswers ?? {})
  const [finished, setFinished] = React.useState(!!defaultAnswers)
  const headingRef = React.useRef<HTMLHeadingElement>(null)
  const first = React.useRef(true)
  const q = questions[i]
  const multi = q ? asArray(q.answer).length > 1 : false

  React.useEffect(() => {
    if (first.current) first.current = false
    else headingRef.current?.focus()
  }, [i, finished])

  if (!questions.length || !q)
    return (
      <section data-slot="quiz-1" aria-label="Quiz" className={cn("mx-auto w-full max-w-2xl px-4 py-10", className)} {...props}>
        <p className="text-muted-foreground rounded-2xl border border-dashed px-6 py-12 text-center text-sm">This quiz has no questions yet.</p>
      </section>
    )

  const right = checked && same(picked, asArray(q.answer))
  const score = questions.filter((x) => same(answers[x.id] ?? [], asArray(x.answer))).length
  const passed = score / questions.length >= passMark

  const choose = (oid: string) => {
    if (checked) return
    setPicked((p) => (multi ? (p.includes(oid) ? p.filter((x) => x !== oid) : [...p, oid]) : [oid]))
  }
  const check = () => {
    setAnswers((a) => ({ ...a, [q.id]: picked }))
    setChecked(true)
  }
  const next = () => {
    if (i + 1 < questions.length) {
      setI(i + 1)
      setPicked([])
      setChecked(false)
    } else {
      setFinished(true)
      const total = questions.length
      const s = questions.filter((x) => same(answers[x.id] ?? [], asArray(x.answer))).length
      onComplete?.({ score: s, total, passed: s / total >= passMark, answers })
    }
  }
  const retake = () => {
    setI(0)
    setPicked([])
    setChecked(false)
    setAnswers({})
    setFinished(false)
  }

  return (
    <section data-slot="quiz-1" aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-2xl px-4 py-10 sm:px-6", className)} {...props}>
      <div className="bg-card overflow-hidden rounded-3xl border shadow-sm">
        <div role="progressbar" aria-label="Quiz progress" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={finished ? questions.length : i + (checked ? 1 : 0)} className="bg-muted h-1.5">
          <div className="bg-foreground h-full transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${((finished ? questions.length : i + (checked ? 1 : 0)) / questions.length) * 100}%` }} />
        </div>

        {finished ? (
          <div className="p-6 sm:p-10">
            <div role="status" className="flex flex-col items-center text-center">
              <div className="relative">
                <Ring value={score / questions.length} pass={passed} />
                <span className="absolute inset-0 flex items-center justify-center text-3xl font-semibold tabular-nums">
                  {score}/{questions.length}
                </span>
              </div>
              <h2 id={`${id}-title`} ref={headingRef} tabIndex={-1} className="mt-5 text-2xl font-semibold tracking-tight outline-none">
                {passed ? "You passed" : "Not quite yet"}
              </h2>
              <p className="text-muted-foreground mt-2 max-w-sm text-pretty">
                {passed ? `${Math.round((score / questions.length) * 100)}% correct. The pass mark is ${Math.round(passMark * 100)}%.` : `${Math.round((score / questions.length) * 100)}% correct, and you need ${Math.round(passMark * 100)}%. Read the answers below and try again.`}
              </p>
            </div>
            <ol className="mt-8 grid gap-3">
              {questions.map((x, n) => {
                const ok = same(answers[x.id] ?? [], asArray(x.answer))
                return (
                  <li key={x.id} className={cn("rounded-2xl border p-4", ok ? "border-chart-2/30" : "border-destructive/30 bg-destructive/5")}>
                    <p className="flex items-start gap-2.5 text-sm font-medium">
                      {ok ? <CircleCheck aria-hidden="true" className="text-chart-2 mt-0.5 size-4 shrink-0" /> : <CircleAlert aria-hidden="true" className="text-destructive mt-0.5 size-4 shrink-0" />}
                      <span>
                        <span className="sr-only">{ok ? "Correct. " : "Incorrect. "}</span>
                        {n + 1}. {x.prompt}
                      </span>
                    </p>
                    {!ok ? (
                      <p className="text-muted-foreground mt-2 ps-6.5 text-sm text-pretty">
                        You chose {(answers[x.id] ?? []).map((o) => x.options.find((p) => p.id === o)?.text).join("; ") || "nothing"}. Right answer: {asArray(x.answer).map((o) => x.options.find((p) => p.id === o)?.text).join("; ")}.
                      </p>
                    ) : null}
                    {x.explanation ? <p className="text-muted-foreground mt-2 ps-6.5 text-sm text-pretty">{x.explanation}</p> : null}
                  </li>
                )
              })}
            </ol>
            <div className="mt-8 flex justify-center">
              <Button variant="outline" onClick={retake}>
                <RotateCcw aria-hidden="true" />
                Take it again
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6 sm:p-10">
            <p className="text-muted-foreground text-sm font-medium tabular-nums">
              {title} · Question {i + 1} of {questions.length}
            </p>
            <h2 id={`${id}-title`} ref={headingRef} tabIndex={-1} className="mt-3 text-2xl font-semibold tracking-tight text-balance outline-none sm:text-3xl">
              {q.prompt}
            </h2>
            <fieldset className="mt-7 grid gap-3" disabled={false}>
              <legend className="sr-only">{multi ? "Choose all the answers that apply" : "Choose one answer"}</legend>
              {multi ? <p className="text-muted-foreground -mb-1 text-sm">Choose all that apply.</p> : null}
              {q.options.map((o, n) => {
                const on = picked.includes(o.id)
                const isRight = asArray(q.answer).includes(o.id)
                const state = !checked ? "idle" : isRight ? "right" : on ? "wrong" : "idle"
                return (
                  <label
                    key={o.id}
                    className={cn(
                      "focus-within:ring-ring/50 flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-colors focus-within:ring-[3px] motion-reduce:transition-none",
                      checked && "cursor-default",
                      !checked && on && "border-foreground bg-accent/40",
                      !checked && !on && "hover:bg-accent/30",
                      state === "right" && "border-chart-2 bg-chart-2/10",
                      state === "wrong" && "border-destructive bg-destructive/10"
                    )}
                  >
                    <input type={multi ? "checkbox" : "radio"} name={`${id}-q`} checked={on} disabled={checked} onChange={() => choose(o.id)} className="sr-only" />
                    <span aria-hidden="true" className={cn("flex size-6 shrink-0 items-center justify-center border text-xs font-semibold tabular-nums", multi ? "rounded-md" : "rounded-full", on && !checked && "bg-foreground text-background border-foreground", state === "right" && "bg-chart-2 border-chart-2 text-white", state === "wrong" && "bg-destructive border-destructive text-white")}>
                      {state === "right" ? <Check className="size-4" /> : state === "wrong" ? <X className="size-4" /> : on ? <Check className="size-4" /> : n + 1}
                    </span>
                    <span className="text-sm font-medium text-pretty sm:text-base">
                      {o.text}
                      {checked && isRight ? <> <span className="sr-only">(correct answer)</span></> : null}
                      {checked && on && !isRight ? <> <span className="sr-only">(your answer, wrong)</span></> : null}
                    </span>
                  </label>
                )
              })}
            </fieldset>

            {checked ? (
              <div role="status" className={cn("mt-6 rounded-2xl border p-4 text-sm", right ? "border-chart-2/40 bg-chart-2/10" : "border-destructive/40 bg-destructive/10")}>
                <p className="flex items-center gap-2 font-semibold">
                  {right ? <CircleCheck aria-hidden="true" className="size-4" /> : <CircleAlert aria-hidden="true" className="size-4" />}
                  {right ? "That is right" : "Not quite"}
                </p>
                {q.explanation ? <p className="text-muted-foreground mt-1.5 text-pretty">{q.explanation}</p> : null}
              </div>
            ) : null}

            <div className="mt-8 flex justify-end">
              {checked ? (
                <Button onClick={next}>
                  {i + 1 < questions.length ? "Next question" : "See my score"}
                  <ArrowRight aria-hidden="true" className="rtl:rotate-180" />
                </Button>
              ) : (
                <Button onClick={check} disabled={!picked.length}>
                  Check answer
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export { Quiz1, type Quiz1Props, type Quiz1Question, type Quiz1Result }
