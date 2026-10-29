import Link from "@/components/site/link"
import { LockKeyhole, ShieldCheck } from "lucide-react"

import { buttonVariants } from "@/components/ballmac/button"
import { CheckoutLink } from "@/components/pro/checkout-link"
import { NudgeText } from "@/components/site/founding-text"
import type { Nudge } from "@/lib/founding"
import { STANDING_CHECKOUT, STANDING_PRICE, STANDING_REGULAR } from "@/lib/limited-offer"

/** Shown instead of source code for Pro items: the preview stays public, the code ships through the Pro registry. */
export function ProNotice({ className = "", nudge = null, hasPrompt = false, prompt = false }: { className?: string; /** The founding-price line, when an offer is running (see nudgeText). */ nudge?: Nudge; /** This item also comes with a build prompt for AI builders. */ hasPrompt?: boolean; /** The notice stands in for the build prompt itself, not for the source. */ prompt?: boolean }) {
  // Outside a founding offer, sell from right here: the price and a straight link to the checkout, not a detour through the pricing page.
  const direct = !nudge && Boolean(STANDING_PRICE && STANDING_CHECKOUT)
  return (
    <div className={`bg-muted/40 flex flex-col items-start gap-4 rounded-xl border p-6 sm:flex-row sm:items-center ${className}`}>
      <span className="bg-background flex size-10 shrink-0 items-center justify-center rounded-lg border" aria-hidden="true">
        <LockKeyhole className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium">{prompt ? "The build prompt is part of Ballmac UI Pro." : "The source is part of Ballmac UI Pro."}</p>
        <p className="text-muted-foreground mt-1 text-sm">
          {prompt
            ? "Log in with your licence key to read and copy it here. It is the whole block written out, ready for Claude, Cursor, Lovable or v0."
            : `Log in with your licence key to read and copy it here, or install it through the shadcn CLI or the MCP server. You own the code once it is in your project.${hasPrompt ? " It also comes with a detailed prompt that recreates it in any AI builder." : ""}`}
        </p>
        {nudge && <p className="mt-2 text-sm font-semibold"><NudgeText nudge={nudge} /></p>}
        {direct && (
          <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <span className="font-semibold">
              ${STANDING_PRICE} once{STANDING_REGULAR && <> <s className="text-muted-foreground font-normal"><span className="sr-only">regular price </span>${STANDING_REGULAR}</s></>}
            </span>
            <span className="text-muted-foreground">for this and every other Pro item. Tax included.</span>
            <span className="text-muted-foreground inline-flex items-center gap-1"><ShieldCheck className="size-3.5" aria-hidden="true" />Money back if it does not work.</span>
          </p>
        )}
      </div>
      <div className="flex shrink-0 gap-2">
        {direct ? (
          <CheckoutLink href={STANDING_CHECKOUT} plan="pro" className={buttonVariants({ size: "sm" })}>Get Pro for ${STANDING_PRICE}</CheckoutLink>
        ) : (
          <Link href="/pricing" className={buttonVariants({ size: "sm" })}>Get Pro</Link>
        )}
        <Link href="/pro/login" className={buttonVariants({ size: "sm", variant: "outline" })}>Log in</Link>
      </div>
    </div>
  )
}

/** A small "Pro" label for cards and headings. */
export function ProBadge({ className = "" }: { className?: string }) {
  return <span className={`bg-foreground text-background inline-flex h-5 items-center rounded-full px-2 text-[11px] font-semibold tracking-wide ${className}`}>PRO</span>
}
