// Ballmac UI: Blog Post 1. https://ui.ballmac.com/blocks/blog-post-1
"use client"

import * as React from "react"
import { Clock } from "lucide-react"

import { BlogCover } from "@/components/ballmac/blocks/blog-1/blog-1"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ballmac/breadcrumb"
import { CopyButton } from "@/components/ballmac/copy-button"
import { ScrollProgress } from "@/components/ballmac/scroll-progress"
import { TableOfContents, type TocItem } from "@/components/ballmac/table-of-contents"
import { cn } from "@/lib/utils"
import { useLocale } from "@/lib/ballmac/i18n"

type BlogPostRelated = { title: string; category: string; href: string; readMinutes: number }

type BlogPost1Props = Omit<React.ComponentProps<"article">, "title"> & {
  /** Topic shown in the breadcrumb and above the title. */
  category?: string
  /** The article title. */
  title?: string
  /** One or two sentences under the title. */
  subtitle?: string
  /** Publication date as an ISO string (YYYY-MM-DD), shown in UTC. */
  date?: string
  /** Estimated minutes to read. */
  readMinutes?: number
  /** Author's name. */
  author?: string
  /** Author's role. */
  role?: string
  /** One sentence about the author, shown in the card after the article. */
  authorBio?: string
  /** Absolute link copied by the share button. */
  url?: string
  /** Cover photo. A generated cover is drawn when omitted. */
  image?: string
  /** Which generated cover to draw (0 to 4). */
  cover?: number
  /** Links for "On this page". The ids must match headings in `children`. */
  toc?: TocItem[]
  /** Pixels reserved for a sticky site header, for the contents list and anchor scrolling. */
  stickyOffset?: number
  /** More posts to read. Pass an empty array to hide the section. */
  related?: BlogPostRelated[]
  /** Link back to the blog index. */
  blogHref?: string
  /** Locale for the date. Fixed by default so server and browser match. */
  locale?: string
  /** The article body. Plain h2, h3, p, ul, ol, blockquote, pre and a elements are styled for you. */
  children?: React.ReactNode
}

const proseClass = cn(
  "text-foreground",
  "[&_h2]:mt-14 [&_h2]:scroll-mt-28 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-[-0.025em] [&_h2]:text-balance sm:[&_h2]:text-[1.7rem]",
  "[&_h3]:mt-10 [&_h3]:scroll-mt-28 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:tracking-[-0.02em]",
  "[&_p]:mt-5 [&_p]:text-[1.0625rem] [&_p]:leading-8 [&_p]:text-pretty",
  "[&_ul]:mt-5 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:ps-6 [&_ul]:text-[1.0625rem] [&_ul]:leading-8 [&_ul]:marker:text-muted-foreground",
  "[&_ol]:mt-5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:ps-6 [&_ol]:text-[1.0625rem] [&_ol]:leading-8 [&_ol]:marker:text-muted-foreground",
  "[&_a]:font-medium [&_a]:underline [&_a]:decoration-border [&_a]:underline-offset-4 hover:[&_a]:decoration-foreground",
  "[&_blockquote]:my-10 [&_blockquote]:border-s-2 [&_blockquote]:border-foreground [&_blockquote]:ps-6 [&_blockquote]:text-2xl [&_blockquote]:leading-snug [&_blockquote]:font-medium [&_blockquote]:tracking-[-0.02em] [&_blockquote]:text-balance",
  "[&_pre]:mt-6 [&_pre]:overflow-x-auto [&_pre]:rounded-2xl [&_pre]:border [&_pre]:bg-muted/50 [&_pre]:p-5 [&_pre]:font-mono [&_pre]:text-[13px] [&_pre]:leading-6",
  "[&_code:not(pre_code)]:rounded-md [&_code:not(pre_code)]:bg-muted [&_code:not(pre_code)]:px-1.5 [&_code:not(pre_code)]:py-0.5 [&_code:not(pre_code)]:font-mono [&_code:not(pre_code)]:text-[0.9em]",
  "[&_hr]:my-12"
)

const defaultToc: TocItem[] = [
  { id: "the-problem", title: "The problem with five days", level: 2 },
  { id: "three-changes", title: "Three changes that mattered", level: 2 },
  { id: "approvals-in-flight", title: "Approvals in flight", level: 3 },
  { id: "one-source-of-truth", title: "One source of truth", level: 3 },
  { id: "what-we-measured", title: "What we measured", level: 2 },
  { id: "what-is-next", title: "What is next", level: 2 },
]

