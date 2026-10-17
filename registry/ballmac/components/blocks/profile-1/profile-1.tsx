// Ballmac UI: Profile 1. https://ui.ballmac.com/blocks/profile-1
"use client"

import * as React from "react"
import { ArrowUpRight, BadgeCheck, CalendarDays, Check, FolderOpen, Link2, Mail, MapPin, Share2, Star, UserCheck, UserPlus } from "lucide-react"

import { AnimatedTabs, AnimatedTabsContent, AnimatedTabsList, AnimatedTabsTrigger } from "@/components/ballmac/animated-tabs"
import { Avatar, AvatarFallback, AvatarImage, type AvatarStatus } from "@/components/ballmac/avatar"
import { Badge } from "@/components/ballmac/badge"
import { BlurFade, BlurFadeGroup } from "@/components/ballmac/blur-fade"
import { Button } from "@/components/ballmac/button"
import { ContributionGraph, type ContributionDay } from "@/components/ballmac/contribution-graph"
import { CoverArt } from "@/components/ballmac/cover-art"
import { Media, type MediaSource } from "@/components/ballmac/media"
import { NumberTicker } from "@/components/ballmac/number-ticker"
import { Skeleton } from "@/components/ballmac/skeleton"
import { SpotlightCard } from "@/components/ballmac/spotlight-card"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Profile1Person = {
  name: string
  /** The handle without the @, also the seed of the generated cover. */
  handle: string
  /** One line under the name. */
  headline?: string
  bio?: string
  location?: string
  /** Already written for people ("March 2021"). */
  joined?: string
  verified?: boolean
  /** A picture of the person, or leave out for initials over generated art. */
  avatar?: string
  avatarAlt?: string
  /** A cover picture. Leave out for generated art. */
  cover?: MediaSource
  status?: AvatarStatus
  /** A line about availability, shown with a green dot ("Open to freelance work"). */
  availability?: string
  followers: number
  following: number
  /** Whether the person using the page already follows them. */
  isFollowing?: boolean
  skills?: string[]
  links?: { label: string; href: string; icon?: React.ReactNode }[]
}

type Profile1Project = {
  id: string
  title: string
  description: string
  tags?: string[]
  stars?: number
  /** Already written for people ("Updated 3 days ago"). */
  updated?: string
  href?: string
  cover?: MediaSource
}

type Profile1Event = { id: string; text: string; time: string }

type Profile1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    person?: Profile1Person
    projects?: Profile1Project[]
    /** One value per day, in calendar order, for the Activity tab. */
    activity?: ContributionDay[]
    /** Recent activity, newest first. */
    recent?: Profile1Event[]
    /** Called when Follow or Following is pressed with the new state. Throw to undo it. */
    onFollow?: (following: boolean) => void | Promise<void>
    /** Called by Message. Without it the button is hidden. */
    onMessage?: () => void
    /** Called by Share. Defaults to copying the page address. */
    onShare?: () => void
    /** BCP 47 locale for numbers and dates. */
    locale?: string
    /** The tab shown first. */
    defaultTab?: "work" | "activity"
  }

/** A year of sample activity: arithmetic only, so every render and every browser draws the same days. */
function sampleActivity(): ContributionDay[] {
  const start = Date.UTC(2026, 1, 8)
  return Array.from({ length: 36 * 7 }, (_, i) => {
    const r = (Math.imul(i + 11, 2654435761) >>> 0) % 100
    const weekend = i % 7 === 0 || i % 7 === 6
    const count = weekend ? (r < 70 ? 0 : 1 + (r % 3)) : r < 22 ? 0 : r < 55 ? 1 + (r % 2) : r < 85 ? 3 + (r % 4) : 8 + (r % 6)
    return { date: new Date(start + i * 86400000).toISOString().slice(0, 10), count }
  })
}

