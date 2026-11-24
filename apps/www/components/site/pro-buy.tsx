import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react"

import { buttonVariants } from "@/components/ballmac/button"
import { CheckoutLink } from "@/components/pro/checkout-link"
import { ProBadge } from "@/components/site/pro-notice"
import Link from "@/components/site/link"
import { STANDING_CHECKOUT, STANDING_PRICE, STANDING_REGULAR } from "@/lib/limited-offer"
import { REFUND_PATH } from "@/lib/pro-refund"
import { getBlocks, isPro, type SiteItem } from "@/lib/registry"
import { thumbFor } from "@/lib/thumbs"
import { cn } from "@/lib/utils"

const proBlockCount = () => getBlocks().filter(isPro).length

/** The price, the regular price struck through while an offer runs, and the buy button: straight to the checkout when there is a standing price, else to Pricing. */
function BuyButton({ where, size = "sm" }: { where: string; size?: "sm" | "default" }) {
  return STANDING_PRICE && STANDING_CHECKOUT ? (
    <CheckoutLink href={STANDING_CHECKOUT} plan="pro" className={buttonVariants({ size })}>
      Get Pro for ${STANDING_PRICE}
    </CheckoutLink>
  ) : (
    <Link href={`/pricing?utm_source=ballmac-ui&utm_medium=pro-buy&utm_campaign=${encodeURIComponent(where)}#plans`} className={buttonVariants({ size })}>
      Get Pro
    </Link>
  )
}

function Price() {
  if (!STANDING_PRICE) return null
  return (
    <span className="font-semibold">
      ${STANDING_PRICE} once
      {STANDING_REGULAR && (
        <>
          {" "}
          <s className="text-muted-foreground font-normal">
            <span className="sr-only">regular price </span>${STANDING_REGULAR}
          </s>
        </>
      )}
    </span>
  )
}

function RefundLine() {
  return (
    <Link href={REFUND_PATH} className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
      <ShieldCheck className="size-3.5 shrink-0" aria-hidden="true" />
      Works as described or your money back
    </Link>
  )
}

/**
 * Sits under the title of a Pro item, so the price and the way to buy are on the first screen (on phones too), and says up front that the install command
 * needs a licence key. `lead` replaces the first line, for pages that are not about one item.
 */
export function ProBuyBar({ where, lead, className }: { where: string; lead?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-muted/40 flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6", className)}>
      <div className="flex min-w-0 gap-3">
        <span className="bg-background hidden size-9 shrink-0 items-center justify-center rounded-lg border sm:flex" aria-hidden="true">
          <LockKeyhole className="size-4" />
        </span>
        <div className="min-w-0 space-y-1 text-sm">
          <p className="font-medium">{lead ?? "Part of Ballmac UI Pro. The install command needs your licence key."}</p>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Price />
            <span className="text-muted-foreground">{STANDING_PRICE ? "for" : "One payment for"} all {proBlockCount()} Pro blocks and every Pro template. Tax included.</span>
            <RefundLine />
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <BuyButton where={where} />
        <Link href="/pro/login" className={buttonVariants({ size: "sm", variant: "outline" })}>
          Log in
        </Link>
      </div>
    </div>
  )
}

/** Pro items to show beside a free one: the same kind of block first, then others, only ones with a captured thumbnail. */
export function proPicks(item: Pick<SiteItem, "name" | "blockCategory">, n = 3): SiteItem[] {
  const pro = getBlocks().filter((b) => isPro(b) && b.name !== item.name && thumbFor(b.name, b.tier))
  const same = pro.filter((b) => b.blockCategory === item.blockCategory)
  return [...same, ...pro.filter((b) => b.blockCategory !== item.blockCategory)].slice(0, n)
}

/** Under the preview of a free item: what Pro has of the same kind, as pictures, with the price and the buy button. */
export function ProMore({ items, label, where, className }: { items: SiteItem[]; /** e.g. "pricing" */ label?: string; where: string; className?: string }) {
  if (!items.length) return null
  const id = `pro-more-${where}`
  return (
    <section aria-labelledby={id} className={cn("bg-frame rounded-3xl p-5 sm:p-7", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          <h2 id={id} className="text-lg font-semibold tracking-tight text-balance sm:text-xl">
            Pro has {proBlockCount()} more screens{label ? <> like this, including more {label} blocks</> : null}
          </h2>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <Price />
            <span className="text-muted-foreground">{STANDING_PRICE ? "for every Pro block and template. Tax included." : "One payment for every Pro block and template."}</span>
            <RefundLine />
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <BuyButton where={where} />
          <Link href="/pro" className={buttonVariants({ size: "sm", variant: "ghost" })}>
            See all Pro <ArrowRight className="rtl:rotate-180" aria-hidden="true" />
          </Link>
        </div>
      </div>
      <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {items.map((p) => {
          const thumb = thumbFor(p.name, p.tier)!
          return (
            <li key={p.name} className="min-w-0">
              <Link href={`/blocks/${p.name}`} className="group focus-visible:ring-ring/50 block rounded-2xl outline-none focus-visible:ring-[3px]">
                <span className="bg-background block overflow-hidden rounded-xl shadow-[0_1px_2px_rgb(0_0_0/0.06)]">
                  {/* eslint-disable-next-line @next/next/no-img-element -- static export: plain images */}
                  <img src={`${thumb}.light.webp`} alt="" width={800} height={400} loading="lazy" decoding="async" className="block aspect-[2/1] w-full object-cover object-top dark:hidden" />
                  {/* eslint-disable-next-line @next/next/no-img-element -- static export: plain images */}
                  <img src={`${thumb}.dark.webp`} alt="" width={800} height={400} loading="lazy" decoding="async" className="hidden aspect-[2/1] w-full object-cover object-top dark:block" />
                </span>
                <span className="mt-2 flex items-center gap-2 text-sm font-medium">
                  <span className="truncate group-hover:underline">{p.title}</span>
                  <ProBadge className="shrink-0" />
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
