import type { Metadata } from "next"

import Link from "@/components/site/link"
import { PRO_LICENCE_EMAIL, PRO_LICENCE_PATH } from "@/lib/pro-licence"
import { REFUND_FIX_DAYS, REFUND_REPORT_DAYS } from "@/lib/pro-refund"

export const metadata: Metadata = {
  title: "Ballmac UI Pro Refund Policy",
  description: `If a Pro item does not work as its page says and we cannot fix it within ${REFUND_FIX_DAYS} days of your request, you get a full refund. How to ask, and what happens next.`,
  alternates: { canonical: "/refund" },
}

const H = "text-foreground text-xl font-semibold tracking-tight"

export default function RefundPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-muted-foreground text-sm font-medium">Ballmac UI Pro</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">Refund Policy</h1>
      <p className="text-muted-foreground mt-3 text-sm">Effective 24 October 2026. This is part of the <Link href={PRO_LICENCE_PATH} className="text-foreground underline underline-offset-4">Pro licence</Link>.</p>

      <aside className="bg-card mt-10 rounded-2xl border p-6 sm:p-8">
        <p className="text-lg font-semibold tracking-tight text-balance">Works as described, or your money back.</p>
        <p className="text-muted-foreground mt-2 leading-relaxed">
          If something you bought does not do what its page says and we cannot fix it within {REFUND_FIX_DAYS} days of your request, you get a full refund. Mistakes on our side are always refunded. Write to{" "}
          <a href={`mailto:${PRO_LICENCE_EMAIL}`} className="text-foreground underline underline-offset-4">{PRO_LICENCE_EMAIL}</a>.
        </p>
      </aside>

      <div className="text-muted-foreground mt-14 space-y-12 leading-relaxed [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4">
        <section aria-labelledby="why-h" className="space-y-3">
          <h2 id="why-h" className={H}>Why purchases are final</h2>
          <p>Pro is source code that you can copy the moment you pay, so it cannot be returned like a physical product. Every Pro block has a public preview and full documentation, and three Pro blocks are free to try, so you can check before you pay.</p>
        </section>

        <section aria-labelledby="when-h" className="space-y-4">
          <h2 id="when-h" className={H}>When you get your money back</h2>
          <div>
            <h3 className="text-foreground font-medium">Something does not work</h3>
            <p className="mt-1">If a Pro item does not do what its page says (it fails to install, throws errors in a supported setup, or behaves differently from its documentation), email us within {REFUND_REPORT_DAYS} days of purchase with what you tried. We will fix it or give you a working alternative within {REFUND_FIX_DAYS} days of your request. If we cannot, we refund the full price you paid.</p>
          </div>
          <div>
            <h3 className="text-foreground font-medium">A mistake on our side</h3>
            <p className="mt-1">Charged twice, charged the wrong amount, or a technical error at checkout? We refund the wrong payment in full.</p>
          </div>
        </section>

        <section aria-labelledby="not-h" className="space-y-3">
          <h2 id="not-h" className={H}>What is not a reason for a refund</h2>
          <p>Changing your mind, or not using what you bought, is not covered, because the source is yours as soon as you pay. A feature that is not described on the item&apos;s page is not a defect.</p>
        </section>

        <section aria-labelledby="how-h" className="space-y-3">
          <h2 id="how-h" className={H}>How a refund works</h2>
          <ol className="list-decimal space-y-2 ps-6 marker:text-muted-foreground">
            <li>Email <a href={`mailto:${PRO_LICENCE_EMAIL}`}>{PRO_LICENCE_EMAIL}</a> from the address you bought with, or include your receipt, and say what is wrong and what you tried.</li>
            <li>We aim to reply within two business days and start on a fix.</li>
            <li>If we cannot fix it within {REFUND_FIX_DAYS} days of your request, we refund the full price. Refunds go back to the original payment method through our payment provider, and your bank decides how long it takes to show.</li>
          </ol>
        </section>

        <section aria-labelledby="after-h" className="space-y-3">
          <h2 id="after-h" className={H}>After a refund</h2>
          <ul className="list-disc space-y-2 ps-6 marker:text-muted-foreground">
            <li>The licence for that purchase ends, for you and for every seat on it, and the Licence Key stops working.</li>
            <li>Please remove Pro source that is not already part of a product you have delivered. Free items stay yours.</li>
            <li>A launch or discounted price belongs to the original purchase. Buying again later means the price at that time.</li>
          </ul>
        </section>

        <section aria-labelledby="eu-h" className="space-y-3">
          <h2 id="eu-h" className={H}>Your legal rights</h2>
          <p>Nothing here limits rights you have as a consumer that cannot lawfully be waived, including rights if digital content does not conform to the contract. Where the law gives you a right to withdraw from a digital purchase, it ends once access begins, if you agreed to that when you bought.</p>
        </section>

        <section aria-labelledby="dispute-h" className="space-y-3">
          <h2 id="dispute-h" className={H}>Before you dispute a payment</h2>
          <p>Please write to us first. We answer quickly, and a bank dispute takes weeks even when it goes your way.</p>
        </section>
      </div>
    </div>
  )
}