const samplePerson: Profile1Person = {
  name: "Mara Ellison",
  handle: "mara",
  headline: "Product designer building calm tools for creative teams",
  bio: "I design interfaces that get out of the way. Ten years across design systems, editors and onboarding, now working on tools for people who make things for a living. I write about craft and ship small open-source projects on weekends.",
  location: "Lisbon, Portugal",
  joined: "March 2021",
  verified: true,
  availability: "Open to freelance work from November",
  status: "online",
  followers: 12840,
  following: 312,
  skills: ["Design systems", "Prototyping", "Interaction design", "Accessibility", "Figma", "React", "User research"],
  links: [
    { label: "maraellison.com", href: "#" },
    { label: "github.com/mara", href: "#" },
    { label: "Read the newsletter", href: "#" },
  ],
}

const sampleProjects: Profile1Project[] = [
  { id: "p1", title: "Quiet", description: "A distraction-free writing app with a command bar, versions and one-click publishing.", tags: ["Product", "React"], stars: 2480, updated: "Updated 3 days ago", href: "#" },
  { id: "p2", title: "Gridwork", description: "A layout system for Figma and code that keeps designs and components in sync.", tags: ["Design system"], stars: 1312, updated: "Updated last week", href: "#" },
  { id: "p3", title: "Field notes", description: "Interviews and findings from 60 conversations with independent designers.", tags: ["Research"], stars: 904, updated: "Updated 2 weeks ago", href: "#" },
  { id: "p4", title: "Tidy", description: "A tiny CLI that renames and sorts exported assets using your naming rules.", tags: ["Tooling", "Node"], stars: 640, updated: "Updated last month", href: "#" },
  { id: "p5", title: "Soft focus", description: "A color palette generator that checks contrast as you pick.", tags: ["Color", "Accessibility"], stars: 517, updated: "Updated 2 months ago", href: "#" },
  { id: "p6", title: "Onboarding teardown", description: "Forty onboarding flows, annotated and compared on one page.", tags: ["Writing"], stars: 388, updated: "Updated 3 months ago", href: "#" },
]

const sampleRecent: Profile1Event[] = [
  { id: "e1", text: "Published Quiet 2.0 with versions and a faster editor", time: "3 days ago" },
  { id: "e2", text: "Opened a pull request on Gridwork: mirror layouts for Arabic and Hebrew", time: "5 days ago" },
  { id: "e3", text: "Posted “Why empty states deserve a designer” to the newsletter", time: "9 days ago" },
  { id: "e4", text: "Starred Tidy and 3 other repositories", time: "2 weeks ago" },
]

const initials = (name: string) => name.split(" ").map((w) => w[0]).join("").slice(0, 2)