function DefaultBody() {
  return (
    <>
      <p>
        For years our own books took five working days to close. Nobody was slow; the work was scattered across inboxes, spreadsheets and a shared drive with
        a folder structure only two people understood. This is the story of how we got it to one day, and what we changed in the product along the way.
      </p>
      <h2 id="the-problem">The problem with five days</h2>
      <p>
        When we mapped the close, only about a fifth of the elapsed time was actual work. The rest was waiting: for a receipt, for an approval, for someone
        to notice that a number looked off. Every wait was small, and together they were the whole week.
      </p>
      <blockquote>Most of a close is waiting. The fastest teams are not working harder, they are waiting less.</blockquote>
      <h2 id="three-changes">Three changes that mattered</h2>
      <p>We resisted the urge to automate everything. Three changes did almost all of the work.</p>
      <h3 id="approvals-in-flight">Approvals in flight</h3>
      <p>
        Instead of a monthly approval sweep, approvals happen the moment an invoice is coded. A reviewer sees a small queue each morning rather than a
        mountain on day three.
      </p>
      <h3 id="one-source-of-truth">One source of truth</h3>
      <p>
        We deleted the side spreadsheets. Every figure in the close now links back to the transaction that produced it, so questions are answered by
        clicking, not by emailing.
      </p>
      <pre>
        <code>{`close.status("2026-09")\n// → { days: 1, open: 0, flagged: 2 }`}</code>
      </pre>
      <h2 id="what-we-measured">What we measured</h2>
      <ul>
        <li>Median time to close fell from 5.1 days to 1.2 days over four months.</li>
        <li>Late adjustments dropped by about two thirds.</li>
        <li>The finance team reported spending most of their time on analysis rather than chasing.</li>
      </ul>
      <h2 id="what-is-next">What is next</h2>
      <p>
        We are turning the pieces that helped us most into defaults for everyone. If you want to try them early, <a href="#">join the beta</a> and tell us what
        your own close looks like.
      </p>
    </>
  )
}

const defaultRelated: BlogPostRelated[] = [
  { title: "Designing calm software for busy teams", category: "Design", href: "#", readMinutes: 6 },
  { title: "What 2,000 invoices taught us about getting paid", category: "Research", href: "#", readMinutes: 7 },
  { title: "Inside our new audit log", category: "Engineering", href: "#", readMinutes: 11 },
]

function BlogPost1({
  category = "Product",
  title = "How we cut month-end close from five days to one",
  subtitle = "Three workflow changes, one deleted spreadsheet and the dashboards that made them stick.",
  date = "2026-09-24",
  readMinutes = 8,
  author = "Priya Raman",
  role = "CEO",
  authorBio = "Priya leads Acme. Before that she ran finance operations at two growth-stage companies and has closed more books than she cares to count.",
  url = "https://acme.com/blog/month-end-close",
  image,
  cover = 0,
  toc = defaultToc,
  stickyOffset = 24,
  related = defaultRelated,
  blogHref = "#",
  locale,
  children,
  className,
  ...props
}: BlogPost1Props) {
  const defaultLocale = useLocale()
  locale ??= defaultLocale
  const formatted = new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`))
  const initials = author.split(" ").map((w) => w[0]).join("").slice(0, 2)
  return (
    <>
      <ScrollProgress />
      <article data-slot="blog-post-1" className={cn("mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-20", className)} {...props}>
        <header className="mx-auto max-w-3xl text-center">
          <Breadcrumb className="flex justify-center">
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink href={blogHref}>Blog</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>{category}</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="mt-6 text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl lg:text-6xl lg:leading-[1.05]">{title}</h1>
          <p className="text-muted-foreground mt-5 text-lg text-pretty sm:text-xl">{subtitle}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-3 text-sm">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="bg-chart-1/25 flex size-9 items-center justify-center rounded-full text-xs font-semibold">{initials}</span>
              <p className="text-start leading-tight">
                <span className="font-medium">{author}</span>
                <span className="text-muted-foreground block">{role}</span>
              </p>
            </div>
            <span aria-hidden="true" className="bg-border hidden h-6 w-px sm:block" />
            <p className="text-muted-foreground flex items-center gap-2">
              <time dateTime={date}>{formatted}</time>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1"><Clock className="size-3.5" aria-hidden="true" />{readMinutes} min read</span>
            </p>
            <CopyButton value={url} label="Copy link" copiedLabel="Link copied" variant="outline" size="sm" />
          </div>
        </header>

        <div className="mx-auto mt-12 max-w-5xl overflow-hidden rounded-3xl border">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" className="aspect-[21/9] w-full object-cover" />
          ) : (
            <BlogCover variant={cover} className="aspect-[16/9] w-full sm:aspect-[21/9]" />
          )}
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-12 lg:grid-cols-[minmax(0,42rem)_14rem] lg:justify-between">
          <div className="min-w-0">
            <div className={proseClass}>{children ?? <DefaultBody />}</div>

            <aside aria-label="About the author" className="bg-muted/40 mt-16 flex gap-4 rounded-3xl border p-6">
              <span aria-hidden="true" className="bg-chart-1/25 flex size-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold">{initials}</span>
              <div>
                <p className="font-semibold">Written by {author}</p>
                <p className="text-muted-foreground mt-1 text-sm leading-relaxed text-pretty">{authorBio}</p>
              </div>
            </aside>
          </div>
          {toc.length > 0 && (
            <div className="hidden lg:block">
              <div className="sticky" style={{ top: stickyOffset }}>
                <TableOfContents items={toc} offset={stickyOffset + 72} />
              </div>
            </div>
          )}
        </div>

        {related.length > 0 && (
          <section aria-labelledby="related-heading" className="mx-auto mt-20 max-w-5xl border-t pt-10">
            <h2 id="related-heading" className="text-lg font-semibold tracking-tight">Keep reading</h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-3">
              {related.map((r) => (
                <li key={r.title}>
                  <a href={r.href} className="group/related hover:bg-accent focus-visible:ring-ring/50 block h-full rounded-2xl border p-5 outline-none transition-colors focus-visible:ring-[3px]">
                    <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{r.category}</span>
                    <span className="mt-2 block leading-snug font-semibold text-balance">{r.title}</span>
                    <span className="text-muted-foreground mt-4 block text-sm">{r.readMinutes} min read</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </>
  )
}

export { BlogPost1, type BlogPost1Props, type BlogPostRelated }
