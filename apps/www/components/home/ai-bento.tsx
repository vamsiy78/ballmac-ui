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

const TITLES: Record<string, string> = {
  "cited-answer": "Cited answer",
  "autonomy-dial": "Autonomy dial",
  "tool-call-card": "Tool call card",
  "agent-graph": "Agent graph",
  "eval-scorecard": "Eval scorecard",
}

/** One AI component in a warm frame: the picture whole on a quiet stage (never cropped), its name and a way to see it run. */
function Tile({ shot, className }: { shot: Shot; className?: string }) {
  return (
    <div className={cn("group bg-frame flex flex-col rounded-[1.75rem] p-2.5", className)}>
      <div className="bm-stage relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-[1.25rem] p-6 ring-1 ring-black/[0.05] sm:p-8 dark:ring-white/[0.06]">
        <div className="w-full max-w-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100 [&_img]:max-h-[22rem] [&_img]:w-auto [&_img]:mx-auto [&_img]:rounded-xl [&_img]:shadow-[0_20px_40px_-24px_rgb(0_0_0/0.35)]">
          <Themed base={`/home/ai/${shot.name}`} alt={shot.alt} width={shot.width} height={shot.height} />
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 px-2 pt-2.5 pb-1">
        <Link href={`/components/${shot.name}`} className="focus-visible:ring-ring/50 min-w-0 truncate rounded-sm text-[15px] font-medium tracking-[-0.01em] outline-none hover:underline hover:underline-offset-4 focus-visible:ring-[3px]">
          {TITLES[shot.name] ?? shot.name}
        </Link>
        <span className="text-muted-foreground flex shrink-0 items-center gap-2 font-mono text-xs">
          {shot.name}
          <span className="font-sans">Pro</span>
        </span>
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
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
      <Tile shot={SHOTS["cited-answer"]!} className="min-h-[24rem] lg:col-span-7" />
      <Tile shot={SHOTS["autonomy-dial"]!} className="min-h-[24rem] lg:col-span-5" />
      <Tile shot={SHOTS["tool-call-card"]!} className="min-h-[26rem] lg:col-span-5" />
      <Tile shot={SHOTS["agent-graph"]!} className="min-h-[26rem] lg:col-span-7" />
      <Tile shot={SHOTS["eval-scorecard"]!} className="min-h-[24rem] lg:col-span-8" />
      <div className="bg-frame flex flex-col rounded-[1.75rem] p-2.5 lg:col-span-4">
        <div className="dark bg-[oklch(0.17_0_0)] text-foreground flex flex-1 flex-col justify-between rounded-[1.25rem] p-7">
          <p className="text-7xl font-semibold tracking-[-0.06em] tabular-nums sm:text-8xl">{total}</p>
          <div>
            <p className="text-lg font-medium tracking-[-0.01em]">AI components, and the screens that use them.</p>
            <Link href="/components?category=ai" className="focus-visible:ring-ring/60 mt-4 inline-flex items-center gap-1.5 rounded-sm text-sm font-medium underline underline-offset-4 outline-none focus-visible:ring-[3px]">
              Browse them all <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