function ProfileSkeleton() {
  return (
    <div className="grid gap-8" aria-hidden="true">
      <div className="bg-card overflow-hidden rounded-3xl border">
        <Skeleton className="h-40 rounded-none sm:h-52" />
        <div className="px-5 pb-6 sm:px-8">
          <Skeleton className="-mt-14 size-28 rounded-full ring-4 ring-card sm:-mt-16 sm:size-32" />
          <Skeleton className="mt-4 h-8 w-56" />
          <Skeleton className="mt-2 h-4 w-72 max-w-full" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-64 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}

/**
 * A public profile page: a cover and avatar with art drawn from the handle when there are no pictures, the name with its verified
 * badge, a Follow button that updates the follower count straight away and undoes itself if it fails, stats that count up, an
 * About card, project cards that light up under the pointer, and an Activity tab with a contribution graph.
 */
function Profile1({
  person = samplePerson,
  projects = sampleProjects,
  activity,
  recent = sampleRecent,
  onFollow,
  onMessage,
  onShare,
  locale = "en-US",
  defaultTab = "work",
  state = "ready",
  onRetry,
  emptyState,
  errorState,
  className,
  ...props
}: Profile1Props) {
  const id = React.useId()
  const days = React.useMemo(() => activity ?? sampleActivity(), [activity])
  const baseFollowing = person.isFollowing ?? false
  const [following, setFollowing] = React.useState(baseFollowing)
  const [copied, setCopied] = React.useState(false)
  const [announce, setAnnounce] = React.useState("")
  const followers = person.followers + (following === baseFollowing ? 0 : following ? 1 : -1)
  const contributions = days.reduce((sum, d) => sum + Math.max(0, d.count), 0)

  React.useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 1800)
    return () => clearTimeout(t)
  }, [copied])

  async function toggleFollow() {
    const next = !following
    setFollowing(next)
    setAnnounce(next ? `You are following ${person.name}` : `You unfollowed ${person.name}`)
    try {
      await onFollow?.(next)
    } catch {
      setFollowing(!next)
      setAnnounce(`Could not update. You are ${!next ? "still following" : "not following"} ${person.name}`)
    }
  }

  async function share() {
    if (onShare) return onShare()
    try {
      await navigator.clipboard?.writeText(window.location.href)
      setCopied(true)
    } catch {}
  }

  const stats = [
    { id: "followers", label: "Followers", value: followers },
    { id: "following", label: "Following", value: person.following },
    { id: "projects", label: "Projects", value: projects.length },
    { id: "contributions", label: "Contributions", value: contributions },
  ]

  const about = (
    <aside aria-labelledby={`${id}-about`} className="bg-card rounded-2xl border p-5">
      <h2 id={`${id}-about`} className="text-sm font-semibold">
        About
      </h2>
      {person.bio ? <p className="text-muted-foreground mt-2 text-sm leading-relaxed text-pretty">{person.bio}</p> : null}
      {person.skills?.length ? (
        <>
          <h3 className="mt-5 text-xs font-medium">Skills</h3>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {person.skills.map((s) => (
              <li key={s}>
                <Badge variant="secondary" className="font-normal">
                  {s}
                </Badge>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      {person.links?.length ? (
        <>
          <h3 className="mt-5 text-xs font-medium">Links</h3>
          <ul className="mt-2 grid gap-0.5">
            {person.links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  className="text-foreground hover:bg-accent focus-visible:ring-ring/50 group/link -mx-2 flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm outline-none focus-visible:ring-[3px] [&_svg]:size-4"
                >
                  <span aria-hidden="true" className="text-muted-foreground group-hover/link:text-foreground">
                    {l.icon ?? <Link2 />}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{l.label}</span>
                  <ArrowUpRight aria-hidden="true" className="text-muted-foreground size-3.5 opacity-0 transition-opacity group-hover/link:opacity-100 group-focus-visible/link:opacity-100 rtl:-scale-x-100" />
                </a>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </aside>
  )

  const content = (
    <div className="grid gap-8">
      <BlurFade direction="up" offset={10} duration={0.5}>
        <header className="bg-card overflow-hidden rounded-3xl border shadow-xs">
          <div className="relative h-40 sm:h-52">
            <Media media={person.cover} alt="" fill priority className="absolute inset-0" fallback={<CoverArt seed={person.handle} variant="mesh" grid className="absolute inset-0" />} />
            <div aria-hidden="true" className="to-card/40 absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent" />
          </div>
          <div className="px-5 pb-6 sm:px-8">
            <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
              <Avatar className="ring-card -mt-14 size-28 shrink-0 text-3xl shadow-lg ring-4 sm:-mt-16 sm:size-32 sm:text-4xl" status={person.status}>
                {person.avatar ? <AvatarImage src={person.avatar} alt="" /> : null}
                <AvatarFallback className="relative overflow-hidden bg-transparent">
                  <CoverArt seed={person.handle} variant="mesh" className="absolute inset-0" />
                  <span className="text-foreground relative font-semibold tracking-tight">{initials(person.name)}</span>
                </AvatarFallback>
              </Avatar>
              <div className="ms-auto flex flex-wrap items-center gap-2 pb-1">
                <Button variant="outline" size="icon" aria-label={copied ? "Link copied" : `Share ${person.name}’s profile`} onClick={share}>
                  {copied ? <Check aria-hidden="true" /> : <Share2 aria-hidden="true" />}
                </Button>
                {onMessage ? (
                  <Button variant="outline" onClick={onMessage}>
                    <Mail aria-hidden="true" />
                    Message
                  </Button>
                ) : null}
                <Button variant={following ? "outline" : "default"} aria-pressed={following} onClick={toggleFollow} className="min-w-28">
                  {following ? <UserCheck aria-hidden="true" /> : <UserPlus aria-hidden="true" />}
                  {following ? "Following" : "Follow"}
                </Button>
              </div>
            </div>

            <div className="mt-4">
              <h1 className="flex flex-wrap items-center gap-x-2 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                {person.name}
                {person.verified ? (
                  <span className="inline-flex" role="img" aria-label="Verified">
                    <BadgeCheck aria-hidden="true" className="fill-primary text-primary-foreground size-6 sm:size-7" />
                  </span>
                ) : null}
              </h1>
              <p className="text-muted-foreground mt-0.5 text-sm">@{person.handle}</p>
              {person.headline ? <p className="mt-3 max-w-2xl text-base text-pretty">{person.headline}</p> : null}
              <ul className="text-muted-foreground mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm [&_svg]:size-4">
                {person.location ? (
                  <li className="flex items-center gap-1.5">
                    <MapPin aria-hidden="true" />
                    {person.location}
                  </li>
                ) : null}
                {person.joined ? (
                  <li className="flex items-center gap-1.5">
                    <CalendarDays aria-hidden="true" />
                    Joined {person.joined}
                  </li>
                ) : null}
                {person.availability ? (
                  <li className="text-foreground flex items-center gap-2">
                    <span aria-hidden="true" className="bg-chart-2 size-2 rounded-full" />
                    {person.availability}
                  </li>
                ) : null}
              </ul>
            </div>
          </div>

          <dl className="divide-border grid grid-cols-2 divide-x border-t sm:grid-cols-4 [&>div:nth-child(n+3)]:max-sm:border-t">
            {stats.map((s) => (
              <div key={s.id} className="flex flex-col-reverse gap-0.5 px-5 py-4 sm:px-8 sm:py-5">
                <dt className="text-muted-foreground text-xs">{s.label}</dt>
                <dd className="text-2xl font-semibold tracking-tight tabular-nums">
                  <NumberTicker value={s.value} locale={locale} format={s.value >= 100000 ? { notation: "compact" } : undefined} />
                </dd>
              </div>
            ))}
          </dl>
        </header>
      </BlurFade>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <BlurFade direction="up" offset={10} duration={0.5} delay={0.08} className="min-w-0">
          <AnimatedTabs defaultValue={defaultTab} variant="underline">
            <AnimatedTabsList aria-label={`${person.name}’s profile`}>
              <AnimatedTabsTrigger value="work">
                Work
                <span className="bg-muted text-muted-foreground ms-1.5 rounded-full px-1.5 text-[11px] leading-5 tabular-nums">{projects.length}</span>
              </AnimatedTabsTrigger>
              <AnimatedTabsTrigger value="activity">Activity</AnimatedTabsTrigger>
            </AnimatedTabsList>

            <AnimatedTabsContent value="work" className="mt-6">
              <StateView
                state={state === "empty" || !projects.length ? "empty" : "ready"}
                bare
                empty={{
                  title: emptyState?.title ?? "No projects yet",
                  description: emptyState?.description ?? `${person.name} has not shared any work yet.`,
                  icon: emptyState?.icon ?? <FolderOpen />,
                  action: emptyState?.action,
                }}
              >
                <BlurFadeGroup stagger={0.07} delay={0.1} className="grid gap-4 sm:grid-cols-2 [&>*]:h-full [&>*>*]:h-full" item={{ direction: "up", offset: 12, blur: 6 }}>
                  {projects.map((p, i) => (
                    <SpotlightCard
                      key={p.id}
                      size={360}
                      className="focus-within:ring-ring/50 group/card flex flex-col overflow-hidden rounded-2xl p-0 transition-shadow duration-200 focus-within:ring-[3px] hover:shadow-md"
                    >
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <Media media={p.cover} alt="" fill className="absolute inset-0 transition-transform duration-500 ease-out group-hover/card:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover/card:scale-100" fallback={<CoverArt seed={p.id} variant={(["rings", "bars", "dots", "waves", "mesh"] as const)[i % 5]} grid className="absolute inset-0" />} />
                      </div>
                      <div className="flex flex-1 flex-col gap-3 p-5">
                        <div className="flex items-start gap-2">
                          <h3 className="flex-1 text-base font-semibold tracking-tight">
                            {p.href ? (
                              <a href={p.href} className="outline-none after:absolute after:inset-0 after:content-['']">
                                {p.title}
                              </a>
                            ) : (
                              p.title
                            )}
                          </h3>
                          {p.href ? (
                            <ArrowUpRight aria-hidden="true" className="text-muted-foreground group-hover/card:text-foreground mt-0.5 size-4 shrink-0 transition-transform duration-200 group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover/card:translate-x-0 motion-reduce:group-hover/card:translate-y-0 rtl:-scale-x-100 rtl:group-hover/card:-translate-x-0.5" />
                          ) : null}
                        </div>
                        <p className="text-muted-foreground line-clamp-2 text-sm text-pretty">{p.description}</p>
                        <div className="mt-auto grid gap-3 pt-1">
                          {p.tags?.length ? (
                            <ul className="flex flex-wrap gap-1.5">
                              {p.tags.map((t) => (
                                <li key={t}>
                                  <Badge variant="outline" className="font-normal">
                                    {t}
                                  </Badge>
                                </li>
                              ))}
                            </ul>
                          ) : null}
                          <div className="text-muted-foreground flex items-center justify-between gap-3 border-t pt-3 text-xs tabular-nums">
                            {p.stars !== undefined ? (
                              <span className="flex items-center gap-1.5">
                                <Star aria-hidden="true" className="size-3.5" />
                                <span className="sr-only">Stars: </span>
                                {new Intl.NumberFormat(locale).format(p.stars)}
                              </span>
                            ) : (
                              <span />
                            )}
                            {p.updated ? <span>{p.updated}</span> : null}
                          </div>
                        </div>
                      </div>
                    </SpotlightCard>
                  ))}
                </BlurFadeGroup>
              </StateView>
            </AnimatedTabsContent>

            <AnimatedTabsContent value="activity" className="mt-6">
              <div className="grid gap-8">
                <ContributionGraph data={days} label="Contributions" />
                {recent.length ? (
                  <section aria-labelledby={`${id}-recent`}>
                    <h2 id={`${id}-recent`} className="text-sm font-semibold">
                      Recent
                    </h2>
                    <ol className="border-border mt-4 ms-1.5 grid gap-5 border-s ps-6">
                      {recent.map((e) => (
                        <li key={e.id} className="relative">
                          <span aria-hidden="true" className="bg-card border-foreground/40 absolute top-1.5 -start-[1.9rem] size-2.5 rounded-full border-2" />
                          <p className="text-sm text-pretty">{e.text}</p>
                          <p className="text-muted-foreground mt-0.5 text-xs">{e.time}</p>
                        </li>
                      ))}
                    </ol>
                  </section>
                ) : null}
              </div>
            </AnimatedTabsContent>
          </AnimatedTabs>
        </BlurFade>
        <BlurFade direction="up" offset={10} duration={0.5} delay={0.16} className="order-first h-fit lg:sticky lg:top-6 lg:order-none">
          {about}
        </BlurFade>
      </div>
    </div>
  )

  return (
    <section data-slot="profile-1" data-state={state} aria-label={`${person.name}’s profile`} className={cn("mx-auto w-full max-w-5xl px-4 py-8 sm:px-6", className)} {...frameProps(props)}>
      <StateView
        state={state === "loading" || state === "error" ? state : "ready"}
        onRetry={onRetry}
        label="Loading the profile"
        loading={<ProfileSkeleton />}
        error={{ title: errorState?.title ?? "This profile could not be loaded", description: errorState?.description ?? "Check your connection and try again.", ...errorState }}
      >
        {content}
      </StateView>
      <p aria-live="polite" className="sr-only">
        {announce || (copied ? "Link copied" : "")}
      </p>
    </section>
  )
}

export { Profile1, type Profile1Props, type Profile1Person, type Profile1Project, type Profile1Event }
