import { buyerQuotes } from "@/lib/buyer-quotes"
import { cn } from "@/lib/utils"

/** Up to three buyer quotes (lib/buyer-quotes.ts). Renders nothing until there is a real one. */
export function BuyerQuotes({ className }: { className?: string }) {
  if (!buyerQuotes.length) return null
  const shown = buyerQuotes.slice(0, 3)
  return (
    <section aria-label="What buyers say" className={cn("mx-auto grid max-w-[980px] grid-cols-1 gap-4", shown.length > 1 && "md:grid-cols-2", shown.length > 2 && "lg:grid-cols-3", className)}>
      {shown.map((q) => (
        <figure key={q.name + q.quote.slice(0, 20)} className="bg-frame flex flex-col justify-between gap-4 rounded-2xl p-5 text-start">
          <blockquote className="text-[15px] leading-relaxed text-pretty">“{q.quote}”</blockquote>
          <figcaption className="text-muted-foreground text-sm">
            {q.href ? (
              <a href={q.href} className="text-foreground font-medium underline-offset-4 hover:underline" rel="noopener">
                {q.name}
              </a>
            ) : (
              <span className="text-foreground font-medium">{q.name}</span>
            )}
            {q.role ? <>, {q.role}</> : null}
          </figcaption>
        </figure>
      ))}
    </section>
  )
}
