import { cn } from "@/lib/utils"
import { SPIRAL } from "@/components/site/spiral"

export function BallmacMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" className={cn("size-6 shrink-0", className)}>
      <circle cx="16" cy="16" r="12.5" />
      <path d={SPIRAL} />
    </svg>
  )
}

/** "Ballmac UI" wordmark: the mark, the name, and a mono UI tag. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <BallmacMark />
      <span className="hidden text-[15px] min-[420px]:inline">Ballmac</span>
      <span className="border-border text-muted-foreground rounded-[5px] border px-1.5 py-px font-mono text-[10px] leading-4 tracking-[0.12em]">
        UI
      </span>
    </span>
  )
}
