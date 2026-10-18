// Ballmac UI: About 1. https://ui.ballmac.com/blocks/about-1
"use client"

import * as React from "react"
import { ArrowRight, Compass, Feather, HeartHandshake, Layers } from "lucide-react"

import { BlurFade, BlurFadeGroup } from "@/components/ballmac/blur-fade"
import { buttonVariants } from "@/components/ballmac/button"
import { CoverArt } from "@/components/ballmac/cover-art"
import { Media, type MediaSource } from "@/components/ballmac/media"
import { NumberTicker } from "@/components/ballmac/number-ticker"
import { SpotlightCard } from "@/components/ballmac/spotlight-card"
import { cn } from "@/lib/utils"

type About1Stat = {
  label: string
  value: number
  /** Text after the number ("+", "k", " countries"). */
  suffix?: string
  /** Show the number exactly as written, with no counting up or thousands separator. For years. */
  plain?: boolean
}

type About1Value = { title: string; description: string; icon?: React.ReactNode }

type About1Milestone = { year: string; title: string; description: string }

type About1Action = { label: string; href?: string; onClick?: () => void }

type About1Props = Omit<React.ComponentProps<"section">, "title"> & {
  /** A small label above the headline. */
  eyebrow?: string
  /** The big statement. Pass two lines: the second is set in a softer color. */
  headline?: string | [string, string]
  intro?: string
  /** A wide picture under the headline. Leave out for art drawn from the headline. */
  media?: MediaSource
  mediaAlt?: string
  stats?: About1Stat[]
  storyTitle?: string
  /** The story, one string per paragraph. The first is set larger. */
  story?: string[]
  /** A pull quote beside the story. Pass null to leave it out. */
  quote?: { text: string; name: string; role?: string } | null
  valuesTitle?: string
  values?: About1Value[]
  milestonesTitle?: string
  milestones?: About1Milestone[]
  /** The closing call to action. Pass null to leave it out. */
  cta?: { title: string; description?: string; primary: About1Action; secondary?: About1Action } | null
  /** BCP 47 locale for the numbers. */
  locale?: string
}

const sampleValues: About1Value[] = [
  { title: "Make it quiet", description: "Software should get out of the way. We would rather remove a feature than add a notification.", icon: <Feather /> },
  { title: "Be honest about trade-offs", description: "Every choice costs something. We write down what we gave up, and why, where customers can read it.", icon: <Compass /> },
  { title: "Build for the long term", description: "We ship fewer things and keep them working for years. Files you save today should open in ten.", icon: <Layers /> },
  { title: "Treat people as adults", description: "Clear pricing, plain words and an export button that works. You can leave whenever you like, and take everything.", icon: <HeartHandshake /> },
]

const sampleMilestones: About1Milestone[] = [
  { year: "2019", title: "Two people and a spreadsheet", description: "Mara and Theo start building the first version in a rented room above a bakery in Lisbon." },
  { year: "2021", title: "The first hundred customers", description: "A small waiting list becomes a real product. Every customer gets a personal reply, and we keep doing it." },
  { year: "2023", title: "A team of twelve", description: "Support, design and engineering share one table. We open a second office in Porto and start our four-day week." },
  { year: "2025", title: "Version two", description: "A rewrite from the ground up, with offline support and an API. Ten thousand teams move across in the first month." },
  { year: "2026", title: "Twenty thousand teams", description: "Still independent, still profitable, still answering every email." },
]

const sampleStats: About1Stat[] = [
  { label: "Teams use it every day", value: 20, suffix: "k+" },
  { label: "Countries", value: 74 },
  { label: "People on the team", value: 23 },
  { label: "Founded", value: 2019, plain: true },
]

const sampleStory = [
  "We started Acme because we were tired of tools that asked for more of our attention than the work itself.",
  "In 2019 we were two people running a small studio. Every project began with the same ritual: a spreadsheet, a chat thread and a folder nobody could find. We wanted one calm place where the work lived, and we could not find it, so we built it for ourselves.",
  "Friends asked to use it. Then their teams did. We kept the promise we made at the start: no ads, no selling data, and a person on the other end of every email. Years later it is the same promise, with a few more people keeping it.",
]

