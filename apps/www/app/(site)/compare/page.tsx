import { ArrowRight } from "lucide-react"
import type { Metadata } from "next"

import Link from "@/components/site/link"
import { comparisons } from "@/lib/compare"

export const metadata: Metadata = {
  title: "Compare shadcn UI libraries",
  description: "Ballmac UI next to shadcn/ui blocks, Magic UI, Tailark and 21st.dev: price, license and who each is for, with the source for every claim about others.",
  alternates: { canonical: "/compare" },
}

export default function CompareIndex() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-14 sm:px-6 md:py-20">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">Compare Ballmac UI</h1>
        <p className="text-muted-foreground mt-4 text-base leading-relaxed text-pretty sm:text-lg">
          There are good places to get shadcn-style UI. Here is how we differ from each, where they are the better pick, and where we read each claim.
        </p>
      </header>
      <ul className="mt-14 grid gap-4 sm:grid-cols-2">
        {comparisons.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/compare/${c.slug}`}
              className="bg-card hover:bg-accent focus-visible:ring-ring/50 group flex h-full flex-col justify-between gap-6 rounded-2xl border p-6 outline-none transition-colors focus-visible:ring-[3px]"
            >
              <span>
                <span className="block text-lg font-semibold tracking-tight">{c.title}</span>
                <span className="text-muted-foreground mt-2 block text-sm leading-relaxed">{c.what}</span>
              </span>
              <span className="text-muted-foreground group-hover:text-foreground flex items-center gap-1.5 text-sm font-medium">
                Read the comparison
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" aria-hidden="true" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
