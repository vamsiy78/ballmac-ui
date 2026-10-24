"use client"

import * as React from "react"
import { AlertTriangle, FileCode2, Layers, Sparkles } from "lucide-react"

import { SegmentedControl, SegmentedControlItem } from "@/components/ballmac/segmented-control"
import Link from "@/components/site/link"
import { dayLabel, type Entry } from "@/lib/pro-changelog-core"
import { cn } from "@/lib/utils"

type Filter = "all" | "new" | "update" | "news"
const MORE = 10

function Chips({ items }: { items: Entry["items"] }) {
  const [all, setAll] = React.useState(false)
  const shown = all ? items : items.slice(0, MORE)
  return (
    <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Items">
      {shown.map((i) => (
        <li key={i.name}>
          <Link href={i.href ?? "/blocks"} className="bg-muted/60 hover:bg-muted focus-visible:ring-ring/50 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-xs outline-none transition-colors focus-visible:ring-[3px]">
            {i.name}
            <span className="text-muted-foreground tabular-nums">{i.version}</span>
          </Link>
        </li>
      ))}
      {items.length > MORE && (
        <li>
          <button type="button" onClick={() => setAll((v) => !v)} aria-expanded={all} className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 rounded-full px-2.5 py-1 text-xs font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-[3px]">
            {all ? "Show fewer" : `and ${items.length - MORE} more`}
          </button>
        </li>
      )}
    </ul>
  )
}

const KIND = { new: { icon: Sparkles, label: "New in Pro" }, update: { icon: Layers, label: "Updated" }, news: { icon: FileCode2, label: "Pro" } } as const

/** The Pro changelog as a timeline: a date rail on the left, one card per change, a filter above. Entries are prepared on the server. */
export function ProChangelogList({ entries }: { entries: Entry[] }) {
  const [filter, setFilter] = React.useState<Filter>("all")
  const list = filter === "all" ? entries : entries.filter((e) => e.kind === filter)
  const days = [...new Set(list.map((e) => e.date))]
  return (
    <div>
      <div className="max-w-full overflow-x-auto pb-1">
        <SegmentedControl aria-label="Filter the changelog" value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <SegmentedControlItem value="all">All</SegmentedControlItem>
          <SegmentedControlItem value="new">New</SegmentedControlItem>
          <SegmentedControlItem value="update">Updated</SegmentedControlItem>
          <SegmentedControlItem value="news">Starters and platform</SegmentedControlItem>
        </SegmentedControl>
      </div>
      <ol className="mt-10 space-y-10" aria-live="polite">
        {days.map((day) => (
          <li key={day} className="grid gap-4 md:grid-cols-[9rem_minmax(0,1fr)] md:gap-8">
            <h2 className="text-muted-foreground text-sm font-medium tabular-nums md:sticky md:top-20 md:self-start md:pt-5">
              <time dateTime={day}>{dayLabel(day)}</time>
            </h2>
            <div className="border-border relative space-y-4 border-s ps-5 md:ps-8">
              {list
                .filter((e) => e.date === day)
                .map((e) => {
                  const { icon: Icon, label } = KIND[e.kind]
                  return (
                    <article key={e.key} className="bg-card relative rounded-2xl border p-5 sm:p-6">
                      <span aria-hidden="true" className="bg-background border-border absolute top-7 -start-[1.7rem] size-2.5 rounded-full border-2 md:-start-[2.45rem]" />
                      <p className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium">
                        <Icon className="size-3.5" aria-hidden="true" />
                        {e.kind === "news" ? e.tag : label}
                        {e.breaking && (
                          <span className="text-foreground inline-flex items-center gap-1 rounded-full border px-2 py-0.5">
                            <AlertTriangle className="size-3" aria-hidden="true" /> May affect edited files
                          </span>
                        )}
                      </p>
                      {e.kind === "news" ? (
                        <>
                          <h3 className="mt-2 text-lg font-semibold tracking-tight text-balance">{e.title}</h3>
                          <p className="text-muted-foreground mt-1.5 leading-relaxed text-pretty">{e.note}</p>
                        </>
                      ) : e.kind === "new" ? (
                        <>
                          <h3 className={cn("mt-2 text-lg font-semibold tracking-tight text-balance")}>
                            {e.items.length} new {e.items.length === 1 ? "item" : "items"}
                          </h3>
                          <Chips items={e.items} />
                        </>
                      ) : (
                        <>
                          <h3 className="mt-2 leading-relaxed font-medium text-pretty">{e.note}</h3>
                          <Chips items={e.items} />
                        </>
                      )}
                    </article>
                  )
                })}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
