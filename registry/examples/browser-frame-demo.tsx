import { ArrowRight, BookOpen, Check, Sparkles, Tag } from "lucide-react"

import { BrowserFrame } from "@/components/ballmac/browser-frame"

function Landing() {
  return (
    <div className="relative flex size-full flex-col overflow-hidden bg-background">
      {/* Glow and grid behind the hero */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-40 mx-auto h-[520px] w-[820px] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--chart-1)_32%,transparent),color-mix(in_oklch,var(--chart-4)_14%,transparent)_55%,transparent)] blur-2xl"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 [background-image:linear-gradient(to_right,color-mix(in_oklch,var(--foreground)_6%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--foreground)_6%,transparent)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_60%_55%_at_50%_0%,black,transparent)]"
      />

      <nav className="relative flex items-center gap-8 px-10 py-5 text-[14px]">
        <span className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="size-6 rounded-lg bg-[conic-gradient(from_210deg,var(--chart-1),var(--chart-4),var(--chart-2),var(--chart-1))]" />
          Acme
        </span>
        <span className="text-muted-foreground">Product</span>
        <span className="text-muted-foreground">Docs</span>
        <span className="text-muted-foreground">Pricing</span>
        <span className="ml-auto text-muted-foreground">Sign in</span>
        <span className="rounded-full bg-primary px-4 py-1.5 font-medium text-primary-foreground">Get started</span>
      </nav>

      <div className="relative mt-12 flex flex-col items-center px-10 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-[13px] text-muted-foreground backdrop-blur">
          <Sparkles className="size-3.5 text-chart-4" aria-hidden="true" />
          Release 3.0 is out
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </span>
        <h1 className="mt-6 text-[64px] leading-[1.02] font-semibold tracking-[-0.04em]">
          Ship calmer software.
        </h1>
        <p className="mt-5 max-w-[560px] text-[18px] text-muted-foreground">
          Previews for every branch, rollbacks in one click, and logs that read like a story.
        </p>
        <div className="mt-8 flex gap-3 text-[15px] font-medium">
          <span className="rounded-full bg-primary px-6 py-2.5 text-primary-foreground shadow-lg">Start for free</span>
          <span className="rounded-full border bg-background px-6 py-2.5">Book a demo</span>
        </div>
        <div className="mt-6 flex gap-6 text-[13px] text-muted-foreground">
          {["No credit card", "SOC 2 Type II", "EU data residency"].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <Check className="size-3.5 text-chart-2" aria-hidden="true" />
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Product shot peeking in from the bottom */}
      <div className="relative mx-auto mt-12 w-[860px] flex-1 rounded-t-2xl border border-b-0 bg-card p-4 shadow-[0_-20px_60px_-30px_color-mix(in_oklch,var(--chart-1)_60%,transparent)]">
        <div className="flex gap-3">
          {["w-40", "w-56", "w-32"].map((w, i) => (
            <div key={i} className={`h-20 ${w} rounded-lg border bg-muted/50 p-3`}>
              <div className="h-2 w-12 rounded bg-muted-foreground/30" />
              <div className="mt-3 h-4 w-20 rounded bg-foreground/80" />
            </div>
          ))}
          <div className="h-20 flex-1 rounded-lg border bg-[linear-gradient(180deg,color-mix(in_oklch,var(--chart-1)_18%,transparent),transparent)]" />
        </div>
        <div className="mt-3 flex h-40 items-end gap-2 rounded-lg border bg-muted/30 p-4">
          {[38, 52, 44, 66, 58, 72, 64, 80, 70, 88, 76, 94, 84, 98, 90, 100].map((h, i) => (
            <span
              key={i}
              className="flex-1 rounded-t bg-[linear-gradient(180deg,var(--chart-1),color-mix(in_oklch,var(--chart-1)_25%,transparent))]"
              style={{ height: `${h}%`, opacity: 0.45 + i / 30 }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function BrowserFrameDemo() {
  return (
    <BrowserFrame
      url="acme.com"
      tabs={[
        { title: "Acme: Ship calmer software", icon: <Sparkles /> },
        { title: "Docs", icon: <BookOpen /> },
        { title: "Pricing", icon: <Tag /> },
      ]}
      screenWidth={1100}
      aspectRatio={16 / 10}
      className="max-w-2xl"
    >
      <Landing />
    </BrowserFrame>
  )
}
