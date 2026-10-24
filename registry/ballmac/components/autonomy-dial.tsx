// Ballmac UI: Autonomy Dial. https://ui.ballmac.com/components/autonomy-dial
"use client"

import * as React from "react"
import { Check, HelpCircle, Lock } from "lucide-react"
import { LayoutGroup, motion } from "motion/react"

import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"
import { useReducedMotionSafe } from "@/lib/ballmac/motion"

type AutonomyLevel = {
  /** Stable value reported to onValueChange. */
  value: string
  /** Short name shown under the dial, for example "Ask first". */
  label: string
  /** One sentence on what this setting means. */
  summary: string
  /** What the agent does without asking at this level. */
  does: string[]
  /** What it stops to ask about at this level. */
  asks: string[]
}

/** Four settings from "suggest only" to "full auto", written to be edited. */
const defaultAutonomyLevels: AutonomyLevel[] = [
  {
    value: "suggest",
    label: "Suggest",
    summary: "Reads and proposes. Nothing changes until you do it yourself.",
    does: ["Reads files and searches", "Explains and proposes changes"],
    asks: ["Every edit", "Every command", "Anything on the network"],
  },
  {
    value: "ask",
    label: "Ask first",
    summary: "Does the work after you approve each step.",
    does: ["Reads files and searches", "Prepares edits and commands"],
    asks: ["Before each edit", "Before each command", "Before using the network"],
  },
  {
    value: "auto-edit",
    label: "Auto-edit",
    summary: "Edits files freely, and asks before anything that runs or reaches out.",
    does: ["Reads and edits files in the project", "Runs checks you have allowed"],
    asks: ["Other commands", "Installing packages", "Using the network"],
  },
  {
    value: "full",
    label: "Full auto",
    summary: "Works on its own inside its sandbox and stops only for what cannot be undone.",
    does: ["Edits files and runs commands", "Installs packages inside the sandbox"],
    asks: ["Deleting data", "Anything outside the sandbox", "Spending past the budget"],
  },
]

type AutonomyAction = {
  id: string
  /** What the agent can do, for example "Send emails". */
  label: string
  /** A small icon or logo shown before the label. */
  icon?: React.ReactNode
  /** How much harm it can do. Shown as a badge, in words. */
  risk?: "safe" | "risky" | "destructive"
  /** The first level (its `value`) at which the agent does this on its own. Leave it out and it always asks. */
  autoFrom?: string
}

type AutonomyDialProps = Omit<React.ComponentProps<"fieldset">, "onChange" | "defaultValue"> & {
  /** The settings, from least to most autonomous. Defaults to four general ones. */
  levels?: AutonomyLevel[]
  /** The selected value. Controlled. */
  value?: string
  /** The selected value for uncontrolled use. */
  defaultValue?: string
  /** Called with the new value. */
  onValueChange?: (value: string) => void
  /** Heading above the dial. */
  label?: string
  /** Real actions to sort into "Does on its own" and "Asks first" as the dial moves. Replaces each level's `does` and `asks` lists. */
  actions?: AutonomyAction[]
}

/**
 * How much an agent may do on its own, as a stepped dial with what each step means written out underneath. The steps are a native radio group, so
 * the arrow keys, Home, End and the browser's own right-to-left handling all work. The track is decoration; the words carry the meaning.
 */
