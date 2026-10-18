import { AlertTriangle, Info, Lightbulb } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

const kinds = {
  note: { label: "Note", icon: Info, bar: "bg-chart-1" },
  tip: { label: "Tip", icon: Lightbulb, bar: "bg-chart-2" },
  warning: { label: "Warning", icon: AlertTriangle, bar: "bg-chart-4" },
} as const

export type CalloutKind = keyof typeof kinds

/** A note, tip or warning. The label is text, so the kind never depends on color alone. */
export function Callout({ kind = "note", title, children }: { kind?: CalloutKind; title?: string; children: ReactNode }) {
  const { label, icon: Icon, bar } = kinds[kind]
  return (
    <aside role="note" aria-label={title ?? label} className="bg-card not-prose relative my-5 overflow-hidden rounded-xl border py-3.5 ps-5 pe-4 text-[15px]">
      <span aria-hidden="true" className={cn("absolute inset-y-0 start-0 w-1", bar)} />
      <p className="text-foreground mb-1 flex items-center gap-2 text-sm font-semibold">
        <Icon className="size-4" aria-hidden="true" />
        {title ?? label}
      </p>
      <div className="text-muted-foreground space-y-3 leading-relaxed [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 [&_code]:bg-muted [&_code]:text-foreground [&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] [&_p]:m-0 [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:ps-5">{children}</div>
    </aside>
  )
}

export const Note = (p: { title?: string; children: ReactNode }) => <Callout kind="note" {...p} />
export const Tip = (p: { title?: string; children: ReactNode }) => <Callout kind="tip" {...p} />
export const Warning = (p: { title?: string; children: ReactNode }) => <Callout kind="warning" {...p} />
