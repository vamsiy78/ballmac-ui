// Ballmac UI: Hero 2. https://ui.ballmac.com/blocks/hero-2
import * as React from "react"
import { ArrowRight } from "lucide-react"

import { BorderBeam } from "@/components/ballmac/border-beam"
import { buttonVariants } from "@/components/ballmac/button"
import { InstallTabs } from "@/components/ballmac/install-tabs"
import { Terminal, TerminalLine } from "@/components/ballmac/terminal"
import { TextReveal } from "@/components/ballmac/text-reveal"
import { cn } from "@/lib/utils"

type Hero2Props = Omit<React.ComponentProps<"section">, "title"> & {
  /** Mono label above the headline. */
  eyebrow?: string
  /** The headline. */
  title?: string
  /** One or two sentences under the headline. */
  description?: string
  /** CLI command without the runner, shown in package-manager tabs. */
  command?: string
  /** Main call to action. */
  primaryAction?: { label: string; href: string }
  /** Secondary call to action. */
  secondaryAction?: { label: string; href: string }
}

function Hero2({
  eyebrow = "v2.0 · Open source",
  title = "Install it once. Use it everywhere.",
  description = "A developer tool that fits your stack in one command, with typed APIs, sensible defaults and nothing to configure on day one.",
  command = "create-acme-app@latest my-app",
  primaryAction = { label: "Read the docs", href: "#" },
  secondaryAction = { label: "View on GitHub", href: "#" },
  className,
  ...props
}: Hero2Props) {
  return (
    <section data-slot="hero-2" className={cn("relative isolate overflow-hidden", className)} {...props}>
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(ellipse_60%_60%_at_50%_0%,color-mix(in_oklch,var(--ring)_18%,transparent),transparent_70%)]"
      />
      <div className="mx-auto max-w-4xl px-4 pt-20 pb-16 text-center sm:px-6 md:pt-28">
        <p className="font-mono text-xs tracking-[0.16em] text-muted-foreground uppercase">{eyebrow}</p>
        <TextReveal as="h1" className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-6xl">
          {title}
        </TextReveal>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-muted-foreground">{description}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a className={buttonVariants({ size: "lg", shape: "pill" })} href={primaryAction.href}>
            {primaryAction.label} <ArrowRight  className="rtl:rotate-180"/>
          </a>
          <a className={buttonVariants({ variant: "outline", size: "lg", shape: "pill" })} href={secondaryAction.href}>{secondaryAction.label}</a>
        </div>
        <InstallTabs command={command} className="mx-auto mt-10 max-w-lg text-start" />
      </div>
      <div className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
        <div className="relative rounded-xl">
          <Terminal title="~/projects" className="w-full">
            <TerminalLine variant="command">npx {command}</TerminalLine>
            <TerminalLine>Creating a new app in ./my-app</TerminalLine>
            <TerminalLine>Installing dependencies…</TerminalLine>
            <TerminalLine variant="success">Ready in 4.2s</TerminalLine>
            <TerminalLine variant="comment"># cd my-app && npm run dev</TerminalLine>
          </Terminal>
          <BorderBeam duration={8} className="rounded-xl" />
        </div>
      </div>
    </section>
  )
}

export { Hero2, type Hero2Props }
