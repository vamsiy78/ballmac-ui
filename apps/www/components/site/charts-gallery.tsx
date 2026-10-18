"use client"

import * as React from "react"
import { ArrowRight } from "lucide-react"

import Link from "@/components/site/link"
import { CopyButton } from "@/components/site/copy-button"
import { LazyExample } from "@/components/site/lazy-example"
import { LazyMount } from "@/components/site/lazy-mount"
import { cn } from "@/lib/utils"

export type ChartTile = { id: string; title: string; family: string; familyTitle: string }

/** Every chart example as a live tile, with a filter by kind of chart. Each tile loads when it nears the screen. */
export function ChartsGallery({ tiles, families }: { tiles: ChartTile[]; families: { id: string; title: string }[] }) {
  const [family, setFamily] = React.useState("all")
  const shown = family === "all" ? tiles : tiles.filter((t) => t.family === family)
  return (
    <div className="space-y-6">
      <div role="group" aria-label="Kind of chart" className="flex flex-wrap gap-2">
        {[{ id: "all", title: `All ${tiles.length}` }, ...families.map((f) => ({ id: f.id, title: `${f.title} ${tiles.filter((t) => t.family === f.id).length}` }))].map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={family === f.id}
            onClick={() => setFamily(f.id)}
            className={cn(
              "focus-visible:ring-ring/50 h-8 rounded-full border px-3 text-[13px] font-medium outline-none transition-colors focus-visible:ring-[3px]",
              family === f.id ? "bg-foreground text-background border-foreground" : "hover:bg-accent"
            )}
          >
            {f.title}
          </button>
        ))}
      </div>
      <ul className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {shown.map((t) => (
          <li key={t.id} className="bg-card flex min-w-0 flex-col overflow-hidden rounded-2xl border">
            <LazyMount className="bg-muted/40 grid min-h-[26rem] place-items-center p-4 sm:p-6">
              <LazyExample name={t.id} />
            </LazyMount>
            <div className="flex items-center justify-between gap-3 border-t px-4 py-3">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-medium">{t.title}</h3>
                <p className="text-muted-foreground truncate font-mono text-xs" dir="ltr">
                  @ballmac/{t.id}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <CopyButton value={`npx shadcn@latest add @ballmac/${t.id}`} label={`Copy the install command for ${t.title}`} />
                <Link href={`/components/${t.family}`} className="hover:bg-accent focus-visible:ring-ring/50 inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium outline-none focus-visible:ring-[3px]">
                  {t.familyTitle} <ArrowRight className="size-3 rtl:rotate-180" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
