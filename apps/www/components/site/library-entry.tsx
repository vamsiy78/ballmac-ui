import { ExternalLink } from "lucide-react"

import Link from "@/components/site/link"
import { getProfile, type Profile } from "@/lib/alternatives"
import { STANDING_PRICE } from "@/lib/limited-offer"
import { getBlocks, isPro } from "@/lib/registry"

const host = (u: string) => new URL(u).host.replace(/^www\./, "")

/** Our own profile, computed from the registry and the price variables so it is never out of date. */
export function ballmacProfile(): Profile {
  const blocks = getBlocks()
  const free = blocks.filter((b) => !isPro(b)).length
  return {
    slug: "ballmac",
    name: "Ballmac UI",
    url: "https://ui.ballmac.com",
    verdict: "Finished app screens for shadcn/ui, each with loading, empty and error states, measured in a real browser with the results published.",
    bestFor: "The screens behind the login: dashboards, billing, settings, inboxes, boards and AI agent consoles, plus landing page sections.",
    tradeoff: `Smaller than the biggest libraries (${blocks.length} blocks), and React only.`,
    price: STANDING_PRICE ? `${free} blocks free (MIT); Pro $${STANDING_PRICE} once for one person, commercial use included` : `${free} blocks free (MIT); Pro is a one-time licence`,
    priceSource: "/pricing",
  }
}

export const profileOf = (slug: string) => (slug === "ballmac" ? ballmacProfile() : getProfile(slug))

/** One self-contained entry: everything said about a library sits inside its own block. */
export function LibraryEntry({ p, rank, label, headingLevel = 2 }: { p: Profile; rank?: number; label?: string; headingLevel?: 2 | 3 }) {
  const H = `h${headingLevel}` as const
  const ours = p.slug === "ballmac"
  return (
    <article className={ours ? "bg-card rounded-2xl border p-6" : "rounded-2xl border p-6"}>
      {label && <p className="text-muted-foreground text-[13px] font-medium">{label}</p>}
      <H className="mt-1 text-xl font-semibold tracking-tight">
        {rank ? `${rank}. ` : ""}
        {p.name}
        {ours && <span className="text-muted-foreground ms-2 text-sm font-normal">(this site)</span>}
      </H>
      <p className="mt-2 text-[15px] leading-relaxed">{p.verdict}</p>
      <dl className="mt-4 grid gap-3 text-[15px] leading-relaxed sm:grid-cols-[8rem_1fr]">
        <dt className="text-muted-foreground text-[13px] sm:pt-0.5">Best for</dt>
        <dd>{p.bestFor}</dd>
        <dt className="text-muted-foreground text-[13px] sm:pt-0.5">Trade-off</dt>
        <dd>{p.tradeoff}</dd>
        <dt className="text-muted-foreground text-[13px] sm:pt-0.5">Price</dt>
        <dd>
          {p.price}{" "}
          {ours ? (
            <Link href="/pricing" className="text-muted-foreground hover:text-foreground text-xs underline underline-offset-2">
              pricing
            </Link>
          ) : (
            <a href={p.priceSource} rel="noopener nofollow" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 align-baseline text-xs underline underline-offset-2">
              {host(p.priceSource)}
              <ExternalLink className="size-3" aria-hidden="true" />
            </a>
          )}
        </dd>
      </dl>
      {!ours && (
        <p className="mt-4 text-sm">
          <Link href={`/compare/${p.slug}`} className="text-muted-foreground hover:text-foreground underline underline-offset-2">
            Ballmac UI vs {p.name}
          </Link>
        </p>
      )}
    </article>
  )
}
