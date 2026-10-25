import { ArrowRight } from "lucide-react"

import { buttonVariants } from "@/components/ballmac/button"
import { NativeProof } from "@/components/feels/native-proof"
import { CheckoutLink } from "@/components/pro/checkout-link"
import { FeelBlocks } from "@/components/pro/feel-blocks"
import { CopyButton } from "@/components/site/copy-button"
import Link from "@/components/site/link"
import { getOffer } from "@/lib/offer"
import { getBlocks, isPro } from "@/lib/registry"
import { cn } from "@/lib/utils"

const proCount = () => getBlocks().filter(isPro).length || 150

const install = "npx shadcn@latest add @ballmac/feel-auto"

/** What opens after someone has used the two apps: the paid screens in each feel, and the free way to keep the feel. */
async function Reveal({ where }: { where: string }) {
  const offer = await getOffer()
  const buy = offer.onSale && offer.checkout && offer.price
  const label = buy ? `Get Pro for $${offer.price}` : "See Ballmac UI Pro"
  const cls = buttonVariants({ size: "lg", shape: "pill" })
  return (
    <div className="bg-card grid min-w-0 gap-8 rounded-3xl border p-5 sm:p-8 [&>*]:min-w-0">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-muted-foreground text-sm font-medium">That was one setting</p>
        <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-balance sm:text-3xl">Now see it on the screens you would otherwise build for weeks.</h3>
        <p className="text-muted-foreground mt-3 leading-relaxed text-pretty">
          The feel is free. Pro is {proCount()} finished screens (dashboards, settings, billing, sign-in, mail and more) that already take it, with loading, empty and error states built in.
        </p>
      </div>
      <FeelBlocks />
      <div className="flex flex-col items-center gap-3">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {buy ? (
            <CheckoutLink href={offer.checkout!} className={cls}>
              {label} <ArrowRight aria-hidden="true" />
            </CheckoutLink>
          ) : (
            <Link href={`/pro?utm_source=ballmac-ui&utm_medium=native-proof&utm_campaign=${where}`} className={cls}>
              {label} <ArrowRight aria-hidden="true" />
            </Link>
          )}
          <Link href="/blocks" className={buttonVariants({ size: "lg", shape: "pill", variant: "outline" })}>
            Open any block first
          </Link>
        </div>
        <p className="text-muted-foreground text-[13px]">{buy ? `$${offer.price} once, tax included. No subscription, every update included. Works as described or your money back.` : "One payment. No subscription, every update included."}</p>
        <div className="text-muted-foreground mt-3 inline-flex max-w-full items-center gap-1.5 rounded-lg border py-1 pr-1 pl-3 font-mono text-[12px]">
          <span className="select-none" aria-hidden="true">$</span>
          <span className="text-foreground truncate">{install}</span>
          <CopyButton value={install} label="Copy the free install command" />
        </div>
        <p className="text-muted-foreground text-xs">The free way to get the feel today.</p>
      </div>
    </div>
  )
}

/** The side-by-side that proves "feels native", with the purchase step attached. `where` names the page, for the campaign tag on the Pro link. */
export function NativeHook({ where, className }: { where: string; className?: string }) {
  return <NativeProof className={cn(className)} reveal={<Reveal where={where} />} />
}
