import { PROOF } from "@/lib/proof"

/** Real buyer quotes from lib/proof.ts. Renders nothing until there is at least one. */
export function ProofWall({ className }: { className?: string }) {
  if (PROOF.length === 0) return null
  return (
    <section aria-labelledby="proof-h" className={className}>
      <h2 id="proof-h" className="text-center text-3xl font-semibold tracking-[-0.03em] text-balance">What buyers say</h2>
      <ul className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-2">
        {PROOF.map((p) => (
          <li key={p.name} className="bg-card rounded-2xl border p-6">
            <blockquote className="leading-relaxed text-pretty">“{p.quote}”</blockquote>
            <p className="text-muted-foreground mt-4 text-sm">
              <span className="text-foreground font-medium">{p.name}</span>
              {p.role || p.company ? `, ${[p.role, p.company].filter(Boolean).join(" at ")}` : ""}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
