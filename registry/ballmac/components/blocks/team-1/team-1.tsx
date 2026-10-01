// Ballmac UI: Team 1. https://ui.ballmac.com/blocks/team-1
import * as React from "react"
import { ArrowRight, Link2, MapPin } from "lucide-react"

import { buttonVariants } from "@/components/ballmac/button"
import { cn } from "@/lib/utils"

type Team1Link = {
  /** Accessible name, e.g. "Priya on LinkedIn". */
  label: string
  /** Destination. */
  href: string
  /** Icon. Defaults to a link icon. */
  icon?: React.ReactNode
}

type Team1Member = {
  name: string
  role: string
  /** One or two sentences, revealed over the photo on hover and focus (always visible on phones). */
  bio?: string
  /** City or country. */
  location?: string
  /** Photo URL. Initials on a coloured tile are shown when omitted. */
  image?: string
  /** Social and contact links. */
  links?: Team1Link[]
}

type Team1Props = Omit<React.ComponentProps<"section">, "title"> & {
  /** Label above the heading. */
  eyebrow?: string
  /** Section heading. */
  title?: string
  /** One or two sentences under the heading. */
  description?: string
  /** The people. Four or eight fill the grid evenly. */
  members?: Team1Member[]
  /** Link beside the heading, e.g. to open roles. Pass null to hide it. */
  action?: { label: string; href: string } | null
}

const tiles = [
  "from-chart-1/70 to-chart-1/20",
  "from-chart-3/70 to-chart-3/20",
  "from-chart-5/70 to-chart-5/20",
  "from-chart-2/70 to-chart-2/20",
  "from-chart-4/70 to-chart-4/20",
]

const defaults: Team1Member[] = [
  { name: "Priya Raman", role: "Co-founder, CEO", bio: "Spent a decade in finance ops before deciding the tools needed to be kinder.", location: "Lisbon", links: [{ label: "Priya’s website", href: "#" }] },
  { name: "Marcus Webb", role: "Co-founder, CTO", bio: "Builds the boring, reliable parts so everyone else can move fast.", location: "Austin", links: [{ label: "Marcus’s website", href: "#" }] },
  { name: "Elena Fischer", role: "Head of Design", bio: "Believes good software feels like a quiet room. Obsessed with small details.", location: "Berlin", links: [{ label: "Elena’s portfolio", href: "#" }] },
  { name: "Tomás Herrera", role: "Head of Customer Success", bio: "Answers the hard questions first. Has read every support thread we have.", location: "Mexico City", links: [{ label: "Tomás’s website", href: "#" }] },
  { name: "Amara Singh", role: "Staff Engineer", bio: "Makes the database fast, then makes it understandable.", location: "Toronto", links: [{ label: "Amara’s website", href: "#" }] },
  { name: "Jonas Ortiz", role: "Product Manager", bio: "Turns messy customer calls into clear, shippable ideas.", location: "Madrid", links: [{ label: "Jonas’s website", href: "#" }] },
  { name: "Yuki Tanaka", role: "Product Designer", bio: "Draws interfaces on paper first, and throws most of them away.", location: "Osaka", links: [{ label: "Yuki’s portfolio", href: "#" }] },
  { name: "Ingrid Larsen", role: "Security Lead", bio: "Sleeps well because the audit log never lies.", location: "Oslo", links: [{ label: "Ingrid’s website", href: "#" }] },
]

const initials = (name: string) => name.split(" ").map((w) => w[0]).join("").slice(0, 2)

function Team1({
  eyebrow = "Our team",
  title = "The people behind the product.",
  description = "A small, remote team that cares a lot about getting the details right.",
  members = defaults,
  action = { label: "See open roles", href: "#" },
  className,
  ...props
}: Team1Props) {
  return (
    <section data-slot="team-1" className={cn("mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28", className)} {...props}>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="text-muted-foreground text-sm font-medium">{eyebrow}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl lg:text-5xl">{title}</h2>
          <p className="text-muted-foreground mt-4 text-lg text-pretty">{description}</p>
        </div>
        {action && (
          <a href={action.href} className={buttonVariants({ variant: "outline", shape: "pill", className: "w-fit" })}>
            {action.label} <ArrowRight />
          </a>
        )}
      </div>

      <ul className="mt-12 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {members.map((m, i) => (
          <li key={m.name} data-slot="team-1-member" className="group/member">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border">
              {m.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.image} alt="" className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover/member:scale-105 motion-reduce:transition-none motion-reduce:group-hover/member:scale-100" />
              ) : (
                <div aria-hidden="true" className={cn("absolute inset-0 flex items-center justify-center bg-gradient-to-br", tiles[i % tiles.length])}>
                  <span className="text-foreground/80 text-6xl font-semibold tracking-tight select-none">{initials(m.name)}</span>
                  <div className="absolute inset-0 bg-[radial-gradient(color-mix(in_oklch,var(--foreground)_18%,transparent)_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(80%_80%_at_50%_50%,transparent_30%,black)]" />
                </div>
              )}
              {m.bio && (
                <div className="from-background via-background/95 absolute inset-x-0 bottom-0 hidden translate-y-3 bg-gradient-to-t to-transparent p-4 pt-14 text-sm opacity-0 transition-all duration-300 group-focus-within/member:translate-y-0 group-focus-within/member:opacity-100 group-hover/member:translate-y-0 group-hover/member:opacity-100 motion-reduce:transition-none md:block">
                  <p className="text-pretty">{m.bio}</p>
                </div>
              )}
            </div>
            <div className="mt-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-semibold">{m.name}</h3>
                <p className="text-muted-foreground text-sm">{m.role}</p>
                {m.location && (
                  <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                    <MapPin className="size-3" aria-hidden="true" />
                    {m.location}
                  </p>
                )}
              </div>
              {m.links && m.links.length > 0 && (
                <ul className="flex shrink-0 gap-1">
                  {m.links.map((l) => (
                    <li key={l.href + l.label}>
                      <a
                        href={l.href}
                        aria-label={l.label}
                        className="text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:ring-ring/50 flex size-8 items-center justify-center rounded-full outline-none transition-colors focus-visible:ring-[3px] [&_svg]:size-4"
                      >
                        {l.icon ?? <Link2 />}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {m.bio && <p className="text-muted-foreground mt-3 text-sm text-pretty md:hidden">{m.bio}</p>}
          </li>
        ))}
      </ul>
    </section>
  )
}

export { Team1, type Team1Props, type Team1Member, type Team1Link }
