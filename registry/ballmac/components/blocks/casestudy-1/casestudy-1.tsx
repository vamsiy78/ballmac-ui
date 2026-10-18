// Ballmac UI: Case Study 1. https://ui.ballmac.com/blocks/casestudy-1
"use client"

import * as React from "react"
import { ArrowRight, Quote } from "lucide-react"

import { BlurFade } from "@/components/ballmac/blur-fade"
import { CoverArt, type CoverArtVariant } from "@/components/ballmac/cover-art"
import { NumberTicker } from "@/components/ballmac/number-ticker"
import { cn } from "@/lib/utils"

type CaseStudy1Metric = {
  value: number
  /** Text before the number, such as "$" or "−". */
  prefix?: string
  /** Text after the number, such as "%" or "x". */
  suffix?: string
  label: string
}

type CaseStudy1Story = {
  id: string
  company: string
  /** The group the story is filed under, used by the filter. */
  industry: string
  /** What happened, as a sentence. */
  headline: string
  summary?: string
  quote?: string
  person?: { name: string; role: string }
  metrics: CaseStudy1Metric[]
  href?: string
}

type CaseStudy1Props = Omit<React.ComponentProps<"section">, "title"> & {
  eyebrow?: string
  title?: string
  description?: string
  /** The first story is shown large; the rest sit in a grid below. */
  stories?: CaseStudy1Story[]
  /** Which kind of picture draws behind each story. */
  art?: CoverArtVariant
}

const sample: CaseStudy1Story[] = [
  {
    id: "northwind",
    company: "Northwind",
    industry: "Logistics",
    headline: "Northwind cut onboarding from three weeks to four days",
    summary: "Seven regional teams ran on seven spreadsheets. One shared workspace replaced them and every new hire now starts with the same checklist.",
    quote: "We stopped asking where the latest version lived. There is only one, and everybody can see it.",
    person: { name: "Elena Marsh", role: "VP Operations" },
    metrics: [
      { value: 81, suffix: "%", label: "faster onboarding" },
      { value: 14, suffix: "k", label: "hours saved a year" },
      { value: 3, suffix: "x", label: "fewer handoff errors" },
    ],
    href: "#",
  },
  {
    id: "lumen",
    company: "Lumen Health",
    industry: "Healthcare",
    headline: "Lumen Health answers patients in minutes, not days",
    summary: "Requests used to wait in a shared inbox. Now each one is routed, tracked and answered inside the day.",
    metrics: [{ value: 92, suffix: "%", label: "answered the same day" }, { value: 40, suffix: "%", label: "fewer calls" }],
    href: "#",
  },
  {
    id: "orbit",
    company: "Orbit Labs",
    industry: "Software",
    headline: "Orbit Labs shipped its redesign in six weeks, not six months",
    summary: "A shared system of components let design and engineering stop arguing about buttons.",
    metrics: [{ value: 6, label: "weeks to ship" }, { value: 70, suffix: "%", label: "less rework" }],
    href: "#",
  },
  {
    id: "fable",
    company: "Fable & Co",
    industry: "Retail",
    headline: "Fable & Co grew repeat orders by a third in one quarter",
    summary: "Clear order tracking and fewer surprises made customers come back.",
    metrics: [{ value: 34, suffix: "%", label: "more repeat orders" }, { value: 2, suffix: "x", label: "reviews left" }],
    href: "#",
  },
]

const arts: CoverArtVariant[] = ["mesh", "rings", "waves", "bars", "dots"]

function Mark({ name, className }: { name: string; className?: string }) {
  return (
    <span aria-hidden="true" className={cn("bg-foreground text-background flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-semibold", className)}>
      {name[0]}
    </span>
  )
}

