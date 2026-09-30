import { ThinkingIndicator } from "@/components/ballmac/thinking-indicator"

const variants = ["dots", "bars", "wave", "shimmer"] as const

export default function ThinkingIndicatorVariants() {
  return (
    <div className="grid w-full max-w-md gap-2 sm:grid-cols-2">
      {variants.map((variant) => (
        <div key={variant} className="flex items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3">
          <ThinkingIndicator variant={variant} label="Thinking" statusLabel={`Assistant is thinking (${variant})`} />
          <span className="font-mono text-xs text-muted-foreground">{variant}</span>
        </div>
      ))}
    </div>
  )
}
