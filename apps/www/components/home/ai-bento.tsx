"use client"

import { ArrowUpRight } from "lucide-react"
import * as React from "react"

import AgentGraphDemo from "@/registry/examples/agent-graph-demo"
import AutonomyDialDemo from "@/registry/examples/autonomy-dial-demo"
import CitedAnswerDemo from "@/registry/examples/cited-answer-demo"
import EvalScorecardDemo from "@/registry/examples/eval-scorecard-demo"
import ThinkingLoaderDemo from "@/registry/examples/thinking-loader-demo"
import ToolCallCardDemo from "@/registry/examples/tool-call-card-demo"
import { LazyMount } from "@/components/site/lazy-mount"
import Link from "@/components/site/link"
import { cn } from "@/lib/utils"

function Tile({ name, href, label, className, children }: { name: string; href: string; label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("group bg-card relative flex flex-col overflow-hidden rounded-3xl border", className)}>
      <div className="flex items-center justify-between gap-3 px-5 pt-4">
        <span className="text-muted-foreground font-mono text-xs">{name}</span>
        <Link href={href} className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 inline-flex items-center gap-1 rounded-sm text-xs font-medium outline-none focus-visible:ring-[3px]">
          {label} <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
      <LazyMount className="relative min-h-0 flex-1 overflow-hidden px-5 pt-4 pb-5" rootMargin="300px">
        {children}
        <div aria-hidden="true" className="from-card pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t to-transparent" />
      </LazyMount>
    </div>
  )
}

/**
 * Real AI components, running. Not pictures of them: hover a number in the answer, drag the dial, open the tool call, click a node in the graph. The tiles are
 * different sizes on purpose, and each one links to its own page.
 */
export function AiBento({ total }: { total: number }) {
  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <Tile name="cited-answer" href="/components/cited-answer" label="Open" className="h-[27rem] lg:col-span-7">
        <CitedAnswerDemo />
      </Tile>
      <Tile name="autonomy-dial" href="/components/autonomy-dial" label="Open" className="h-[27rem] lg:col-span-5">
        <AutonomyDialDemo />
      </Tile>
      <Tile name="tool-call-card" href="/components/tool-call-card" label="Open" className="h-[29rem] lg:col-span-5">
        <div className="grid gap-5">
          <ThinkingLoaderDemo />
          <ToolCallCardDemo />
        </div>
      </Tile>
      <Tile name="agent-graph" href="/components/agent-graph" label="Open" className="h-[29rem] lg:col-span-7">
        <AgentGraphDemo />
      </Tile>
      <Tile name="eval-scorecard" href="/components/eval-scorecard" label="Open" className="h-[26rem] lg:col-span-8">
        <EvalScorecardDemo />
      </Tile>
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
