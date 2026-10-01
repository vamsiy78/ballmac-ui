// Ballmac UI: Northwind product tour. https://ui.ballmac.com/templates/template-northwind
"use client"

import * as React from "react"
import { BarChart3, Check, CreditCard, Home, ListChecks, Settings, Wallet } from "lucide-react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"

import { NorthwindHeading } from "@/components/ballmac/templates/northwind/northwind-theme"
import { cn } from "@/lib/utils"

const steps = [
  { id: "cards", title: "Issue a card in seconds", text: "Virtual or physical, with a limit, a merchant lock and an owner. Employees never wait on finance to buy what they need." },
  { id: "approvals", title: "Approve from anywhere", text: "Requests reach the right person by policy, with the receipt and context attached. One tap from a phone is enough." },
  { id: "budgets", title: "Budgets that warn early", text: "Every team sees what is left as they spend, and finance is told at 80 percent, not after the overrun." },
  { id: "close", title: "Close the month in days", text: "Receipts are matched, coded and exported to your ledger as spend happens, so close day stops being a project." },
] as const

type StepId = (typeof steps)[number]["id"]

const cardRows = [
  ["Design tools", "•••• 4821", "$2,400", "Maya R."],
  ["Team offsite", "•••• 1190", "$8,000", "Dev P."],
  ["Cloud hosting", "•••• 7745", "$14,500", "Engineering"],
]

const queue = [
  ["Figma annual", "$1,440", "Maya R."],
  ["Flight to Lisbon", "$612", "Sam O."],
  ["Conference pass", "$890", "Dev P."],
]

const budgets = [
  ["Marketing", 82, "bg-chart-2"],
  ["Engineering", 64, "bg-chart-1"],
  ["Operations", 38, "bg-chart-5"],
]

function Region({ id, active, children, className }: { id: StepId; active: StepId; children: React.ReactNode; className?: string }) {
  const on = id === active
  return (
    <div
      data-region={id}
      data-active={on}
      className={cn("bg-card relative rounded-xl border p-3.5 transition-[box-shadow,opacity,border-color] duration-500 motion-reduce:transition-none", on ? "border-chart-2 shadow-[0_0_0_3px_color-mix(in_oklab,var(--chart-2)_22%,transparent)]" : "border-dashed", className)}
    >
      {children}
    </div>
  )
}

/** A numbered pin on the mock. It repeats the step list for pointer users, so it is hidden from keyboard and screen readers. */
function Pin({ n, id, active, onSelect }: { n: number; id: StepId; active: StepId; onSelect: (id: StepId) => void }) {
  const on = id === active
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-hidden="true"
      data-pin={id}
      onClick={() => onSelect(id)}
      className={cn("absolute -top-3 -left-3 z-10 flex size-7 items-center justify-center rounded-full border-2 text-xs font-semibold shadow-sm outline-none transition-colors", on ? "bg-chart-2 border-card text-white" : "bg-card text-foreground hover:bg-accent")}
    >
      {n}
    </button>
  )
}

