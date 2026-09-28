// Ballmac UI: Features 2. https://ui.ballmac.com/blocks/features-2
import * as React from "react"
import { Accessibility, Boxes, Code2, Moon, Palette, Terminal } from "lucide-react"

import { cn } from "@/lib/utils"

type Feature = { icon: React.ComponentType<{ className?: string }>; title: string; body: string }

type Features2Props = Omit<React.ComponentProps<"section">, "title"> & {
  /** Mono label above the heading. */
  eyebrow?: string
  /** Section heading. */
  title?: string
  /** The features, three per row on desktop. */
  features?: Feature[]
}

const defaults: Feature[] = [
  { icon: Terminal, title: "One-command setup", body: "Install with your package manager of choice. No config files to write." },
  { icon: Code2, title: "Typed end to end", body: "Every API is typed, so your editor catches mistakes before your users do." },
  { icon: Accessibility, title: "Accessible by default", body: "Keyboard support, focus management and ARIA are built in, not bolted on." },
  { icon: Palette, title: "Themeable", body: "Change a few CSS variables and everything follows your brand." },
  { icon: Moon, title: "Dark mode", body: "Designed for both themes from the start, not inverted after the fact." },
  { icon: Boxes, title: "Composable", body: "Small parts that combine, instead of one component with fifty props." },
]

function Features2({ eyebrow = "Why teams switch", title = "Built for the way you already work.", features = defaults, className, ...props }: Features2Props) {
  return (
    <section data-slot="features-2" className={cn("mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28", className)} {...props}>
      <div className="max-w-2xl">
        <p className="font-mono text-xs tracking-[0.16em] text-muted-foreground uppercase">{eyebrow}</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl">{title}</h2>
      </div>
      <ul className="mt-12 grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <li key={f.title} className="bg-background p-7">
            <div className="flex items-center justify-between">
              <f.icon className="size-5" aria-hidden="true" />
              <span className="font-mono text-xs text-muted-foreground tabular-nums">{String(i + 1).padStart(2, "0")}</span>
            </div>
            <h3 className="mt-6 font-semibold tracking-tight">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

export { Features2, type Features2Props }
