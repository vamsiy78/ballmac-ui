// Ballmac UI: Features 3. https://ui.ballmac.com/blocks/features-3
"use client"

import * as React from "react"
import { Calendar, Check, Database, FileText, GitBranch, Mail, MessageSquare, Sparkles, type LucideIcon } from "lucide-react"

import { AnimatedBeam } from "@/components/ballmac/animated-beam"
import { cn } from "@/lib/utils"

type Integration = { name: string; icon: LucideIcon }

type Features3Props = Omit<React.ComponentProps<"section">, "title"> & {
  /** Small label above the heading. */
  eyebrow?: string
  /** The heading. */
  title?: string
  /** One or two sentences under the heading. */
  description?: string
  /** Short benefit lines with check marks. */
  points?: string[]
  /** Up to six tools shown around the hub, three per side. */
  integrations?: Integration[]
  /** Icon in the center of the diagram. */
  hubIcon?: LucideIcon
  /** Accessible name of the hub. */
  hubLabel?: string
}

const defaultIntegrations: Integration[] = [
  { name: "Database", icon: Database },
  { name: "Repository", icon: GitBranch },
  { name: "Docs", icon: FileText },
  { name: "Email", icon: Mail },
  { name: "Calendar", icon: Calendar },
  { name: "Chat", icon: MessageSquare },
]

function Node({ ref, icon: Icon, label, hub }: { ref: React.Ref<HTMLDivElement>; icon: LucideIcon; label: string; hub?: boolean }) {
  return (
    <div className="relative z-10 flex flex-col items-center gap-2">
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center rounded-2xl border shadow-[0_1px_2px_0_rgb(0_0_0/0.06),0_8px_24px_-12px_rgb(0_0_0/0.3)]",
          hub ? "size-20 bg-foreground text-background [&_svg]:size-8" : "size-14 bg-card [&_svg]:size-6"
        )}
      >
        <Icon aria-hidden="true" />
      </div>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  )
}

function Features3({
  eyebrow = "Integrations",
  title = "Connects to the tools you already use.",
  description = "Plug in your data, code and calendar once. Every workflow can read from them and write back, with permissions you control.",
  points = ["Two-way sync in real time", "Scoped, revocable access per tool", "Audit log of every read and write"],
  integrations = defaultIntegrations,
  hubIcon = Sparkles,
  hubLabel = "Your workspace",
  className,
  ...props
}: Features3Props) {
  const container = React.useRef<HTMLDivElement>(null)
  const hub = React.useRef<HTMLDivElement>(null)
  const r0 = React.useRef<HTMLDivElement>(null)
  const r1 = React.useRef<HTMLDivElement>(null)
  const r2 = React.useRef<HTMLDivElement>(null)
  const r3 = React.useRef<HTMLDivElement>(null)
  const r4 = React.useRef<HTMLDivElement>(null)
  const r5 = React.useRef<HTMLDivElement>(null)
  const refs = [r0, r1, r2, r3, r4, r5]
  const tools = integrations.slice(0, 6)
  const left = tools.slice(0, 3)
  const right = tools.slice(3)
  const curve = [60, 0, -60]

  return (
    <section data-slot="features-3" className={cn("mx-auto max-w-6xl px-4 py-20 sm:px-6", className)} {...props}>
      <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
        <div>
          <p className="text-sm font-medium text-primary">{eyebrow}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-5xl">{title}</h2>
          <p className="mt-4 text-lg leading-relaxed text-pretty text-muted-foreground">{description}</p>
          <ul className="mt-8 space-y-3">
            {points.map((p) => (
              <li key={p} className="flex items-center gap-3">
                <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div
          ref={container}
          role="img"
          aria-label={`${hubLabel} connected to ${tools.map((t) => t.name).join(", ")}`}
          className="relative flex items-center justify-between gap-6 rounded-3xl border bg-card/50 px-6 py-10 sm:px-12"
        >
          <div className="flex flex-col gap-8">
            {left.map((t, i) => (
              <Node key={t.name} ref={refs[i]} icon={t.icon} label={t.name} />
            ))}
          </div>
          <Node ref={hub} icon={hubIcon} label={hubLabel} hub />
          <div className="flex flex-col gap-8">
            {right.map((t, i) => (
              <Node key={t.name} ref={refs[i + 3]} icon={t.icon} label={t.name} />
            ))}
          </div>
          {left.map((t, i) => (
            <AnimatedBeam key={t.name} containerRef={container} fromRef={refs[i]} toRef={hub} curvature={curve[i]} delay={i * 0.5} duration={3.5} />
          ))}
          {right.map((t, i) => (
            <AnimatedBeam key={t.name} containerRef={container} fromRef={refs[i + 3]} toRef={hub} curvature={curve[i]} delay={0.25 + i * 0.5} duration={3.5} reverse />
          ))}
        </div>
      </div>
    </section>
  )
}

export { Features3, type Features3Props, type Integration }
