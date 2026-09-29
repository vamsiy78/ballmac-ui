import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/** A docs section heading with an anchor target. `index` is accepted for older call sites and not shown. */
export function SectionHeading({ id, children, className }: { id: string; children: ReactNode; index?: string; className?: string }) {
  return (
    <h2 id={id} className={cn("scroll-mt-24 text-xl font-semibold tracking-tight", className)}>
      {children}
    </h2>
  )
}

/** Small muted label above a page title. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-muted-foreground text-sm">{children}</p>
}
