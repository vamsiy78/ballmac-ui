import { ArrowRight, Sparkles } from "lucide-react"

import { GlowBorder } from "@/components/ballmac/glow-border"

export default function GlowBorderButton() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <GlowBorder radius={999} width={1.5} duration={3} arc={1} glow={0.7} className="inline-flex" contentClassName="bg-background">
        <button
          type="button"
          className="inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <Sparkles className="size-4 text-chart-4" aria-hidden="true" />
          Ask the assistant
        </button>
      </GlowBorder>
      <GlowBorder radius={10} width={1} duration={4} arc={0.35} glow={0.4} className="inline-flex" contentClassName="bg-primary text-primary-foreground">
        <a
          href="#"
          className="inline-flex h-9 items-center gap-1.5 rounded-[9px] px-4 text-sm font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          Start free trial
          <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
        </a>
      </GlowBorder>
    </div>
  )
}