/** An interactive product tour: numbered pins on a mock dashboard, tied to a list of steps. */
function NorthwindTour({ className }: { className?: string }) {
  const [active, setActive] = React.useState<StepId>("cards")
  const current = steps.find((s) => s.id === active)!
  return (
    <div data-slot="northwind-tour" className={cn("grid items-center gap-10 lg:grid-cols-[0.8fr_1.3fr] lg:gap-14", className)}>
      <div>
        <RadioGroupPrimitive.Root value={active} onValueChange={(v) => setActive(v as StepId)} aria-label="Product tour steps" className="space-y-1.5">
          {steps.map((s, i) => {
            const on = s.id === active
            return (
              <RadioGroupPrimitive.Item
                key={s.id}
                value={s.id}
                className={cn("focus-visible:ring-ring/50 group block w-full rounded-xl border border-transparent p-4 text-left outline-none transition-colors focus-visible:ring-[3px]", on ? "bg-card border-border shadow-sm" : "hover:bg-accent/60")}
              >
                <span className="flex items-center gap-3">
                  <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors", on ? "bg-chart-2 text-white" : "bg-secondary")}>{i + 1}</span>
                  <NorthwindHeading as="h3" className="text-xl">{s.title}</NorthwindHeading>
                </span>
                {on && <span className="text-muted-foreground mt-2 block pl-10 text-[15px] leading-relaxed text-pretty">{s.text}</span>}
              </RadioGroupPrimitive.Item>
            )
          })}
        </RadioGroupPrimitive.Root>
      </div>

      <div className="bg-surface relative rounded-2xl border p-2.5 shadow-[0_30px_70px_-40px_oklch(0.3_0.05_155/0.5)] sm:p-3">
        <p className="sr-only" aria-live="polite">Step {steps.indexOf(current) + 1} of {steps.length}: {current.title}. {current.text}</p>
        <div aria-hidden="true" className="@container grid min-w-0 grid-cols-[2.75rem_1fr] gap-2.5 sm:grid-cols-[9rem_1fr]">
          <div className="bg-card hidden rounded-xl border p-2.5 sm:block">
            <p className="flex items-center gap-2 text-sm font-semibold"><span className="bg-primary size-5 rounded-full" />Acme Co</p>
            <ul className="mt-4 space-y-1 text-[13px]">
              {[[Home, "Home"], [CreditCard, "Cards"], [ListChecks, "Approvals"], [Wallet, "Budgets"], [BarChart3, "Reports"], [Settings, "Settings"]].map(([Icon, label], i) => {
                const I = Icon as typeof Home
                return <li key={label as string} className={cn("flex items-center gap-2 rounded-md px-2 py-1.5", i === 1 ? "bg-accent font-medium" : "text-muted-foreground")}><I className="size-3.5" />{label as string}</li>
              })}
            </ul>
          </div>
          <div className="bg-card flex flex-col items-center gap-3 rounded-xl border py-3 sm:hidden">
            {[Home, CreditCard, ListChecks, Wallet].map((I, i) => <I key={i} className={cn("size-4", i === 1 ? "text-foreground" : "text-muted-foreground")} />)}
          </div>
          <div className="grid min-w-0 gap-2.5 @lg:grid-cols-2">
            <Region id="cards" active={active} className="@lg:col-span-2">
              <Pin n={1} id="cards" active={active} onSelect={setActive} />
              <p className="text-xs font-semibold">Cards</p>
              <ul className="mt-2 divide-y text-xs">
                {cardRows.map((r) => (
                  <li key={r[1]} className="grid grid-cols-[1fr_auto] items-center gap-2 py-1.5 @md:grid-cols-[1.2fr_1fr_auto_auto]">
                    <span className="font-medium">{r[0]}</span>
                    <span className="text-muted-foreground hidden @md:block">{r[1]}</span>
                    <span className="text-muted-foreground hidden @md:block">{r[3]}</span>
                    <span className="tabular-nums">{r[2]}</span>
                  </li>
                ))}
              </ul>
            </Region>
            <Region id="approvals" active={active}>
              <Pin n={2} id="approvals" active={active} onSelect={setActive} />
              <p className="text-xs font-semibold">Needs approval <span className="bg-chart-2/20 ml-1 rounded-full px-1.5">3</span></p>
              <ul className="mt-2 space-y-1.5 text-xs">
                {queue.map((q) => (
                  <li key={q[0]} className="bg-secondary/70 flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5">
                    <span className="min-w-0 truncate"><span className="font-medium">{q[0]}</span> <span className="text-muted-foreground">{q[2]}</span></span>
                    <span className="flex shrink-0 items-center gap-1.5 tabular-nums">{q[1]}<Check className="text-chart-1 size-3.5" /></span>
                  </li>
                ))}
              </ul>
            </Region>
            <Region id="budgets" active={active}>
              <Pin n={3} id="budgets" active={active} onSelect={setActive} />
              <p className="text-xs font-semibold">Budgets this quarter</p>
              <ul className="mt-2 space-y-2.5 text-xs">
                {budgets.map(([name, pct, tone]) => (
                  <li key={name as string}>
                    <div className="flex justify-between"><span>{name}</span><span className={cn("tabular-nums", (pct as number) > 80 && "text-chart-2 font-semibold")}>{pct}%</span></div>
                    <div className="bg-secondary mt-1 h-1.5 rounded-full"><div className={cn("h-full rounded-full", tone as string)} style={{ width: `${pct}%` }} /></div>
                  </li>
                ))}
              </ul>
            </Region>
            <Region id="close" active={active} className="@lg:col-span-2">
              <Pin n={4} id="close" active={active} onSelect={setActive} />
              <div className="flex items-center justify-between text-xs">
                <p className="font-semibold">October close</p>
                <p className="text-muted-foreground">Day 2 of 3</p>
              </div>
              <div className="bg-secondary mt-2.5 h-2 rounded-full"><div className="bg-chart-1 h-full w-[88%] rounded-full" /></div>
              <p className="text-muted-foreground mt-2 text-xs">412 of 468 receipts matched · 56 waiting on employees</p>
            </Region>
          </div>
        </div>
      </div>
    </div>
  )
}

export { NorthwindTour }
