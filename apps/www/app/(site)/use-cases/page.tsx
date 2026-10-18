import { ArrowRight } from "lucide-react"
import type { Metadata } from "next"

import Link from "@/components/site/link"
import { useCases } from "@/lib/use-cases"

export const metadata: Metadata = {
  title: "What you can build",
  description: "Dashboards, desktop apps, AI agent interfaces, landing pages, admin tools and sign-in flows: the blocks, templates and guides for each.",
  alternates: { canonical: "/use-cases" },
}

export default function UseCasesPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-14 sm:px-6 md:py-20">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">What you can build</h1>
        <p className="text-muted-foreground mt-4 text-base leading-relaxed text-pretty sm:text-lg">
          Start from the job, not the catalog. Each page gathers the blocks, templates and guides for one kind of product.
        </p>
      </header>
      <ul className="mt-14 grid gap-4 sm:grid-cols-2">
        {useCases.map((u) => (
          <li key={u.slug}>
            <Link
              href={`/use-cases/${u.slug}`}
              className="bg-card hover:bg-accent focus-visible:ring-ring/50 group flex h-full flex-col justify-between gap-6 rounded-2xl border p-6 outline-none transition-colors focus-visible:ring-[3px]"
            >
              <span>
                <span className="block text-lg font-semibold tracking-tight">{u.name}</span>
                <span className="text-muted-foreground mt-2 block text-sm leading-relaxed">{u.description}</span>
              </span>
              <span className="text-muted-foreground group-hover:text-foreground flex items-center gap-1.5 text-sm font-medium">
                {u.blocks.length} blocks, {u.templates.length} {u.templates.length === 1 ? "template" : "templates"}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" aria-hidden="true" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
