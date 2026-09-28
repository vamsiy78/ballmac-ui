// Ballmac UI: Features 1. https://ui.ballmac.com/blocks/features-1
import * as React from "react"
import { GitBranch, Lock, Radar, Zap } from "lucide-react"

import { Kbd, KbdGroup } from "@/components/ballmac/kbd"
import { NumberTicker } from "@/components/ballmac/number-ticker"
import { SpotlightCard } from "@/components/ballmac/spotlight-card"
import { cn } from "@/lib/utils"

type Features1Props = Omit<React.ComponentProps<"section">, "title"> & {
  /** Mono label above the heading. */
  eyebrow?: string
  /** Section heading. */
  title?: string
  /** One sentence under the heading. */
  description?: string
}

function Features1({
  eyebrow = "Features",
  title = "Everything a release needs, in one place.",
  description = "From the first commit to the rollback you never had to use.",
  className,
  ...props
}: Features1Props) {
  return (
    <section data-slot="features-1" className={cn("mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28", className)} {...props}>
      <div className="max-w-2xl">
        <p className="font-mono text-xs tracking-[0.16em] text-muted-foreground uppercase">{eyebrow}</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl">{title}</h2>
        <p className="mt-4 text-lg text-muted-foreground">{description}</p>
      </div>
      <div className="mt-12 grid auto-rows-[minmax(200px,auto)] gap-4 md:grid-cols-3">
        <SpotlightCard className="md:col-span-2">
          <Cell icon={Zap} title="Previews on every push" body="A live URL for each branch, torn down when the branch merges.">
            <div className="mt-6 flex items-end gap-3">
              <span className="text-5xl font-semibold tracking-tight">
                <NumberTicker value={42} />s
              </span>
              <span className="pb-2 text-sm text-muted-foreground">median build time</span>
            </div>
          </Cell>
        </SpotlightCard>
        <SpotlightCard>
          <Cell icon={Lock} title="Secrets stay secret" body="Environment variables are encrypted at rest and never shown in logs." />
        </SpotlightCard>
        <SpotlightCard>
          <Cell icon={Radar} title="Performance budgets" body="Fail a check when a change makes the page slower than you allow." />
        </SpotlightCard>
        <SpotlightCard className="md:col-span-2">
          <Cell icon={GitBranch} title="Keyboard-first reviews" body="Jump between previews, comments and diffs without touching the mouse.">
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <KbdGroup>
                  <Kbd>⌘</Kbd>
                  <Kbd>K</Kbd>
                </KbdGroup>
                Search
              </span>
              <span className="flex items-center gap-2">
                <Kbd>J</Kbd>/<Kbd>K</Kbd> Next and previous
              </span>
              <span className="flex items-center gap-2">
                <Kbd>R</Kbd> Roll back
              </span>
            </div>
          </Cell>
        </SpotlightCard>
      </div>
    </section>
  )
}

function Cell({ icon: Icon, title, body, children }: { icon: React.ComponentType<{ className?: string }>; title: string; body: string; children?: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col p-6">
      <span className="flex size-9 items-center justify-center rounded-lg border bg-background">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <h3 className="mt-5 font-semibold tracking-tight">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
      {children}
    </div>
  )
}

export { Features1, type Features1Props }
