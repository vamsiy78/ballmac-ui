import { ArrowRight } from "lucide-react"

import Link from "@/components/site/link"
import { SectionHeading } from "@/components/site/section-heading"
import { useCasesFor } from "@/lib/use-cases"

/** On an item page: the use-case guides that cover this item, with their titles as the link text. Renders nothing when there are none. */
export function UseCaseLinks({ name }: { name: string }) {
  const cases = useCasesFor(name)
  if (!cases.length) return null
  return (
    <section className="space-y-4">
      <SectionHeading id="use-cases">Used for</SectionHeading>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {cases.map((u) => (
          <li key={u.slug}>
            <Link href={`/use-cases/${u.slug}`} className="hover:bg-accent focus-visible:ring-ring/50 group flex h-full items-start justify-between gap-3 rounded-xl border p-4 outline-none transition-colors focus-visible:ring-[3px] motion-reduce:transition-none">
              <span className="min-w-0">
                <span className="block text-sm font-medium">{u.title}</span>
                <span className="text-muted-foreground mt-1 line-clamp-2 block text-sm">{u.description}</span>
              </span>
              <ArrowRight className="text-muted-foreground mt-0.5 size-4 shrink-0 rtl:-scale-x-100" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
