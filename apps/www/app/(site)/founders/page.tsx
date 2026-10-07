import type { Metadata } from "next"
import Link from "@/components/site/link"

import { Eyebrow } from "@/components/site/section-heading"
import { endsLabel } from "@/lib/founding"
import { FOUNDERS_EMAIL, founderNames } from "@/lib/founders"
import { getOffer } from "@/lib/offer"

export const metadata: Metadata = {
  title: "Founding members",
  description: "The first buyers of Ballmac UI Pro, who keep their price for every future update and help choose what gets built next.",
  alternates: { canonical: "/founders" },
}

export const revalidate = 300

export default async function FoundersPage() {
  const offer = (await getOffer()).founding
  return (
    <div className="mx-auto max-w-[760px] px-4 py-16 sm:px-6">
      <header className="space-y-4">
        <Eyebrow>Founding members</Eyebrow>
        <h1 className="text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">The people who backed Ballmac UI Pro first</h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          The first {offer?.limit ?? 25} licences were sold at a founding price. Those buyers keep that price for every future update, help choose what we build next, and can ask to be listed here.
        </p>
      </header>
      <section aria-labelledby="names-h" className="mt-12">
        <h2 id="names-h" className="text-xl font-semibold tracking-tight">
          Listed members
        </h2>
        {founderNames.length > 0 ? (
          <ul className="mt-5 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
            {founderNames.map((n) => (
              <li key={n} className="border-b py-2">
                {n}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground mt-3 leading-relaxed">Nobody is listed yet. Founding members who want a place here can ask from the Founders desk in their Pro library, and we add them by hand.</p>
        )}
      </section>
      <section aria-labelledby="perks-h" className="mt-12">
        <h2 id="perks-h" className="text-xl font-semibold tracking-tight">
          What a founding licence includes
        </h2>
        <ul className="text-muted-foreground mt-4 list-disc space-y-2 ps-5 leading-relaxed">
          <li>
            Every future update to Ballmac UI Pro for your licence key: new blocks, fixes and new starter apps added to Pro. Separately sold products are not covered.
          </li>
          <li>A vote on the next batch of blocks.</li>
          <li>
            A direct line: write to{" "}
            <a className="text-foreground underline underline-offset-4" href={`mailto:${FOUNDERS_EMAIL}?subject=Founding%20member`}>
              {FOUNDERS_EMAIL}
            </a>{" "}
            with “Founding member” in the subject.
          </li>
        </ul>
      </section>
      <p className="mt-12">
        {offer ? (
          <>
            The founding price is still open{offer.endsAt ? `, until ${endsLabel(offer.endsAt)}` : ""}.{" "}
            <Link href="/pricing#plans" className="text-foreground font-medium underline underline-offset-4">
              See the offer
            </Link>
            .
          </>
        ) : (
          <>
            The founding price has ended.{" "}
            <Link href="/pricing" className="text-foreground font-medium underline underline-offset-4">
              See current pricing
            </Link>
            .
          </>
        )}
      </p>
    </div>
  )
}
