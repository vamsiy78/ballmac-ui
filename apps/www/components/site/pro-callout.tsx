import { ArrowRight, Clock } from "lucide-react"

import { buttonVariants } from "@/components/ballmac/button"
import Link from "@/components/site/link"
import { Sampler } from "@/components/site/sampler"
import { nudgeText } from "@/lib/founding"
import { getOffer } from "@/lib/offer"
import { getBlocks, getItem, isPro } from "@/lib/registry"
import { SAMPLER_BLOCKS } from "@/lib/sampler"
import { cn } from "@/lib/utils"

/**
 * A quiet card for the free pages people read most (the component and block lists and their pages): what Pro adds, the founding price while it runs, and the
 * free sampler for anyone who is not ready. `where` says which page it sits on and is added to the pricing link as a campaign, so Analytics shows which pages send
 * people to Pricing. It renders on the server; pages that show it are rebuilt every few minutes (`revalidate`) so the countdown stays true.
 */
export async function ProCallout({ where, className }: { where: string; className?: string }) {
  const offer = (await getOffer()).founding
  const nudge = nudgeText(offer)
  const proBlocks = getBlocks().filter(isPro).length || 150
  // The sampler needs the Pro source, so it is left out of builds that do not have it (the public repository on its own).
  const sampler = SAMPLER_BLOCKS.some((n) => {
    const i = getItem(n)
    return Boolean(i && isPro(i))
  })
  const href = `/pricing?utm_source=ballmac-ui&utm_medium=pro-callout&utm_campaign=${encodeURIComponent(where)}#plans`
  const id = `pro-callout-${where}`
  return (
    <section aria-labelledby={`${id}-h`} className={cn("bg-card rounded-2xl border p-6 sm:p-8", className)}>
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">Ballmac UI Pro</p>
      <h2 id={`${id}-h`} className="mt-2 text-xl font-semibold tracking-tight text-balance sm:text-2xl">
        Need the whole screen, not one piece?
      </h2>
      <p className="text-muted-foreground mt-2 max-w-2xl text-[15px] leading-relaxed text-pretty">
        {proBlocks} premium blocks (dashboards, settings, calendars, mail, shops, onboarding) and three complete starter apps, including a desktop app that looks native on macOS and Windows. Every
        block handles loading, empty and error states.
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3">
        <Link href={href} className={buttonVariants({ shape: "pill" })}>
          See what Pro includes <ArrowRight aria-hidden="true" />
        </Link>
        {nudge && (
          <p className="text-muted-foreground inline-flex items-center gap-2 text-sm">
            <Clock className="size-3.5 shrink-0" aria-hidden="true" />
            {nudge}
          </p>
        )}
      </div>
      {sampler && (
        <div className="mt-7 border-t pt-6">
          <h3 className="text-sm font-semibold">Not ready? Try three Pro blocks free</h3>
          <p className="text-muted-foreground mt-1 mb-4 text-sm leading-relaxed">Leave your email and the blocks appear right here, ready to copy. Yours to use in any project.</p>
          <Sampler reminders={Boolean(offer?.endsAt)} />
        </div>
      )}
    </section>
  )
}
