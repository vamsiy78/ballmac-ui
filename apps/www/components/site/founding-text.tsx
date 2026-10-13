"use client"

import * as React from "react"

import { leftPhrase, nudgeText, type Nudge } from "@/lib/founding"

// One shared clock, ticking every half minute: the phrases count days, hours and minutes, never seconds.
let now = 0
const subscribe = (onChange: () => void) => {
  now = Date.now()
  const id = setInterval(() => {
    now = Date.now()
    onChange()
  }, 30_000)
  return () => clearInterval(id)
}

/**
 * The time `at` on the server and during hydration, so the first paint matches the HTML, then the real clock. Pages are built ahead of time, so the
 * moment they were built can be days old; this is what keeps "ends in 3 days" true between builds.
 */
function useNow(at: number) {
  return React.useSyncExternalStore(subscribe, () => now || at, () => at)
}

const upper = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** "ends in 3 days", from the visitor's clock. */
export function LeftPhrase({ endsAt, at, capitalize = false }: { endsAt: string; at: number; capitalize?: boolean }) {
  const phrase = leftPhrase(endsAt, new Date(useNow(at)))
  return <>{capitalize ? upper(phrase) : phrase}</>
}

/** The nudge line (see nudgeText), from the visitor's clock. */
export function NudgeText({ nudge }: { nudge: NonNullable<Nudge> }) {
  return <>{nudgeText(nudge.offer, new Date(useNow(nudge.at)))}</>
}
