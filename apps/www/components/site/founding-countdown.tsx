"use client"

import * as React from "react"

import { endsLabel, timeLeft } from "@/lib/founding"

// One shared clock for every countdown on the page: the snapshot is a stored value that changes once a second, so React always reads the same value within a render.
let now = 0
const subscribe = (onChange: () => void) => {
  now = Date.now()
  const id = setInterval(() => {
    now = Date.now()
    onChange()
  }, 1000)
  return () => clearInterval(id)
}

/**
 * The time left at the founding price. The server renders the moment the page was built (`renderedAt`), so the first paint matches; the browser then
 * takes over with the real clock. Screen readers get the deadline once as text and are not read the ticking numbers.
 */
export function FoundingCountdown({ endsAt, renderedAt }: { endsAt: string; renderedAt: number }) {
  const at = React.useSyncExternalStore(subscribe, () => now || renderedAt, () => renderedAt)
  const t = timeLeft(endsAt, new Date(at))
  if (t.ended) return <p className="text-lg font-semibold">The founding price has ended. Reload the page for the current price.</p>
  const cells: [string, number][] = [["days", t.days], ["hours", t.hours], ["minutes", t.minutes], ["seconds", t.seconds]]
  return (
    <div>
      <p className="sr-only">The founding price ends {endsLabel(endsAt)}.</p>
      <div aria-hidden="true" className="flex gap-3 sm:gap-4">
        {cells.map(([label, value]) => (
          <div key={label} className="min-w-14 text-center">
            <div className="text-3xl leading-none font-semibold tracking-[-0.03em] tabular-nums sm:text-4xl">{String(value).padStart(2, "0")}</div>
            <div className="mt-1.5 text-xs opacity-70">{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
