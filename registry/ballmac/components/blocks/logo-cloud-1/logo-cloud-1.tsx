// Ballmac UI: Logo Cloud 1. https://ui.ballmac.com/blocks/logo-cloud-1
import * as React from "react"
import { Aperture, Atom, Boxes, Hexagon, Layers, Orbit, Triangle, Waves, type LucideIcon } from "lucide-react"

import { Marquee } from "@/components/ballmac/marquee"
import { cn } from "@/lib/utils"

type Logo = {
  /** Company name, used as the accessible label and shown as a wordmark. */
  name: string
  /** A mark drawn before the name. Swap for your customers' SVG logos. */
  icon?: LucideIcon
  /** Render your own logo instead of the icon and name. */
  logo?: React.ReactNode
}

type LogoCloud1Props = Omit<React.ComponentProps<"section">, "title"> & {
  /** Line above the logos. */
  title?: string
  /** Logos to show. */
  logos?: Logo[]
  /** A scrolling row, or a static grid with hairline dividers. */
  variant?: "marquee" | "grid"
}

const defaultLogos: Logo[] = [
  { name: "Acme", icon: Triangle },
  { name: "Lumen", icon: Aperture },
  { name: "Halcyon", icon: Waves },
  { name: "Meridian", icon: Orbit },
  { name: "Parallax", icon: Layers },
  { name: "Quanta", icon: Atom },
  { name: "Hexline", icon: Hexagon },
  { name: "Stackwise", icon: Boxes },
]

function Wordmark({ logo }: { logo: Logo }) {
  if (logo.logo) return <>{logo.logo}</>
  const Icon = logo.icon
  return (
    <span className="flex items-center gap-2 text-xl font-semibold tracking-tight whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground">
      {Icon && <Icon className="size-6" strokeWidth={2.2} aria-hidden="true" />}
      {logo.name}
    </span>
  )
}

function LogoCloud1({ title = "Trusted by fast-moving product teams", logos = defaultLogos, variant = "marquee", className, ...props }: LogoCloud1Props) {
  return (
    <section data-slot="logo-cloud-1" aria-label={title} className={cn("mx-auto max-w-6xl px-4 py-16 sm:px-6", className)} {...props}>
      <p className="text-center text-sm font-medium text-muted-foreground">{title}</p>
      {variant === "marquee" ? (
        <Marquee speed={36} gap={64} fade pauseOnHover className="mt-8 py-2">
          {logos.map((l) => (
            <Wordmark key={l.name} logo={l} />
          ))}
        </Marquee>
      ) : (
        <ul className="mt-8 grid grid-cols-2 overflow-hidden rounded-2xl border sm:grid-cols-4">
          {logos.map((l) => (
            <li key={l.name} className="-mr-px -mb-px flex h-24 items-center justify-center border-r border-b">
              <Wordmark logo={l} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export { LogoCloud1, type LogoCloud1Props, type Logo }
