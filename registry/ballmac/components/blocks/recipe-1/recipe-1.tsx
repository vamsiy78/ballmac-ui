// Ballmac UI: Recipe 1. https://ui.ballmac.com/blocks/recipe-1
"use client"

import * as React from "react"
import { BellRing, ChefHat, Clock, Minus, Pause, Play, Plus, RotateCcw, Users } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { CoverArt } from "@/components/ballmac/cover-art"
import { SegmentedControl, SegmentedControlItem } from "@/components/ballmac/segmented-control"
import { cn } from "@/lib/utils"

type Recipe1Ingredient = { id: string; /** Amount for the recipe's own serving count. */ qty: number; /** g, ml, tbsp, tsp, cup, or empty for countable things. */ unit?: string; name: string; note?: string }
type Recipe1Step = { id: string; text: string; /** If the step needs waiting, how many minutes. */ minutes?: number }

type Recipe1Props = Omit<React.ComponentProps<"section">, "title"> & {
  title?: string
  intro?: string
  /** How many people the amounts are written for. */
  serves?: number
  prep?: number
  cook?: number
  difficulty?: string
  ingredients?: Recipe1Ingredient[]
  steps?: Recipe1Step[]
  /** Kcal per serving. */
  calories?: number
  /** Milliseconds a timer second takes. Leave at 1000; tests make it small. */
  tick?: number
}

const ing0: Recipe1Ingredient[] = [
  { id: "i1", qty: 400, unit: "g", name: "spaghetti" },
  { id: "i2", qty: 150, unit: "g", name: "guanciale or pancetta", note: "cut in strips" },
  { id: "i3", qty: 4, name: "egg yolks", note: "plus 1 whole egg" },
  { id: "i4", qty: 80, unit: "g", name: "pecorino, finely grated" },
  { id: "i5", qty: 2, unit: "tsp", name: "black pepper", note: "freshly cracked" },
  { id: "i6", qty: 1, unit: "tbsp", name: "olive oil" },
  { id: "i7", qty: 200, unit: "ml", name: "pasta water", note: "kept back" },
]
const steps0: Recipe1Step[] = [
  { id: "s1", text: "Bring a large pot of well-salted water to the boil. Meanwhile, whisk the yolks, the whole egg, most of the pecorino and the pepper in a bowl." },
  { id: "s2", text: "Fry the guanciale in the oil over a medium heat until the fat has melted and the edges are crisp.", minutes: 8 },
  { id: "s3", text: "Cook the spaghetti until just short of done. Scoop out a cup of the pasta water before you drain it.", minutes: 10 },
  { id: "s4", text: "Take the pan off the heat. Toss the pasta in the fat, then add the egg mixture with a splash of the water, stirring fast so it turns glossy rather than scrambled." },
  { id: "s5", text: "Loosen with more water if it needs it, then serve at once with the rest of the cheese and more pepper." },
]

