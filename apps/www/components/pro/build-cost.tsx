"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`

function Field({ id, label, value, onChange, min, max, step, unit }: { id: string; label: string; value: number; onChange: (n: number) => void; min: number; max: number; step: number; unit: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <label htmlFor={id} className="font-medium">{label}</label>
        <output htmlFor={id} className="tabular-nums">{unit === "$" ? `$${value}` : `${value}${unit}`}</output>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="accent-foreground focus-visible:ring-ring/50 mt-3 h-2 w-full cursor-pointer rounded-full outline-none focus-visible:ring-[3px]" />
    </div>
  )
}

/**
 * What it costs to build the screens yourself, with numbers the visitor can change. The starting values are an estimate, said so on the page,
 * not a measurement: polished states, dark mode, keyboard support and motion are the work a block already contains.
 */
export function BuildCost({ price, className, action }: { price: number; className?: string; action?: React.ReactNode }) {
  const [screens, setScreens] = React.useState(10)
  const [hours, setHours] = React.useState(6)
  const [rate, setRate] = React.useState(75)
  const total = screens * hours * rate
  const keep = total - price
  const days = (screens * hours) / 8
  return (
    <div className={cn("bg-card grid gap-8 rounded-3xl border p-5 sm:p-8 lg:grid-cols-2 lg:gap-12", className)}>
      <div className="grid content-start gap-6">
        <Field id="bc-screens" label="Screens you need" value={screens} onChange={setScreens} min={1} max={40} step={1} unit="" />
        <Field id="bc-hours" label="Hours to build one properly" value={hours} onChange={setHours} min={1} max={20} step={1} unit=" h" />
        <Field id="bc-rate" label="Your hourly rate" value={rate} onChange={setRate} min={20} max={250} step={5} unit="$" />
        <p className="text-muted-foreground text-xs leading-relaxed">Our estimate for one screen with loading, empty and error states, dark mode, keyboard support and motion is about six hours. Change it to match yours.</p>
      </div>
      <div className="flex flex-col justify-between gap-6">
        <dl className="grid gap-3">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 border-b pb-3">
            <dt className="text-muted-foreground text-sm">Building it yourself</dt>
            <dd className="text-3xl font-semibold tracking-tight tabular-nums">{money(total)}</dd>
            <dd className="text-muted-foreground col-span-2 mt-1 text-sm tabular-nums">{screens * hours} hours, about {days < 10 ? days.toFixed(1) : Math.round(days)} working days</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b pb-3">
            <dt className="text-muted-foreground text-sm">Ballmac UI Pro</dt>
            <dd className="text-3xl font-semibold tracking-tight tabular-nums">{money(price)} once</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-sm font-medium">{keep > 0 ? "You keep" : "Difference"}</dt>
            <dd aria-live="polite" className="text-3xl font-semibold tracking-tight tabular-nums">{keep > 0 ? money(keep) : money(Math.abs(keep))}</dd>
          </div>
        </dl>
        {action}
      </div>
    </div>
  )
}