function Metrics({ items, big }: { items: CaseStudy1Metric[]; big?: boolean }) {
  return (
    <dl className={cn("grid gap-x-8 gap-y-5", big ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2")}>
      {items.map((m) => (
        <div key={m.label}>
          <dd className={cn("font-semibold tracking-[-0.04em] tabular-nums", big ? "text-4xl sm:text-5xl" : "text-3xl")}>
            {m.prefix}
            <NumberTicker value={m.value} />
            {m.suffix}
          </dd>
          <dt className="text-muted-foreground mt-1 text-sm text-pretty">{m.label}</dt>
        </div>
      ))}
    </dl>
  )
}

/**
 * Customer stories for a marketing page: the first story large, with its quote and results counting up, and the rest in a grid with one
 * headline number each. A filter by industry appears when there is more than one. Pictures are drawn from each company's name, so there are
 * no image files to supply and they stay the same on every load.
 */
function CaseStudy1({
  eyebrow = "Customer stories",
  title = "Teams that got their time back",
  description = "What changed after they moved to a single place for the work, in their numbers and their words.",
  stories = sample,
  art = "mesh",
  className,
  ...props
}: CaseStudy1Props) {
  const id = React.useId()
  const industries = React.useMemo(() => [...new Set(stories.map((s) => s.industry))], [stories])
  const [industry, setIndustry] = React.useState<string | null>(null)
  const shown = industry ? stories.filter((s) => s.industry === industry) : stories
  const [lead, ...rest] = shown

  return (
    <section data-slot="casestudy-1" aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24", className)} {...props}>
      <header className="mx-auto max-w-2xl text-center">
        <p className="text-muted-foreground text-sm font-medium">{eyebrow}</p>
        <h2 id={`${id}-title`} className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">
          {title}
        </h2>
        <p className="text-muted-foreground mt-4 text-lg text-pretty">{description}</p>
      </header>

      {industries.length > 1 ? (
        <div role="group" aria-label="Filter by industry" className="mt-10 flex flex-wrap justify-center gap-2">
          {[null, ...industries].map((i) => (
            <button
              key={i ?? "all"}
              type="button"
              aria-pressed={industry === i}
              onClick={() => setIndustry(i)}
              className={cn("focus-visible:ring-ring/50 rounded-full border px-4 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px] motion-reduce:transition-none", industry === i ? "bg-foreground text-background border-foreground" : "hover:bg-accent")}
            >
              {i ?? "All"}
            </button>
          ))}
        </div>
      ) : null}

      {lead ? (
        <BlurFade inView once>
          <article className="bg-card mt-10 grid overflow-hidden rounded-3xl border lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
            <div className="relative isolate min-h-64 overflow-hidden p-8 sm:p-10">
              <CoverArt seed={lead.company} variant={art} className="absolute inset-0 -z-10" />
              <div className="from-background/0 to-background/50 absolute inset-0 -z-10 bg-gradient-to-b" aria-hidden="true" />
              <div className="flex items-center gap-3">
                <Mark name={lead.company} />
                <p className="text-lg font-semibold tracking-tight">{lead.company}</p>
                <span className="bg-background/70 ms-auto rounded-full border px-3 py-1 text-xs font-medium backdrop-blur">{lead.industry}</span>
              </div>
              {lead.quote ? (
                <figure className="mt-16 sm:mt-24">
                  <Quote aria-hidden="true" className="size-7 opacity-60 rtl:-scale-x-100" />
                  <blockquote className="mt-3 text-xl leading-snug font-medium tracking-tight text-pretty sm:text-2xl">{lead.quote}</blockquote>
                  {lead.person ? (
                    <figcaption className="mt-5 text-sm">
                      <span className="font-semibold">{lead.person.name}</span>
                      <span className="text-foreground/70">, {lead.person.role}</span>
                    </figcaption>
                  ) : null}
                </figure>
              ) : null}
            </div>
            <div className="flex flex-col justify-between gap-10 p-8 sm:p-10">
              <div>
                <h3 className="text-2xl font-semibold tracking-[-0.03em] text-balance sm:text-3xl">{lead.headline}</h3>
                {lead.summary ? <p className="text-muted-foreground mt-4 text-base text-pretty">{lead.summary}</p> : null}
              </div>
              <Metrics items={lead.metrics} big />
              {lead.href ? (
                <a href={lead.href} className="group focus-visible:ring-ring/50 inline-flex w-fit items-center gap-2 rounded-md text-sm font-semibold outline-none focus-visible:ring-[3px]">
                  Read the story <span className="sr-only">about {lead.company}</span>
                  <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1 motion-reduce:transition-none" />
                </a>
              ) : null}
            </div>
          </article>
        </BlurFade>
      ) : null}

      {rest.length ? (
        <ul className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((s, i) => (
            <li key={s.id}>
              <BlurFade inView once delay={i * 0.06} className="h-full">
                <article className="bg-card group relative flex h-full flex-col overflow-hidden rounded-3xl border transition-shadow duration-200 hover:shadow-lg motion-reduce:transition-none">
                  <div className="relative isolate flex h-36 items-end overflow-hidden p-5">
                    <CoverArt seed={s.company} variant={arts[(i + 1) % arts.length]} className="absolute inset-0 -z-10 transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none" />
                    <div aria-hidden="true" className="from-background/80 absolute inset-x-0 bottom-0 -z-10 h-20 bg-gradient-to-t to-transparent" />
                    <div className="flex w-full items-center gap-3">
                      <Mark name={s.company} className="size-8 text-xs" />
                      <p className="font-semibold tracking-tight">{s.company}</p>
                      <span className="bg-background/70 ms-auto rounded-full border px-2.5 py-0.5 text-xs font-medium backdrop-blur">{s.industry}</span>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col gap-5 p-6">
                    <h3 className="text-lg leading-snug font-semibold tracking-tight text-balance">
                      {s.href ? (
                        <a href={s.href} className="focus-visible:ring-ring/50 rounded-sm outline-none after:absolute after:inset-0 focus-visible:ring-[3px]">
                          {s.headline}
                        </a>
                      ) : (
                        s.headline
                      )}
                    </h3>
                    {s.summary ? <p className="text-muted-foreground text-sm text-pretty">{s.summary}</p> : null}
                    <div className="mt-auto border-t pt-5">
                      <Metrics items={s.metrics.slice(0, 2)} />
                    </div>
                  </div>
                </article>
              </BlurFade>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}

export { CaseStudy1, type CaseStudy1Props, type CaseStudy1Story, type CaseStudy1Metric }
