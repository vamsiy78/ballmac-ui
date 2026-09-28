import type { ReactNode } from "react"

export function SectionHeading({ id, children, index }: { id: string; children: ReactNode; index?: string }) {
  return (
    <h2 id={id} className="flex scroll-mt-24 items-center gap-3 text-lg font-semibold tracking-tight">
      {index && <span className="text-muted-foreground font-mono text-xs font-normal tabular-nums">{index}</span>}
      {children}
    </h2>
  )
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-muted-foreground flex items-center gap-3 font-mono text-[11px] tracking-[0.16em] uppercase">
      <span aria-hidden="true" className="bg-foreground/25 h-px w-6" />
      {children}
    </p>
  )
}