function AutonomyDial({ levels = defaultAutonomyLevels, value: valueProp, defaultValue, onValueChange, label, actions, className, ...props }: AutonomyDialProps) {
  const msg = useMessages()
  const reduced = useReducedMotionSafe()
  const name = React.useId()
  label ??= msg("autonomy-dial.label", "How much can the agent do on its own?")
  const [inner, setInner] = React.useState(defaultValue ?? levels[0]?.value)
  const value = valueProp ?? inner
  const index = Math.max(0, levels.findIndex((l) => l.value === value))
  const current = levels[index]
  const last = Math.max(1, levels.length - 1)

  function pick(v: string) {
    if (valueProp === undefined) setInner(v)
    onValueChange?.(v)
  }

  if (!current) return null
  return (
    <fieldset data-slot="autonomy-dial" className={cn("grid w-full min-w-0 gap-6 rounded-xl border bg-card p-5 text-card-foreground sm:p-6", className)} {...props}>
      <legend className="sr-only">{label}</legend>
      <div className="flex items-baseline justify-between gap-3" aria-hidden="true">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="font-mono text-xs text-muted-foreground tabular-nums">
          {index + 1} / {levels.length}
        </p>
      </div>

      <div className="relative px-4">
        {/* The track and its fill. Decoration: each step below is a labelled radio. */}
        <div aria-hidden="true" className="absolute inset-x-4 top-[0.9rem] h-1.5 -translate-y-1/2 rounded-full bg-muted">
          <div className="h-full rounded-full bg-foreground transition-[width] duration-300 ease-out motion-reduce:transition-none" style={{ width: `${(index / last) * 100}%` }} />
        </div>
        <div className="relative flex justify-between">
          {levels.map((l, i) => {
            const on = l.value === current.value
            const passed = i <= index
            return (
              <label key={l.value} className="group/step relative flex w-0 cursor-pointer flex-col items-center">
                <input type="radio" name={name} value={l.value} checked={on} onChange={() => pick(l.value)} className="peer sr-only" />
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-[1.8rem] items-center justify-center rounded-full border-2 bg-card transition-[transform,background-color,border-color] duration-200 motion-reduce:transition-none",
                    passed ? "border-foreground" : "border-border group-hover/step:border-foreground/50",
                    on && "scale-110 bg-foreground text-background",
                    "peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/50 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-card"
                  )}
                >
                  {passed ? <Check className="size-3.5" /> : <span className="size-1.5 rounded-full bg-muted-foreground/60" />}
                </span>
                <span className={cn("mt-2.5 w-24 text-center text-[13px] leading-tight text-balance", on ? "font-semibold text-foreground" : "text-muted-foreground")}>{l.label}</span>
              </label>
            )
          })}
        </div>
      </div>

      <div aria-live="polite" className="grid gap-4 rounded-lg border bg-background/60 p-4">
        <p className="text-sm leading-relaxed text-foreground">
          <span className="font-semibold">{current.label}.</span> {current.summary}
        </p>
        {actions ? (
          <LayoutGroup id={`${name}-actions`}>
            <div className="grid gap-4 sm:grid-cols-2">
              {([true, false] as const).map((auto) => {
                const list = actions.filter((x) => {
                  const at = x.autoFrom === undefined ? -1 : levels.findIndex((l) => l.value === x.autoFrom)
                  return (at >= 0 && at <= index) === auto
                })
                return (
                  <div key={String(auto)}>
                    <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      {auto ? <Check aria-hidden="true" className="size-3.5" /> : <HelpCircle aria-hidden="true" className="size-3.5" />}
                      {auto ? msg("autonomy-dial.does", "Does on its own") : msg("autonomy-dial.asksFirst", "Asks you first")}
                      <span className="rounded-full bg-muted px-1.5 text-[11px] tabular-nums">{list.length}</span>
                    </p>
                    <ul className="mt-2 grid gap-1">
                      {list.map((x) => {
                        const always = x.autoFrom === undefined
                        return (
                          <motion.li key={x.id} layout={!reduced} layoutId={reduced ? undefined : `${name}-${x.id}`} transition={{ type: "spring", stiffness: 420, damping: 36 }} className="flex flex-wrap items-center gap-x-2 gap-y-0.5 rounded-md px-1.5 py-1 text-[13px] leading-snug">
                            <span aria-hidden="true" className="bg-muted text-muted-foreground flex size-6 shrink-0 items-center justify-center rounded-md [&>svg]:size-3.5">{x.icon ?? <span className="size-1.5 rounded-full bg-current" />}</span>
                            <span className="min-w-[6.5rem] flex-1">{x.label}</span>
                            {x.risk && x.risk !== "safe" && (
                              <span className={cn("shrink-0 rounded-full border px-1.5 py-0.5 text-[11px] font-medium", x.risk === "destructive" ? "border-destructive/40 text-destructive" : "text-muted-foreground")}>
                                {x.risk === "destructive" ? msg("autonomy-dial.destructive", "Destructive") : msg("autonomy-dial.risky", "Risky")}
                              </span>
                            )}
                            {always && !auto && (
                              <span className="text-muted-foreground flex shrink-0 items-center gap-1 text-[11px]"><Lock aria-hidden="true" className="size-3" />{msg("autonomy-dial.always", "Always asks")}</span>
                            )}
                          </motion.li>
                        )
                      })}
                    </ul>
                  </div>
                )
              })}
            </div>
          </LayoutGroup>
        ) : (
        <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Check aria-hidden="true" className="size-3.5" /> {msg("autonomy-dial.does", "Does on its own")}
              </p>
              <ul className="mt-2 grid gap-1.5 text-[13px] leading-snug">
                {current.does.map((t) => (
                  <li key={t} className="flex gap-2">
                    <span aria-hidden="true" className="mt-[0.45rem] size-1 shrink-0 rounded-full bg-foreground" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <HelpCircle aria-hidden="true" className="size-3.5" /> {msg("autonomy-dial.asks", "Stops to ask about")}
              </p>
              <ul className="mt-2 grid gap-1.5 text-[13px] leading-snug">
                {current.asks.map((t) => (
                  <li key={t} className="flex gap-2">
                    <span aria-hidden="true" className="mt-[0.45rem] size-1 shrink-0 rounded-full border border-foreground" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </fieldset>
  )
}

export { AutonomyDial, defaultAutonomyLevels, type AutonomyAction, type AutonomyDialProps, type AutonomyLevel }
