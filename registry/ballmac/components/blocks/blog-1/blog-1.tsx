// Ballmac UI: Blog 1. https://ui.ballmac.com/blocks/blog-1
"use client"

import * as React from "react"
import { ArrowUpRight, Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { useLocale } from "@/lib/ballmac/i18n"
import { Media, type MediaSource } from "@/components/ballmac/media"

type Blog1Post = {
  title: string
  /** One or two sentences under the title. */
  excerpt: string
  /** Topic, used for the filter chips. */
  category: string
  /** Publication date as an ISO string (YYYY-MM-DD). Shown in UTC so server and browser agree. */
  date: string
  /** Estimated minutes to read. */
  readMinutes: number
  /** Author's name. */
  author: string
  /** Author's role. */
  role?: string
  /** Where the post lives. */
  href: string
  /** Cover photo: an image URL, an object with alt text and a dark-mode file, or your own element. A generated cover is drawn when omitted. */
  image?: MediaSource
  /** Describes `image` when it is a plain URL. The title sits beside the cover, so the default is decorative (empty). */
  imageAlt?: string
  /** Which generated cover to draw (0 to 4). Defaults to the post's position. */
  cover?: number
}

type Blog1Props = Omit<React.ComponentProps<"section">, "title"> & {
  /** Label above the heading. */
  eyebrow?: string
  /** Section heading. */
  title?: string
  /** One sentence under the heading. */
  description?: string
  /** Posts, newest first. The first one is featured. */
  posts?: Blog1Post[]
  /** Show category filter chips. */
  filterable?: boolean
  /** Locale for dates. Fixed by default so server and browser match. */
  locale?: string
}

const tones = [
  { bg: "from-chart-1/30 to-chart-1/5", solid: "bg-chart-1", soft: "bg-chart-1/25", text: "text-chart-1", stroke: "stroke-chart-1" },
  { bg: "from-chart-3/30 to-chart-3/5", solid: "bg-chart-3", soft: "bg-chart-3/25", text: "text-chart-3", stroke: "stroke-chart-3" },
  { bg: "from-chart-5/30 to-chart-5/5", solid: "bg-chart-5", soft: "bg-chart-5/25", text: "text-chart-5", stroke: "stroke-chart-5" },
  { bg: "from-chart-2/30 to-chart-2/5", solid: "bg-chart-2", soft: "bg-chart-2/25", text: "text-chart-2", stroke: "stroke-chart-2" },
  { bg: "from-chart-4/30 to-chart-4/5", solid: "bg-chart-4", soft: "bg-chart-4/25", text: "text-chart-4", stroke: "stroke-chart-4" },
]

type BlogCoverProps = React.ComponentProps<"div"> & {
  /** Which generated cover to draw. Wraps after the fifth. */
  variant?: number
}

/** A decorative generated cover drawn from theme tokens: five compositions, each in a different chart colour. */
function BlogCover({ variant = 0, className, ...props }: BlogCoverProps) {
  const i = ((variant % 5) + 5) % 5
  const t = tones[i]
  return (
    <div
      aria-hidden="true"
      data-slot="blog-cover"
      className={cn("relative isolate overflow-hidden bg-gradient-to-br", t.bg, className)}
      {...props}
    >
      {i === 0 && (
        <>
          {[88, 64, 40, 18].map((s, k) => (
            <span key={s} className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border", t.soft, k === 3 && t.solid, "border-foreground/5")} style={{ width: `${s}%`, aspectRatio: "1" }} />
          ))}
        </>
      )}
      {i === 1 && (
        <div className="absolute inset-0 flex -skew-x-12 items-end justify-center gap-[4%] px-[12%]">
          {[44, 68, 54, 82, 62, 94].map((h, k) => (
            <span key={k} className={cn("w-[10%] rounded-t-xl", k % 2 ? t.solid : t.soft)} style={{ height: `${h}%` }} />
          ))}
        </div>
      )}
      {i === 2 && (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(color-mix(in_oklch,var(--foreground)_20%,transparent)_1px,transparent_1px)] [background-size:16px_16px]" />
          <span className={cn("absolute top-[18%] start-[16%] size-[46%] rotate-12 rounded-[22%]", t.solid)} />
          <span className={cn("absolute end-[14%] bottom-[16%] size-[34%] -rotate-6 rounded-[28%] border border-foreground/10", t.soft)} />
        </>
      )}
      {i === 3 && (
        <>
          <span className={cn("absolute -top-[20%] -start-[10%] size-[70%] rounded-full blur-2xl", t.soft)} />
          <span className={cn("absolute top-[22%] end-[8%] size-[56%] rounded-[45%_55%_60%_40%]", t.solid)} />
          <span className="bg-background/60 absolute bottom-[12%] start-[18%] h-[22%] w-[44%] rounded-full backdrop-blur-sm" />
        </>
      )}
      {i === 4 && (
        <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full">
          {[0, 1, 2, 3, 4, 5, 6].map((k) => (
            <path key={k} d={`M-20 ${60 + k * 22} C 80 ${10 + k * 24}, 140 ${150 + k * 12}, 230 ${90 + k * 18} S 360 ${30 + k * 20}, 430 ${100 + k * 16}`} fill="none" strokeWidth={k === 3 ? 3 : 1.5} className={cn(t.stroke, k === 3 ? "opacity-100" : "opacity-40")} />
          ))}
        </svg>
      )}
    </div>
  )
}

