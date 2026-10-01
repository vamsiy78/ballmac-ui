"use client"

import * as React from "react"
import { CreditCard, GitMerge, MessageSquare, UserPlus } from "lucide-react"

import { AnimatedList, AnimatedListItem } from "@/components/ballmac/animated-list"

const events = [
  { icon: CreditCard, title: "Payment received", detail: "Invoice #1042 · $4,900" },
  { icon: UserPlus, title: "New teammate", detail: "Priya joined Design" },
  { icon: GitMerge, title: "Pull request merged", detail: "feat: dark mode for settings" },
  { icon: MessageSquare, title: "New comment", detail: "Marco on “Q4 roadmap”" },
]

type Entry = (typeof events)[number] & { id: number }

export default function AnimatedListDemo() {
  const [items, setItems] = React.useState<Entry[]>([{ ...events[0]!, id: 0 }])
  React.useEffect(() => {
    let n = 1
    const id = setInterval(() => {
      setItems((list) => [{ ...events[n % events.length]!, id: n++ }, ...list].slice(0, 6))
    }, 1600)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="h-80 w-full max-w-sm overflow-hidden">
      <AnimatedList max={5} fadeEnd announce label="Recent activity" className="gap-2">
        {items.map(({ id, icon: Icon, title, detail }) => (
          <AnimatedListItem key={id} className="flex items-center gap-3 rounded-xl border bg-card p-3 shadow-xs">
            <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Icon className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-foreground">{title}</span>
              <span className="block truncate text-xs text-muted-foreground">{detail}</span>
            </span>
            <span className="ml-auto font-mono text-[11px] text-muted-foreground">now</span>
          </AnimatedListItem>
        ))}
      </AnimatedList>
    </div>
  )
}
