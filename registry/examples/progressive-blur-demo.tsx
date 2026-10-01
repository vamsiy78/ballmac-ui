import { ProgressiveBlur } from "@/components/ballmac/progressive-blur"

const rows = ["Quarterly report", "Design review notes", "Onboarding checklist", "Pricing experiment", "Launch plan", "Customer interviews", "Roadmap draft", "Retro summary", "Hiring pipeline", "Security audit"]

export default function ProgressiveBlurDemo() {
  return (
    <div className="relative h-72 w-full max-w-sm overflow-hidden rounded-2xl border bg-card">
      <div className="h-full overflow-y-auto p-3" tabIndex={0} role="region" aria-label="Documents">
        <ul className="grid gap-2 py-8">
          {rows.map((r, i) => (
            <li key={r} className="flex items-center gap-3 rounded-xl border bg-background p-3">
              <span aria-hidden="true" className="flex size-8 items-center justify-center rounded-lg bg-muted font-mono text-xs text-muted-foreground">{i + 1}</span>
              <span className="text-sm font-medium">{r}</span>
            </li>
          ))}
        </ul>
      </div>
      <ProgressiveBlur position="top" size="4rem" strength={12} />
      <ProgressiveBlur position="bottom" size="5rem" strength={16} />
    </div>
  )
}
