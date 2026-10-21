import type { Metadata } from "next"
import { AffiliateProgram } from "@/components/affiliates/affiliate-program"
import { Frame, Themed } from "@/components/pro/shots"
import Link from "@/components/site/link"
import { getBlocks, isPro, itemHref } from "@/lib/registry"
import { thumbFor } from "@/lib/thumbs"

export const metadata: Metadata = {
  title: "Partner program — recommend Ballmac UI, earn 30%",
  description:
    "Recommend Ballmac UI Pro, earn 30% on eligible sales and give your audience 10% off. Real product previews, a 30-day referral window and monthly payout reviews.",
  alternates: { canonical: "/affiliates" },
}
export default function AffiliatesPage() {
  const blocks = getBlocks().filter((b) => isPro(b) && thumbFor(b.name, "pro"))
  const picks = ["dashboard", "billing", "ai-chat"]
    .map((category) => blocks.find((b) => b.blockCategory === category))
    .filter((b) => b !== undefined)
  const total = getBlocks().filter(isPro).length
  const proof = (
    <section className="border-b py-10 sm:py-12" aria-labelledby="partner-product-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-xl">
          <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">
            Your reputation deserves a good product
          </p>
          <h2 id="partner-product-title" className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            Show them what they can build.
          </h2>
          <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
            {total} Pro blocks for real apps. React, Tailwind and shadcn, with the code in their own project. Every
            block can be previewed before buying.
          </p>
        </div>
        <Link href="/pro" className="text-sm font-medium underline underline-offset-4">
          Explore everything in Pro
        </Link>
      </div>
      <p className="text-muted-foreground mt-5 text-xs sm:hidden">Swipe to explore, or open a preview.</p>
      <div
        className="mt-3 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 focus-visible:outline-2 focus-visible:outline-ring sm:mt-7 sm:grid sm:grid-cols-3 sm:gap-6 sm:overflow-visible sm:pb-0"
        role="region"
        aria-label="Pro block previews"
        tabIndex={0}
      >
        {picks.map((b) => {
          const thumb = thumbFor(b.name, "pro")
          if (!thumb) return null
          const title =
            b.blockCategory === "dashboard"
              ? "App dashboards"
              : b.blockCategory === "billing"
                ? "Billing and usage"
                : "AI interfaces"
          return (
            <Link
              key={b.name}
              href={itemHref(b)}
              className="group block w-[86%] shrink-0 snap-start rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:w-auto"
            >
              <Frame>
                <div className="aspect-[16/10] bg-muted/20">
                  <Themed
                    base={thumb}
                    alt={`${b.title} preview`}
                    width={600}
                    height={375}
                    className="h-full object-contain"
                  />
                </div>
              </Frame>
              <h3 className="mt-4 text-sm font-semibold tracking-tight">{title}</h3>
              <p className="text-muted-foreground mt-1.5 line-clamp-2 text-xs leading-relaxed">{b.description}</p>
              <span className="mt-3 inline-block text-xs font-medium underline underline-offset-4">
                Open live preview
              </span>
            </Link>
          )
        })}
      </div>
      <div className="mt-7 grid gap-4 border-t pt-6 text-sm sm:grid-cols-3">
        {[
          ["A useful recommendation", "Show a real build, rather than ask your audience to take your word for it."],
          ["Code they can make their own", "Blocks install into their project through the shadcn CLI."],
          ["One purchase. Ongoing value.", "Pro is a one-time purchase with future Pro updates included."],
        ].map(([title, text]) => (
          <div key={title}>
            <h3 className="font-medium">{title}</h3>
            <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">{text}</p>
          </div>
        ))}
      </div>
    </section>
  )
  return <AffiliateProgram productProof={proof} />
}
