// Ballmac UI: Careers 1. https://ui.ballmac.com/blocks/careers-1
"use client"

import * as React from "react"
import { ArrowUpRight, BookOpen, Globe, HeartPulse, Laptop, MapPin, Plane, SearchX, Wallet } from "lucide-react"

import { buttonVariants } from "@/components/ballmac/button"
import { SearchField } from "@/components/ballmac/search-field"
import { cn } from "@/lib/utils"

type Careers1Job = {
  title: string
  /** Team, used to group and filter the list. */
  team: string
  /** Where the role is based, e.g. "Remote (Europe)". */
  location: string
  /** Employment type. */
  type?: string
  /** Where to apply. */
  href: string
}

type Careers1Perk = {
  icon?: React.ReactNode
  title: string
  description: string
}

type Careers1Props = Omit<React.ComponentProps<"section">, "title"> & {
  /** Label above the heading. */
  eyebrow?: string
  /** Section heading. */
  title?: string
  /** One or two sentences under the heading. */
  description?: string
  /** Open roles. */
  jobs?: Careers1Job[]
  /** Reasons to join, shown as a grid under the list. Pass an empty array to hide it. */
  perks?: Careers1Perk[]
  /** Link for people who do not see a fitting role. Pass null to hide it. */
  openApplication?: { label: string; href: string } | null
}

const defaultJobs: Careers1Job[] = [
  { title: "Senior Backend Engineer", team: "Engineering", location: "Remote (Europe)", type: "Full-time", href: "#" },
  { title: "Staff Frontend Engineer", team: "Engineering", location: "Remote (Americas)", type: "Full-time", href: "#" },
  { title: "Site Reliability Engineer", team: "Engineering", location: "Lisbon", type: "Full-time", href: "#" },
  { title: "Product Designer", team: "Design", location: "Remote (Europe)", type: "Full-time", href: "#" },
  { title: "Brand Designer", team: "Design", location: "Berlin", type: "Contract", href: "#" },
  { title: "Customer Success Manager", team: "Customer", location: "Remote (Americas)", type: "Full-time", href: "#" },
  { title: "Support Engineer", team: "Customer", location: "Remote (Europe)", type: "Full-time", href: "#" },
  { title: "Head of Growth", team: "Marketing", location: "Lisbon", type: "Full-time", href: "#" },
]

const defaultPerks: Careers1Perk[] = [
  { icon: <Globe />, title: "Remote-first", description: "Work from anywhere in our time zones. Offices are optional meeting places." },
  { icon: <Wallet />, title: "Real ownership", description: "Meaningful equity for every full-time teammate, with a four-year schedule." },
  { icon: <BookOpen />, title: "Learning budget", description: "$2,000 a year for books, courses and conferences, no questions asked." },
  { icon: <HeartPulse />, title: "Health first", description: "Private health cover, mental health support and 25 days of paid leave." },
  { icon: <Laptop />, title: "Great tools", description: "Pick your own hardware and set up a home office with a $1,500 allowance." },
  { icon: <Plane />, title: "Twice-a-year retreats", description: "The whole company meets somewhere warm to plan, build and rest." },
]

