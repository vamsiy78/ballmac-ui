import { CheckoutLink } from "@/components/pro/checkout-link"
import { cn } from "@/lib/utils"
import { MONTHLY_CHECKOUT, MONTHLY_PRICE } from "@/lib/pro-monthly"

/**
 * The subscription alternative to the one-time licence, as a boxed card with its own button so it cannot be missed. It uses the surrounding text colour, so it
 * reads on both the dark Pro cards and the light pages. Nothing is rendered until the monthly checkout link is set.
 */
export function MonthlyOption({ className }: { className?: string }) {
  if (!MONTHLY_CHECKOUT) return null
  return (
    <div className={cn("rounded-xl border border-current/30 bg-current/[0.07] p-4 text-left", className)}>
      <p className="flex items-baseline gap-1.5">
        <span className="text-2xl font-semibold tracking-tight">${MONTHLY_PRICE}</span>
        <span className="text-sm opacity-70">/ month</span>
        <span className="ml-auto rounded-full border border-current/30 px-2 py-0.5 text-[11px] font-medium">Monthly</span>
      </p>
      <p className="mt-1.5 text-sm leading-snug opacity-85">Prefer to pay monthly? Full Pro access while you subscribe. Cancel anytime.</p>
      <CheckoutLink
        href={MONTHLY_CHECKOUT}
        plan="monthly"
        className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-full border border-current/50 px-5 text-sm font-semibold transition-colors hover:bg-current/15 focus-visible:ring-2 focus-visible:ring-current/50 focus-visible:outline-none"
      >
        Subscribe for ${MONTHLY_PRICE}/month
      </CheckoutLink>
    </div>
  )
}