const defaults: Blog1Post[] = [
  { title: "How we cut month-end close from five days to one", excerpt: "A look at the three workflow changes behind our own fastest close yet, and the dashboards that made them stick.", category: "Product", date: "2026-09-24", readMinutes: 8, author: "Priya Raman", role: "CEO", href: "#" },
  { title: "Designing calm software for busy teams", excerpt: "Notes on restraint: fewer colours, quieter motion and why every empty state is a chance to help.", category: "Design", date: "2026-09-17", readMinutes: 6, author: "Elena Fischer", role: "Head of Design", href: "#" },
  { title: "Inside our new audit log", excerpt: "Append-only storage, signed exports and a query language your auditors can read.", category: "Engineering", date: "2026-09-09", readMinutes: 11, author: "Amara Singh", role: "Staff Engineer", href: "#" },
  { title: "What 2,000 invoices taught us about getting paid", excerpt: "The wording, timing and layout choices that move the median payout from 14 days to 5.", category: "Research", date: "2026-08-28", readMinutes: 7, author: "Jonas Ortiz", role: "Product Manager", href: "#" },
  { title: "Announcing SAML SSO and SCIM", excerpt: "Enterprise sign-in is here for Pro and Scale, with setup guides for Okta, Entra ID and Google.", category: "Product", date: "2026-08-19", readMinutes: 4, author: "Marcus Webb", role: "CTO", href: "#" },
  { title: "A field guide to resilient webhooks", excerpt: "Retries, idempotency keys and replay tools: the boring details that keep integrations alive.", category: "Engineering", date: "2026-08-05", readMinutes: 9, author: "Amara Singh", role: "Staff Engineer", href: "#" },
  { title: "Customer story: how Northwind went paperless", excerpt: "Forty suppliers, one inbox and no more lost PDFs. A conversation with their finance lead.", category: "Customers", date: "2026-07-30", readMinutes: 5, author: "Tomás Herrera", role: "Customer Success", href: "#" },
]

