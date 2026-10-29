"use client"

import { Check } from "lucide-react"
import { useInView, useReducedMotion } from "motion/react"
import * as React from "react"

import { CopyButton } from "@/components/site/copy-button"
import { cn } from "@/lib/utils"

/**
 * The install, played out: when the terminal scrolls into view the command types itself, the CLI's steps tick off, and the file it wrote opens underneath. It
 * plays once. Before the script runs, and when less motion is asked for, everything is shown finished, so the page never hides content.
 */
export function InstallDemo({ command, files, sourceHtml }: { command: string; files: string[]; sourceHtml: string }) {
  const reduce = useReducedMotion()
  const ref = React.useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.45 })
  const steps = ["Checking registry.", "Installing dependencies.", `Created ${files.length} file${files.length === 1 ? "" : "s"}:`]
  const done = command.length + 1 + steps.length + 1
  // -1 means "not started": the finished state is what renders first, so a visitor without the script sees it all.
  const [t, setT] = React.useState(done)
  const armed = React.useRef(false)

  React.useEffect(() => {
    if (reduce || armed.current) return
    const r = ref.current?.getBoundingClientRect()
    if (r && r.top < window.innerHeight * 0.55) return // already on screen at load: leave it finished
    armed.current = true
    setT(-1)
  }, [reduce])

  React.useEffect(() => {
    if (!inView || t >= done || !armed.current) return
    const typing = t < command.length
    const id = window.setTimeout(() => setT((v) => v + 1), t < 0 ? 250 : typing ? 34 : t === command.length ? 380 : 520)
    return () => window.clearTimeout(id)
  }, [inView, t, done, command.length])

  const typed = t < 0 ? "" : command.slice(0, Math.min(t, command.length))
  const shownSteps = Math.max(0, t - command.length)
  const open = t >= done

  return (
    <div ref={ref} className="relative">
      <div aria-hidden="true" className="absolute -inset-10 -z-10 rounded-[3rem] bg-[radial-gradient(closest-side,oklch(0.8_0.07_72/0.18),transparent)] blur-2xl" />
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0d1117] text-white shadow-[0_40px_90px_-40px_rgb(0_0_0/0.7)]">
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-3">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-white/15" />
            <span className="size-2.5 rounded-full bg-white/15" />
            <span className="size-2.5 rounded-full bg-white/15" />
          </span>
          <span className="font-mono text-xs text-white/40">~/my-app</span>
          <CopyButton value={command} label="Copy the install command" className="ms-auto text-white/60 hover:bg-white/10 hover:text-white" />
        </div>
        <div dir="ltr" className="min-h-[11.5rem] px-5 py-4 font-mono text-[13px] leading-7">
          <p className="sr-only">{command}</p>
          <p aria-hidden="true">
            <span className="text-emerald-400">$</span> {typed}
            {t < command.length && <span className="bm-caret ms-px inline-block h-4 w-2 translate-y-0.5 bg-white/80" />}
          </p>
          <ul className="text-white/70">
            {steps.map((s, i) => (
              <li key={s} className={cn("flex items-center gap-2 transition-[opacity,transform] duration-300 motion-reduce:transition-none", i < shownSteps ? "opacity-100" : "translate-y-1 opacity-0")}>
                <Check className="size-3.5 text-emerald-400" aria-hidden="true" />
                {s}
              </li>
            ))}
            {files.map((f) => (
              <li key={f} className={cn("ps-6 text-white/50 transition-opacity duration-300 motion-reduce:transition-none", shownSteps >= steps.length ? "opacity-100" : "opacity-0")}>
                - {f}
              </li>
            ))}
          </ul>
        </div>
        <div className={cn("grid transition-[grid-template-rows] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
          <div className="min-h-0 overflow-hidden">
            <div className="relative border-t border-white/10">
              <p className="px-5 pt-3 font-mono text-[11px] text-white/40" dir="ltr">{files[0]}</p>
              <div dir="ltr" tabIndex={open ? 0 : -1} aria-label={`The start of ${files[0]}`} className="dark max-h-[19rem] overflow-hidden px-5 py-3 text-[12.5px] outline-none focus-visible:ring-[3px] focus-visible:ring-white/40 focus-visible:ring-inset [&_pre]:bg-transparent!" dangerouslySetInnerHTML={{ __html: sourceHtml }} />
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0d1117] to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