function Careers1({
  eyebrow = "Careers",
  title = "Build calm software with us.",
  description = "We are a small, remote team that ships often and cares about the details. Come do the best work of your career.",
  jobs = defaultJobs,
  perks = defaultPerks,
  openApplication = { label: "Send an open application", href: "#" },
  className,
  ...props
}: Careers1Props) {
  const [team, setTeam] = React.useState("All")
  const [query, setQuery] = React.useState("")
  const teams = ["All", ...Array.from(new Set(jobs.map((j) => j.team)))]
  const q = query.trim().toLowerCase()
  const visible = jobs.filter(
    (j) => (team === "All" || j.team === team) && (!q || `${j.title} ${j.team} ${j.location}`.toLowerCase().includes(q))
  )
  const groups = Array.from(new Set(visible.map((j) => j.team))).map((t) => ({ team: t, jobs: visible.filter((j) => j.team === t) }))

  return (
    <section data-slot="careers-1" className={cn("mx-auto max-w-5xl px-4 py-20 sm:px-6 md:py-28", className)} {...props}>
      <div className="max-w-2xl">
        <p className="text-muted-foreground text-sm font-medium">{eyebrow}</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl lg:text-5xl">{title}</h2>
        <p className="text-muted-foreground mt-4 text-lg text-pretty">{description}</p>
      </div>

      <div className="mt-12 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label="Filter by team" className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0">
          {teams.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={team === t}
              onClick={() => setTeam(t)}
              className={cn(
                "focus-visible:ring-ring/50 h-9 shrink-0 rounded-full border px-4 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px]",
                team === t ? "bg-foreground text-background border-transparent" : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <SearchField className="lg:w-72" label="Search roles" placeholder="Search roles or places" value={query} onValueChange={setQuery} />
      </div>

      <p role="status" className="sr-only">{visible.length} open {visible.length === 1 ? "role" : "roles"} shown.</p>

      <div className="mt-8 space-y-8">
        {groups.map((g) => (
          <div key={g.team}>
            <h3 className="text-muted-foreground flex items-center gap-2 px-1 pb-3 text-sm font-medium">
              {g.team}
              <span className="bg-muted text-foreground rounded-full px-2 py-0.5 text-xs tabular-nums">{g.jobs.length}</span>
            </h3>
            <ul className="bg-card divide-y overflow-hidden rounded-3xl border">
              {g.jobs.map((j) => (
                <li key={j.title + j.location}>
                  <a href={j.href} className="group/job hover:bg-accent/60 focus-visible:ring-ring/50 flex items-center gap-4 px-5 py-4 outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-inset sm:px-6 sm:py-5">
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-balance">{j.title}</span>
                      <span className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                        <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" aria-hidden="true" />{j.location}</span>
                        {j.type && <span>{j.type}</span>}
                      </span>
                    </span>
                    <span className="text-muted-foreground group-hover/job:text-foreground inline-flex items-center gap-1 text-sm font-medium transition-colors">
                      <span className="hidden sm:inline">Apply</span>
                      <ArrowUpRight className="size-4 transition-transform group-hover/job:translate-x-0.5 group-hover/job:-translate-y-0.5 motion-reduce:transition-none" aria-hidden="true" />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {visible.length === 0 && (
          <div className="flex flex-col items-center rounded-3xl border border-dashed px-6 py-14 text-center">
            <span className="bg-muted flex size-12 items-center justify-center rounded-full"><SearchX className="size-5" aria-hidden="true" /></span>
            <p className="mt-4 font-semibold">No open roles match</p>
            <p className="text-muted-foreground mt-1 max-w-sm text-sm">Try another team or a broader search. New roles are posted here first.</p>
            <button type="button" onClick={() => { setQuery(""); setTeam("All") }} className={buttonVariants({ variant: "outline", size: "sm", shape: "pill", className: "mt-5" })}>Reset filters</button>
          </div>
        )}
      </div>

      {openApplication && (
        <p className="text-muted-foreground mt-8 text-center text-sm">
          Don’t see the right role?{" "}
          <a href={openApplication.href} className="text-foreground focus-visible:ring-ring/50 rounded-sm font-medium underline underline-offset-4 outline-none focus-visible:ring-[3px]">{openApplication.label}</a>.
        </p>
      )}

      {perks.length > 0 && (
        <div className="mt-24">
          <h3 className="text-2xl font-semibold tracking-[-0.03em]">Why you’ll like it here</h3>
          <ul className="bg-border mt-8 grid gap-px overflow-hidden rounded-3xl border sm:grid-cols-2 lg:grid-cols-3">
            {perks.map((p) => (
              <li key={p.title} className="bg-card p-6 sm:p-8">
                <span aria-hidden="true" className="bg-muted flex size-10 items-center justify-center rounded-xl [&_svg]:size-5">{p.icon ?? <Globe />}</span>
                <p className="mt-5 font-semibold">{p.title}</p>
                <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed text-pretty">{p.description}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

export { Careers1, type Careers1Props, type Careers1Job, type Careers1Perk }
