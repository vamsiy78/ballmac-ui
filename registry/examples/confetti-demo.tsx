"use client"

import * as React from "react"
import { CheckCircle2, GitBranch, Rocket } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { useConfetti } from "@/components/ballmac/confetti"

type State = "idle" | "deploying" | "done"

export default function ConfettiDemo() {
  const [state, setState] = React.useState<State>("idle")
  const buttonRef = React.useRef<HTMLButtonElement>(null)
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  const { fireFrom } = useConfetti()
  React.useEffect(() => () => clearTimeout(timer.current), [])

  const deploy = () => {
    if (state === "done") {
      setState("idle")
      return
    }
    setState("deploying")
    timer.current = setTimeout(() => {
      setState("done")
      void fireFrom(buttonRef.current)
    }, 1400)
  }

  return (
    <div className="w-full max-w-sm rounded-xl border bg-card p-5 text-card-foreground shadow-xs">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-lg bg-[linear-gradient(135deg,var(--chart-1),var(--chart-4))] text-white">
          <Rocket className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">acme-web</p>
          <p className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
            <GitBranch className="size-3" aria-hidden="true" /> main · 8f3c2a1
          </p>
        </div>
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,var(--chart-1),var(--chart-4))] transition-[width] duration-[1400ms] ease-(--bm-ease-out)"
          style={{ width: state === "idle" ? "0%" : "100%" }}
        />
      </div>

      <p className="mt-3 flex min-h-5 items-center gap-1.5 text-sm" aria-live="polite">
        {state === "idle" && <span className="text-muted-foreground">Ready to ship 3 commits to production.</span>}
        {state === "deploying" && <span className="text-muted-foreground">Building and rolling out…</span>}
        {state === "done" && (
          <>
            <CheckCircle2 className="size-4 text-chart-2" aria-hidden="true" />
            <span className="font-medium">Deployed to production in 38s</span>
          </>
        )}
      </p>

      <Button ref={buttonRef} className="mt-4 w-full" loading={state === "deploying"} onClick={deploy}>
        {state === "done" ? "Deploy again" : "Deploy"}
      </Button>
    </div>
  )
}
