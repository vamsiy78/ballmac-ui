// Ballmac UI: Changelog 1. https://ui.ballmac.com/blocks/changelog-1
"use client"

import * as React from "react"
import { Bug, ChevronDown, Rss, Sparkles, Wand2 } from "lucide-react"

import { BlogCover } from "@/components/ballmac/blocks/blog-1/blog-1"
import { buttonVariants } from "@/components/ballmac/button"
import { cn } from "@/lib/utils"
import { useLocale } from "@/lib/ballmac/i18n"
import { Media, type MediaSource } from "@/components/ballmac/media"

type Changelog1Kind = "new" | "improved" | "fixed"

type Changelog1Change = {
  type: Changelog1Kind
  /** One line describing the change. */
  text: string
}

type Changelog1Release = {
  /** Version label, e.g. "2.4.0". */
  version: string
  /** Release date as an ISO string (YYYY-MM-DD), shown in UTC. */
  date: string
  /** Headline for the release. */
  title: string
  /** One or two sentences about the release. */
  summary?: string
  /** The individual changes. */
  changes: Changelog1Change[]
  /** Which generated banner to draw (0 to 4) for a headline release. Omit for a plain release. */
  cover?: number
  /** Your own banner for a headline release: an image URL (give it imageAlt), an object with alt text and a dark-mode file, or your own element. Wins over `cover`. */
  image?: MediaSource
  /** Describes `image` when it is a plain URL. */
  imageAlt?: string
}

type Changelog1Props = Omit<React.ComponentProps<"section">, "title"> & {
  /** Section heading. */
  title?: string
  /** One sentence under the heading. */
  description?: string
  /** Releases, newest first. */
  releases?: Changelog1Release[]
  /** Releases shown before the "Show older releases" button. */
  initialCount?: number
  /** Link to your feed. Pass null to hide the button. */
  feed?: { label: string; href: string } | null
  /** Locale for dates. Fixed by default so server and browser match. */
  locale?: string
}

const kinds: Record<Changelog1Kind, { label: string; icon: typeof Sparkles; chip: string }> = {
  new: { label: "New", icon: Sparkles, chip: "bg-chart-2/15" },
  improved: { label: "Improved", icon: Wand2, chip: "bg-chart-1/15" },
  fixed: { label: "Fixed", icon: Bug, chip: "bg-chart-3/20" },
}

const defaults: Changelog1Release[] = [
  {
    version: "2.4.0", date: "2026-09-29", title: "Approvals, rebuilt", cover: 0,
    summary: "Approvals now happen where the work is: in the invoice, in Slack and from your phone. Reviewers see a short daily queue instead of a monthly pile.",
    changes: [
      { type: "new", text: "Approve or reject from Slack with one tap" },
      { type: "new", text: "Daily approval digest with the three items that need you most" },
      { type: "improved", text: "Invoice pages load about twice as fast on large accounts" },
      { type: "fixed", text: "Approvers added mid-flow now receive the pending request" },
    ],
  },
  {
    version: "2.3.2", date: "2026-09-18", title: "Small fixes",
    changes: [
      { type: "fixed", text: "CSV exports no longer drop the last row when it has no trailing newline" },
      { type: "fixed", text: "Dark mode: chart tooltips were unreadable on some displays" },
      { type: "improved", text: "Clearer error when a bank connection needs to be refreshed" },
    ],
  },
  {
    version: "2.3.0", date: "2026-09-04", title: "SAML SSO and SCIM", cover: 3,
    summary: "Sign in with Okta, Entra ID or Google Workspace, and keep your directory in sync automatically.",
    changes: [
      { type: "new", text: "SAML single sign-on for Pro and Scale" },
      { type: "new", text: "SCIM user provisioning and deprovisioning" },
      { type: "improved", text: "Audit log now records the identity provider used to sign in" },
    ],
  },
  {
    version: "2.2.1", date: "2026-08-21", title: "Reliability",
    changes: [
      { type: "fixed", text: "Webhook retries could fire twice after a deploy" },
      { type: "improved", text: "Faster search across more than 100,000 transactions" },
    ],
  },
  {
    version: "2.2.0", date: "2026-08-07", title: "Custom reports",
    summary: "Build the report you actually need, save it and schedule it by email.",
    changes: [
      { type: "new", text: "Drag-and-drop report builder with saved views" },
      { type: "new", text: "Schedule any report to arrive weekly or monthly" },
      { type: "improved", text: "Currency formatting follows each customer's locale" },
    ],
  },
]