const FR: [number, string][] = [[0.125, "⅛"], [0.25, "¼"], [1 / 3, "⅓"], [0.5, "½"], [2 / 3, "⅔"], [0.75, "¾"]]
// Amounts read the way a cook says them: halves and quarters for spoons and cups, whole grams for weights.
function show(qty: number, unit: string | undefined) {
  if (unit === "g" || unit === "ml") return qty >= 100 ? String(Math.round(qty / 5) * 5) : String(Math.round(qty))
  const whole = Math.floor(qty + 1e-6)
  const rest = qty - whole
  if (rest < 0.06) return String(whole || (qty > 0 ? "⅛" : "0"))
  const near = FR.reduce((a, b) => (Math.abs(b[0] - rest) < Math.abs(a[0] - rest) ? b : a))
  if (Math.abs(near[0] - rest) > 0.07) return String(Math.round(qty * 10) / 10)
  return `${whole ? whole + " " : ""}${near[1]}`
}
const toUs = (qty: number, unit: string | undefined): [number, string | undefined] => (unit === "g" ? [qty / 28.35, "oz"] : unit === "ml" ? [qty / 29.57, "fl oz"] : [qty, unit])
const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`

function Timer({ minutes, label, tick }: { minutes: number; label: string; tick: number }) {
  const total = minutes * 60
  const [left, setLeft] = React.useState(total)
  const [running, setRunning] = React.useState(false)
  React.useEffect(() => {
    if (!running) return
    const t = setInterval(() => setLeft((l) => Math.max(0, l - 1)), tick)
    return () => clearInterval(t)
  }, [running, tick])
  const done = left === 0
  React.useEffect(() => {
    if (done) setRunning(false)
  }, [done])
  return (
    <div className={cn("mt-3 flex flex-wrap items-center gap-3 rounded-xl border p-3", done ? "border-chart-2/40 bg-chart-2/10" : running && "border-foreground/30")}>
      <span aria-hidden="true" className="relative size-10 shrink-0">
        <svg viewBox="0 0 36 36" className="size-10 -rotate-90 rtl:rotate-90">
          <circle cx="18" cy="18" r="15" fill="none" strokeWidth="3" className="stroke-muted" />
          <circle cx="18" cy="18" r="15" fill="none" strokeWidth="3" strokeLinecap="round" strokeDasharray={2 * Math.PI * 15} strokeDashoffset={2 * Math.PI * 15 * (1 - left / total)} className="stroke-foreground" />
        </svg>
      </span>
      <p className="min-w-16 text-2xl font-semibold tabular-nums" role="timer" aria-label={`${label}: ${Math.floor(left / 60)} minutes ${left % 60} seconds left`}>
        {clock(left)}
      </p>
      <div className="ms-auto flex flex-wrap gap-1.5">
        {!done ? (
          <Button size="sm" variant="outline" onClick={() => setRunning(!running)} aria-pressed={running}>
            {running ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
            {running ? "Pause" : left === total ? `Start ${minutes} min timer` : "Resume"}
          </Button>
        ) : (
          <p className="flex items-center gap-2 text-sm font-semibold">
            <BellRing aria-hidden="true" className="size-4" />
            Time is up
          </p>
        )}
        <Button size="icon" variant="ghost" aria-label="Reset the timer" onClick={() => { setRunning(false); setLeft(total) }}>
          <RotateCcw aria-hidden="true" />
        </Button>
      </div>
      <p aria-live="polite" className="sr-only">
        {done ? `${label}: time is up` : ""}
      </p>
    </div>
  )
}

/**
 * A recipe you can cook from: change how many people it serves and every amount scales (read as a cook would, ½ and ¼, whole grams), switch between metric and US
 * units, tick off ingredients as you gather them and steps as you finish them, and start a timer right on the steps that need waiting. Progress is counted for both lists.
 */
function Recipe1({ title = "Spaghetti carbonara", intro = "Four ingredients, one pan and ten minutes of attention. The trick is taking the pan off the heat before the eggs go in.", serves = 4, prep = 10, cook = 20, difficulty = "Easy", ingredients = ing0, steps = steps0, calories = 640, tick = 1000, className, ...props }: Recipe1Props) {
  const id = React.useId()
  const [people, setPeople] = React.useState(serves)
  const [units, setUnits] = React.useState<"metric" | "us">("metric")
  const [have, setHave] = React.useState<Set<string>>(new Set())
  const [done, setDone] = React.useState<Set<string>>(new Set())
  const factor = people / serves
  const flip = (set: Set<string>, k: string) => { const n = new Set(set); if (n.has(k)) n.delete(k); else n.add(k); return n }
  const next = steps.find((s) => !done.has(s.id))

  return (
    <section data-slot="recipe-1" aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-5xl px-4 py-10 sm:px-6", className)} {...props}>
      <div className="relative isolate overflow-hidden rounded-3xl border">
        <CoverArt seed={title} variant="waves" className="absolute inset-0 -z-20 scale-110 saturate-150" />
        <div aria-hidden="true" className="from-background via-background/85 to-background/30 absolute inset-0 -z-10 bg-gradient-to-r rtl:bg-gradient-to-l" />
        <div className="p-6 sm:p-10">
          <p className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
            <ChefHat aria-hidden="true" className="size-4" />
            {difficulty}
          </p>
          <h1 id={`${id}-title`} className="mt-3 max-w-xl text-4xl font-semibold tracking-[-0.045em] text-balance sm:text-6xl">
            {title}
          </h1>
          <p className="text-muted-foreground mt-4 max-w-xl text-pretty sm:text-lg">{intro}</p>
          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm">
            {[["Prep", `${prep} min`], ["Cook", `${cook} min`], ["Total", `${prep + cook} min`], ["Energy", `${calories} kcal each`]].map(([k, v]) => (
              <div key={k}>
                <dt className="text-muted-foreground text-xs">{k}</dt>
                <dd className="font-semibold tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="bg-card rounded-3xl border p-5 sm:p-7 lg:sticky lg:top-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold tracking-tight">Ingredients</h2>
            <SegmentedControl value={units} onValueChange={(v) => setUnits(v as "metric" | "us")} aria-label="Units" size="sm">
              <SegmentedControlItem value="metric">Metric</SegmentedControlItem>
              <SegmentedControlItem value="us">US</SegmentedControlItem>
            </SegmentedControl>
          </div>
          <div className="bg-muted/50 mt-4 flex items-center justify-between gap-3 rounded-2xl p-3">
            <p className="flex items-center gap-2 text-sm font-medium">
              <Users aria-hidden="true" className="size-4" />
              <span id={`${id}-serves`}>Serves</span>
            </p>
            <div className="flex items-center gap-1" role="group" aria-labelledby={`${id}-serves`}>
              <Button size="icon" variant="outline" aria-label="Fewer people" disabled={people <= 1} onClick={() => setPeople(people - 1)}>
                <Minus aria-hidden="true" />
              </Button>
              <output className="w-10 text-center text-xl font-semibold tabular-nums" aria-live="polite" aria-label={`${people} people`}>
                {people}
              </output>
              <Button size="icon" variant="outline" aria-label="More people" disabled={people >= 24} onClick={() => setPeople(people + 1)}>
                <Plus aria-hidden="true" />
              </Button>
            </div>
          </div>
          <ul className="mt-4 divide-y">
            {ingredients.map((g) => {
              const [q, u] = units === "us" ? toUs(g.qty * factor, g.unit) : [g.qty * factor, g.unit]
              const on = have.has(g.id)
              return (
                <li key={g.id}>
                  <label className="flex cursor-pointer items-start gap-3 py-3">
                    <input type="checkbox" checked={on} onChange={() => setHave(flip(have, g.id))} className="accent-foreground mt-1 size-4" />
                    <span className={cn("min-w-0 flex-1", on && "text-muted-foreground line-through")}>
                      <span className="font-semibold tabular-nums">
                        {units === "us" && (g.unit === "g" || g.unit === "ml") ? (Math.round(q * 10) / 10).toString() : show(q, u)} {u}
                      </span>{" "}
                      {g.name}
                      {g.note ? <span className="text-muted-foreground text-sm"> ({g.note})</span> : null}
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
          <p className="text-muted-foreground mt-2 text-sm tabular-nums" aria-live="polite">
            {have.size} of {ingredients.length} gathered
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold tracking-tight">Method</h2>
          <ol className="mt-4 grid grid-cols-1 gap-4">
            {steps.map((s, i) => {
              const finished = done.has(s.id)
              const current = next?.id === s.id
              return (
                <li key={s.id} className={cn("bg-card min-w-0 rounded-2xl border p-4 transition-colors sm:p-5 motion-reduce:transition-none", current && "border-foreground ring-foreground ring-1", finished && "bg-muted/40")}>
                  <div className="flex gap-4">
                    <span aria-hidden="true" className={cn("flex size-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold tabular-nums", finished && "bg-foreground text-background border-foreground")}>
                      {finished ? "✓" : i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={cn("leading-relaxed text-pretty", finished && "text-muted-foreground")}>
                        <span className="sr-only">Step {i + 1}. </span>
                        {s.text}
                      </p>
                      {s.minutes ? <Timer minutes={s.minutes} label={`Step ${i + 1}`} tick={tick} /> : null}
                      <label className="mt-3 flex w-fit cursor-pointer items-center gap-2 text-sm">
                        <input type="checkbox" checked={finished} onChange={() => setDone(flip(done, s.id))} className="accent-foreground size-4" />
                        Done <span className="sr-only">with step {i + 1}</span>
                      </label>
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
          <p className="text-muted-foreground mt-4 flex items-center gap-2 text-sm tabular-nums" aria-live="polite">
            <Clock aria-hidden="true" className="size-4" />
            {done.size === steps.length ? "All done. Enjoy." : `${done.size} of ${steps.length} steps done`}
          </p>
        </div>
      </div>
    </section>
  )
}

export { Recipe1, type Recipe1Props, type Recipe1Ingredient, type Recipe1Step }
