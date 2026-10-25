import { ArrowUpRight } from "lucide-react"

import { Themed } from "@/components/pro/shots"
import Link from "@/components/site/link"
import { cn } from "@/lib/utils"

type Shot = { name: string; alt: string; width: number; height: number }

const SHOTS: Record<string, Shot> = {
  "cited-answer": { name: "cited-answer", alt: "An answer in which every claim carries a numbered source chip, above a list of the sources.", width: 1520, height: 968 },
  "autonomy-dial": { name: "autonomy-dial", alt: "A dial that sets how much an agent may do on its own, from asking for everything to acting alone.", width: 1060, height: 1138 },
  "tool-call-card": { name: "tool-call-card", alt: "A thinking indicator above a tool call card showing the call's input and output.", width: 1060, height: 1152 },
  "agent-graph": { name: "agent-graph", alt: "A graph of the steps an agent took, with the tools it called and the branches it tried.", width: 1520, height: 798 },
  "eval-scorecard": { name: "eval-scorecard", alt: "A scorecard comparing two prompt versions across test cases, with pass rates and regressions marked.", width: 1760, height: 1266 },
}

function Tile({ shot, className }: { shot: Shot; className?: string }) {
  return (
    <div className={cn("group bg-card relative flex flex-col overflow-hidden rounded-3xl border", className)}>
      <div className="flex items-center justify-between gap-3 px-5 pt-4">
        <span className="text-muted-foreground flex items-center gap-2 font-mono text-xs">
          {shot.name}
          <span className="rounded border px-1 py-px font-sans text-[10px] font-medium tracking-wide uppercase">Pro</span>
        </span>
        <Link href={`/components/${shot.name}`} className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 inline-flex items-center gap-1 rounded-sm text-xs font-medium outline-none focus-visible:ring-[3px]">
          See it run <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
      <div className="relative min-h-0 flex-1 overflow-hidden px-5 pt-4 pb-5">
        <Themed base={`/home/ai/${shot.name}`} alt={shot.alt} width={shot.width} height={shot.height} className="w-full" />
        <div aria-hidden="true" className="from-card pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t to-transparent" />
      </div>
    </div>
  )
}

/**
 * Pictures of the AI components, each linking to its own page, where it runs. They are Pro, so they are images here and never live code. The tiles are
 * different sizes on purpose.
 */
export function AiBento({ total }: { total: number }) {
  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <Tile shot={SHOTS["cited-answer"]!} className="h-[27rem] lg:col-span-7" />
      <Tile shot={SHOTS["autonomy-dial"]!} className="h-[27rem] lg:col-span-5" />
      <Tile shot={SHOTS["tool-call-card"]!} className="h-[29rem] lg:col-span-5" />
      <Tile shot={SHOTS["agent-graph"]!} className="h-[29rem] lg:col-span-7" />
      <Tile shot={SHOTS["eval-scorecard"]!} className="h-[26rem] lg:col-span-8" />
      <div className="bg-foreground text-background flex flex-col justify-between rounded-3xl p-7 lg:col-span-4">
        <p className="text-7xl font-semibold tracking-[-0.06em] tabular-nums sm:text-8xl">{total}</p>
        <div>
          <p className="text-lg font-medium">AI components, and the screens that use them.</p>
          <Link href="/components?category=ai" className="focus-visible:ring-ring/60 mt-4 inline-flex items-center gap-1.5 rounded-sm text-sm font-medium underline underline-offset-4 outline-none focus-visible:ring-[3px]">
            Browse them all <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  )
}
