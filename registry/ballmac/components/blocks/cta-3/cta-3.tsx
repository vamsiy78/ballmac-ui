// Ballmac UI: CTA 3. https://ui.ballmac.com/blocks/cta-3
import * as React from "react"
import { ArrowRight, Check } from "lucide-react"

import { buttonVariants } from "@/components/ballmac/button"
import { InstallTabs } from "@/components/ballmac/install-tabs"
import { cn } from "@/lib/utils"

type Action = { label: string; href: string }

type Cta3Props = Omit<React.ComponentProps<"section">, "title"> & {
  /** Heading. */
  title?: string
  /** One or two sentences under the heading. */
  description?: string
  /** Command run through each package manager's runner, e.g. "create-acme@latest my-app". */
  command?: string
  /** Explicit command per package manager; overrides `command`. */
  commands?: React.ComponentProps<typeof InstallTabs>["commands"]
  /** Remember the visitor's package manager across installs on the page and site. */
  storageKey?: string
  /** Main button. */
  primaryAction?: Action
  /** Quiet button. */
  secondaryAction?: Action
  /** Short facts under the command. */
  notes?: string[]
}

function Cta3({
  title = "Start building in under a minute.",
  description = "One command scaffolds a working app with auth, a database and your first deploy already wired up.",
  command = "create-acme@latest my-app",
  commands,
  storageKey,
  primaryAction = { label: "Read the docs", href: "#" },
  secondaryAction = { label: "View on GitHub", href: "#" },
  notes = ["MIT licensed", "Works with Next.js, Remix and Vite", "No account needed"],
  className,
  ...props
}: Cta3Props) {
  return (
    <section data-slot="cta-3" className={cn("mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28", className)} {...props}>
      <div className="bg-card relative isolate overflow-hidden rounded-[2rem] border">
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(color-mix(in_oklch,var(--foreground)_16%,transparent)_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(60%_90%_at_85%_20%,black,transparent)]" />
          <div className="bg-chart-1/20 absolute -top-32 -end-20 size-[26rem] rounded-full blur-[110px]" />
          <div className="bg-chart-5/15 absolute -bottom-40 start-0 size-[22rem] rounded-full blur-[110px]" />
        </div>
        <div className="grid items-center gap-10 p-8 sm:p-12 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:p-16">
          <div>
            <h2 className="text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl lg:text-5xl">{title}</h2>
            <p className="text-muted-foreground mt-4 max-w-lg text-lg text-pretty">{description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a className={buttonVariants({ size: "lg", shape: "pill" })} href={primaryAction.href}>
                {primaryAction.label} <ArrowRight  className="rtl:rotate-180"/>
              </a>
              <a className={buttonVariants({ variant: "outline", size: "lg", shape: "pill" })} href={secondaryAction.href}>{secondaryAction.label}</a>
            </div>
          </div>
          <div>
            <InstallTabs command={command} commands={commands} storageKey={storageKey} className="shadow-[0_30px_70px_-35px_rgb(0_0_0/0.4)]" />
            <ul className="text-muted-foreground mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              {notes.map((n) => (
                <li key={n} className="flex items-center gap-1.5">
                  <Check className="text-chart-2 size-4" aria-hidden="true" />
                  {n}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

export { Cta3, type Cta3Props }
