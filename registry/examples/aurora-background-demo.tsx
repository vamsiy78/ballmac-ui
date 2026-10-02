import { ArrowRight } from "lucide-react"

import { AuroraBackground } from "@/components/ballmac/aurora-background"

export default function AuroraBackgroundDemo() {
  return (
    <div className="relative isolate flex h-[380px] w-full max-w-2xl flex-col items-center justify-center overflow-hidden rounded-xl border bg-background px-6 text-center">
      <AuroraBackground className="-z-10" />
      <span className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background/50 px-3 py-1 text-xs font-medium backdrop-blur">
        Introducing Acme 3
        <ArrowRight className="size-3 text-muted-foreground rtl:rotate-180" aria-hidden="true" />
      </span>
      <h2 className="mt-5 max-w-lg text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
        Quiet software for loud ideas.
      </h2>
      <p className="mt-3 max-w-sm text-sm text-muted-foreground sm:text-base">
        Notes, tasks and docs that stay out of your way until you need them.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <a
          href="#"
          className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground outline-none transition-opacity duration-150 hover:opacity-90 focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          Download for Mac
        </a>
        <a
          href="#"
          className="inline-flex h-10 items-center rounded-full border bg-background/60 px-5 text-sm font-medium backdrop-blur outline-none transition-colors duration-150 hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          See what&apos;s new
        </a>
      </div>
    </div>
  )
}
