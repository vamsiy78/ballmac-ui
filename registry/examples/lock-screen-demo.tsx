"use client"

import * as React from "react"
import { Lock } from "lucide-react"

import { LockScreen } from "@/components/ballmac/lock-screen"

export default function LockScreenDemo() {
  const [locked, setLocked] = React.useState(true)
  return (
    <div className="flex w-full max-w-3xl flex-col gap-3">
      <div className="relative isolate h-[440px] overflow-hidden rounded-2xl border border-foreground/10">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-br from-chart-2 via-chart-1 to-chart-4" />
        <div className="flex h-full flex-col items-center justify-center gap-4 text-center text-white">
          <p className="text-2xl font-semibold [text-shadow:0_1px_8px_rgb(0_0_0/0.4)]">Welcome back, Alex</p>
          <button
            type="button"
            onClick={() => setLocked(true)}
            className="inline-flex h-9 items-center gap-2 rounded-full bg-black/35 px-4 text-sm font-medium outline-none backdrop-blur hover:bg-black/45 focus-visible:ring-[3px] focus-visible:ring-white/70"
          >
            <Lock className="size-3.5" aria-hidden="true" /> Lock screen
          </button>
        </div>
        <LockScreen locked={locked} onLockedChange={setLocked} password="hello" name="Alex Morgan" hint="Hint: the password is “hello”" />
      </div>
      <p className="text-sm text-muted-foreground">Type a wrong password to see it shake, then “hello” to unlock.</p>
    </div>
  )
}