function formatDate(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`))
}

function Changelog1({
  title = "What’s new",
  description = "Every improvement we ship, newest first.",
  releases = defaults,
  initialCount = 3,
  feed = { label: "Subscribe via RSS", href: "#" },
  locale,
  className,
  ...props
}: Changelog1Props) {
  const defaultLocale = useLocale()
  locale ??= defaultLocale
  const [filter, setFilter] = React.useState<"all" | Changelog1Kind>("all")
  const [expanded, setExpanded] = React.useState(false)
  const counts = { all: releases.reduce((n, r) => n + r.changes.length, 0), new: 0, improved: 0, fixed: 0 }
  for (const r of releases) for (const c of r.changes) counts[c.type]++

  const visible = releases
    .map((r) => ({ ...r, changes: r.changes.filter((c) => filter === "all" || c.type === filter) }))
    .filter((r) => r.changes.length > 0)
  const shown = expanded ? visible : visible.slice(0, initialCount)
  const hidden = visible.length - shown.length

  return (
    <section data-slot="changelog-1" className={cn("mx-auto max-w-5xl px-4 py-20 sm:px-6 md:py-28", className)} {...props}>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <h2 className="text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl lg:text-5xl">{title}</h2>
          <p className="text-muted-foreground mt-4 text-lg text-pretty">{description}</p>
        </div>
        {feed && (
          <a href={feed.href} className={buttonVariants({ variant: "outline", shape: "pill", className: "w-fit" })}>
            <Rss /> {feed.label}
          </a>
        )}
      </div>

      <div role="group" aria-label="Filter by type of change" className="mt-10 flex flex-wrap gap-1.5">
        {(["all", "new", "improved", "fixed"] as const).map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={filter === k}
            onClick={() => setFilter(k)}
            className={cn(
              "focus-visible:ring-ring/50 inline-flex h-9 items-center gap-2 rounded-full border px-4 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px]",
              filter === k ? "bg-foreground text-background border-transparent" : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            {k === "all" ? "All changes" : kinds[k].label}
            <span className={cn("text-xs tabular-nums", filter === k ? "text-background/70" : "text-muted-foreground")}>{counts[k]}</span>
          </button>
        ))}
      </div>

      <p role="status" className="sr-only">{visible.length} {visible.length === 1 ? "release" : "releases"} shown.</p>

      <ol className="relative mt-12 space-y-14">
        {shown.map((r, i) => (
          <li key={r.version} className="grid gap-4 md:grid-cols-[9rem_1fr] md:gap-10">
            <div className="md:sticky md:top-24 md:self-start">
              <p className="font-mono text-2xl font-semibold tracking-tight tabular-nums">{r.version}</p>
              <p className="text-muted-foreground mt-1 text-sm"><time dateTime={r.date}>{formatDate(r.date, locale)}</time></p>
              {i === 0 && filter === "all" && !expanded && <span className="bg-foreground text-background mt-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium">Latest</span>}
            </div>
            <article className="bg-card overflow-hidden rounded-3xl border">
              {r.image ? <Media media={r.image} alt={r.imageAlt} aspect="21/8" className="w-full" /> : r.cover !== undefined && <BlogCover variant={r.cover} className="aspect-[21/8] w-full" />}
              <div className="p-6 sm:p-8">
                <h3 className="text-xl font-semibold tracking-[-0.02em] text-balance sm:text-2xl">{r.title}</h3>
                {r.summary && <p className="text-muted-foreground mt-2 max-w-2xl text-pretty">{r.summary}</p>}
                <ul className="mt-6 space-y-3">
                  {r.changes.map((c) => {
                    const k = kinds[c.type]
                    return (
                      <li key={c.text} className="flex items-start gap-3 text-[15px] leading-6">
                        <span className={cn("mt-0.5 inline-flex h-6 w-[5.5rem] shrink-0 items-center gap-1.5 rounded-full px-2 text-xs font-medium", k.chip)}>
                          <k.icon className="size-3.5" aria-hidden="true" />
                          {k.label}
                        </span>
                        <span className="text-pretty">{c.text}</span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </article>
          </li>
        ))}
      </ol>

      {visible.length === 0 && <p className="text-muted-foreground mt-12 text-center">No changes of this type yet.</p>}

      {hidden > 0 && (
        <div className="mt-12 flex justify-center">
          <button type="button" onClick={() => setExpanded(true)} className={buttonVariants({ variant: "outline", shape: "pill" })}>
            Show {hidden} older {hidden === 1 ? "release" : "releases"} <ChevronDown />
          </button>
        </div>
      )}
    </section>
  )
}

export { Changelog1, type Changelog1Props, type Changelog1Release, type Changelog1Change, type Changelog1Kind }