/**
 * A company story page: a large two-tone statement and a wide picture, numbers that count up, the story beside a pull quote, value cards
 * that light up under the pointer, a milestone timeline, and a closing call to action. Everything is content you pass in.
 */
function About1({
  eyebrow = "About us",
  headline = ["We make software for people who make things.", "Quietly, and for the long run."],
  intro = "Acme is a small, independent company. We build tools that help creative teams plan, make and ship their work, without the noise.",
  media,
  mediaAlt = "",
  stats = sampleStats,
  storyTitle = "Our story",
  story = sampleStory,
  quote = { text: "The best compliment we get is that people forget they are using it. They just notice the work got easier.", name: "Mara Ellison", role: "Co-founder" },
  valuesTitle = "What we believe",
  values = sampleValues,
  milestonesTitle = "How we got here",
  milestones = sampleMilestones,
  cta = { title: "Come and make good things with us", description: "We are a team of twenty-three, and we are hiring slowly and carefully.", primary: { label: "See open roles", href: "#" }, secondary: { label: "Get in touch", href: "#" } },
  locale = "en-US",
  className,
  ...props
}: About1Props) {
  const id = React.useId()
  const [first, second] = Array.isArray(headline) ? headline : [headline, undefined]

  const action = (a: About1Action, variant: "default" | "outline") => {
    const cls = buttonVariants({ variant, size: "lg" })
    return a.href ? (
      <a href={a.href} onClick={a.onClick} className={cls}>
        {a.label}
        {variant === "default" ? <ArrowRight aria-hidden="true" className="rtl:rotate-180" /> : null}
      </a>
    ) : (
      <button type="button" onClick={a.onClick} className={cls}>
        {a.label}
        {variant === "default" ? <ArrowRight aria-hidden="true" className="rtl:rotate-180" /> : null}
      </button>
    )
  }

  return (
    <section data-slot="about-1" aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-24", className)} {...props}>
      <BlurFade direction="up" offset={14} duration={0.6}>
        <header className="max-w-4xl">
          <p className="text-muted-foreground mb-5 font-mono text-xs tracking-widest uppercase">{eyebrow}</p>
          <h1 id={`${id}-title`} className="text-5xl font-semibold tracking-[-0.045em] text-balance sm:text-6xl lg:text-7xl">
            {first}
            {second ? <span className="text-muted-foreground block">{second}</span> : null}
          </h1>
          <p className="text-muted-foreground mt-6 max-w-2xl text-lg leading-relaxed text-pretty">{intro}</p>
        </header>
      </BlurFade>

      <BlurFade direction="up" offset={18} duration={0.7} delay={0.1}>
        <div className="bg-muted relative mt-14 h-64 overflow-hidden rounded-3xl border sm:h-80 lg:h-[26rem]">
          <Media media={media} alt={mediaAlt} fill priority className="absolute inset-0" fallback={<CoverArt seed={first} variant="mesh" grid className="absolute inset-0" />} />
        </div>
      </BlurFade>

      {stats.length ? (
        <dl className="divide-border mt-12 grid grid-cols-2 gap-y-8 divide-x sm:grid-cols-4 [&>div:nth-child(odd)]:max-sm:ps-0 [&>div]:ps-6 [&>div:first-child]:ps-0">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col-reverse gap-1.5">
              <dt className="text-muted-foreground text-sm">{s.label}</dt>
              <dd className="text-4xl font-semibold tracking-[-0.03em] tabular-nums sm:text-5xl">
                {s.plain ? s.value : <NumberTicker value={s.value} locale={locale} />}
                {s.suffix ?? ""}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      <div className="mt-28 grid gap-10 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-16">
        <h2 className="text-muted-foreground font-mono text-xs tracking-widest uppercase lg:sticky lg:top-8 lg:self-start">{storyTitle}</h2>
        <div className="grid max-w-3xl gap-6">
          {story.map((p, i) => (
            <BlurFade key={i} direction="up" offset={12} delay={0.04 * i}>
              <p className={cn("text-pretty", i === 0 ? "text-2xl leading-snug font-medium tracking-tight sm:text-3xl" : "text-muted-foreground text-lg leading-relaxed")}>{p}</p>
            </BlurFade>
          ))}
          {quote ? (
            <BlurFade direction="up" offset={12}>
              <figure className="bg-card relative mt-4 overflow-hidden rounded-3xl border p-8 sm:p-10">
                <span aria-hidden="true" className="text-chart-1/25 absolute -top-4 start-6 font-serif text-[9rem] leading-none select-none">
                  “
                </span>
                <blockquote className="relative text-xl leading-snug font-medium tracking-tight text-balance sm:text-2xl">{quote.text}</blockquote>
                <figcaption className="relative mt-6 flex items-center gap-3">
                  <CoverArt seed={quote.name} variant="mesh" className="size-10 shrink-0 rounded-full border" />
                  <span className="text-sm">
                    <span className="block font-medium">{quote.name}</span>
                    {quote.role ? <span className="text-muted-foreground block">{quote.role}</span> : null}
                  </span>
                </figcaption>
              </figure>
            </BlurFade>
          ) : null}
        </div>
      </div>

      {values.length ? (
        <div className="mt-28">
          <h2 className="mb-8 max-w-xl text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl">{valuesTitle}</h2>
          <BlurFadeGroup stagger={0.07} className="grid gap-4 sm:grid-cols-2 [&>*]:h-full [&>*>*]:h-full" item={{ direction: "up", offset: 14, blur: 6 }}>
            {values.map((v, i) => (
              <SpotlightCard key={v.title} size={340} className="flex flex-col gap-5 rounded-3xl p-7 transition-shadow duration-200 hover:shadow-md sm:p-8">
                <div className="flex items-center justify-between">
                  <span aria-hidden="true" className={cn("flex size-11 items-center justify-center rounded-xl border [&_svg]:size-5", ["bg-chart-1/20", "bg-chart-2/20", "bg-chart-3/25", "bg-chart-4/20"][i % 4])}>
                    {v.icon ?? <Feather />}
                  </span>
                  <span aria-hidden="true" className="text-muted-foreground font-mono text-sm tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">{v.title}</h3>
                  <p className="text-muted-foreground mt-2 text-[15px] leading-relaxed text-pretty">{v.description}</p>
                </div>
              </SpotlightCard>
            ))}
          </BlurFadeGroup>
        </div>
      ) : null}

      {milestones.length ? (
        <div className="mt-28">
          <h2 className="mb-10 max-w-xl text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl">{milestonesTitle}</h2>
          <ol className="relative grid gap-0">
            {milestones.map((m, i) => (
              <BlurFade key={m.year} as="li" direction="up" offset={12} className="group/step relative grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-6 pb-10 last:pb-0 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-x-10">
                <span className="text-muted-foreground group-hover/step:text-foreground pt-0.5 text-2xl font-semibold tracking-[-0.03em] tabular-nums transition-colors duration-200 sm:text-4xl">{m.year}</span>
                <div className="border-border relative border-s ps-6 sm:ps-10">
                  <span aria-hidden="true" className={cn("bg-background absolute top-2 -start-[7px] size-3.5 rounded-full border-2 transition-colors duration-200", i === milestones.length - 1 ? "border-chart-1 bg-chart-1" : "border-foreground/40 group-hover/step:border-foreground")} />
                  <h3 className="text-lg font-semibold tracking-tight sm:text-xl">{m.title}</h3>
                  <p className="text-muted-foreground mt-1.5 max-w-xl text-[15px] leading-relaxed text-pretty">{m.description}</p>
                </div>
              </BlurFade>
            ))}
          </ol>
        </div>
      ) : null}

      {cta ? (
        <BlurFade direction="up" offset={16}>
          <div className="bg-card relative isolate mt-28 overflow-hidden rounded-3xl border px-6 py-14 text-center sm:px-12 sm:py-20">
            <CoverArt seed={cta.title} variant="mesh" className="absolute inset-0 -z-10 opacity-70" />
            <div aria-hidden="true" className="from-card/80 via-card/60 to-card/80 absolute inset-0 -z-10 bg-gradient-to-b" />
            <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">{cta.title}</h2>
            {cta.description ? <p className="text-muted-foreground mx-auto mt-4 max-w-lg text-base text-pretty">{cta.description}</p> : null}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {action(cta.primary, "default")}
              {cta.secondary ? action(cta.secondary, "outline") : null}
            </div>
          </div>
        </BlurFade>
      ) : null}
    </section>
  )
}

export { About1, type About1Props, type About1Stat, type About1Value, type About1Milestone, type About1Action }