function formatDate(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`))
}

function Meta({ post, locale, className }: { post: Blog1Post; locale: string; className?: string }) {
  return (
    <p className={cn("text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-sm", className)}>
      <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
      <span aria-hidden="true">·</span>
      <span className="inline-flex items-center gap-1">
        <Clock className="size-3.5" aria-hidden="true" />
        {post.readMinutes} min read
      </span>
    </p>
  )
}

function Cover({ post, index, className }: { post: Blog1Post; index: number; className?: string }) {
  if (post.image) return <Media media={post.image} alt={post.imageAlt ?? ""} fill className={className} />
  return <BlogCover variant={post.cover ?? index} className={className} />
}

function Blog1({
  eyebrow = "The Acme blog",
  title = "Ideas, updates and field notes.",
  description = "What we are building, how we think about it and what we learn from the teams who use it.",
  posts = defaults,
  filterable = true,
  locale,
  className,
  ...props
}: Blog1Props) {
  const defaultLocale = useLocale()
  locale ??= defaultLocale
  const [category, setCategory] = React.useState("All")
  const categories = ["All", ...Array.from(new Set(posts.map((p) => p.category)))]
  const shown = posts.filter((p) => category === "All" || p.category === category)
  const [featured, ...rest] = shown

  return (
    <section data-slot="blog-1" className={cn("mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28", className)} {...props}>
      <div className="max-w-2xl">
        <p className="text-muted-foreground text-sm font-medium">{eyebrow}</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl lg:text-5xl">{title}</h2>
        <p className="text-muted-foreground mt-4 text-lg text-pretty">{description}</p>
      </div>

      {filterable && categories.length > 2 && (
        <div role="group" aria-label="Filter by topic" className="-mx-4 mt-8 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
              className={cn(
                "focus-visible:ring-ring/50 h-9 shrink-0 rounded-full border px-4 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px]",
                category === c ? "bg-foreground text-background border-transparent" : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <p role="status" className="sr-only">{shown.length} {shown.length === 1 ? "post" : "posts"} shown.</p>

      {featured && (
        <article className="group/post bg-card relative mt-10 grid overflow-hidden rounded-3xl border transition-shadow duration-300 hover:shadow-[0_30px_70px_-40px_rgb(0_0_0/0.45)] md:grid-cols-[1.15fr_1fr]">
          <Cover post={featured} index={posts.indexOf(featured)} className="aspect-[16/10] w-full transition-transform duration-700 ease-out group-hover/post:scale-[1.03] md:aspect-auto md:h-full motion-reduce:transition-none motion-reduce:group-hover/post:scale-100" />
          <div className="bg-card relative flex flex-col justify-center p-6 sm:p-10 lg:p-12">
            <span className="bg-secondary w-fit rounded-full px-2.5 py-1 text-xs font-medium">{featured.category}</span>
            <h3 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-balance sm:text-3xl">
              <a href={featured.href} className="focus-visible:ring-ring/50 rounded-sm outline-none after:absolute after:inset-0 focus-visible:ring-[3px]">{featured.title}</a>
            </h3>
            <p className="text-muted-foreground mt-3 text-pretty">{featured.excerpt}</p>
            <Meta post={featured} locale={locale} className="mt-6" />
            <p className="mt-4 text-sm">
              <span className="font-medium">{featured.author}</span>
              {featured.role && <span className="text-muted-foreground">, {featured.role}</span>}
            </p>
          </div>
        </article>
      )}

      {rest.length > 0 && (
        <ul className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((post) => (
            <li key={post.title}>
              <article className="group/post relative flex h-full flex-col">
                <div className="overflow-hidden rounded-2xl border">
                  <Cover post={post} index={posts.indexOf(post)} className="aspect-[16/10] w-full transition-transform duration-700 ease-out group-hover/post:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover/post:scale-100" />
                </div>
                <div className="mt-4 flex flex-1 flex-col">
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{post.category}</p>
                  <h3 className="mt-2 text-lg leading-snug font-semibold tracking-[-0.02em] text-balance">
                    <a href={post.href} className="focus-visible:ring-ring/50 rounded-sm outline-none after:absolute after:inset-0 focus-visible:ring-[3px]">
                      {post.title}
                      <ArrowUpRight className="ms-1 inline size-4 -translate-x-1 opacity-0 transition-all group-hover/post:translate-x-0 group-hover/post:opacity-100 motion-reduce:transition-none rtl:-scale-x-100" aria-hidden="true" />
                    </a>
                  </h3>
                  <p className="text-muted-foreground mt-2 line-clamp-2 text-sm text-pretty">{post.excerpt}</p>
                  <Meta post={post} locale={locale} className="mt-auto pt-4" />
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export { Blog1, BlogCover, type Blog1Props, type Blog1Post, type BlogCoverProps }
