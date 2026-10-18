"use client"

import * as React from "react"

import { PMS, usePackageManager, type PM } from "@/components/site/use-package-manager"
import { cn } from "@/lib/utils"

const Ctx = React.createContext<{ pm: PM; set: (pm: PM) => void; id: string } | null>(null)
const useTabs = () => {
  const ctx = React.useContext(Ctx)
  if (!ctx) throw new Error("Code tabs must sit inside CodeBlockTabs")
  return ctx
}

/**
 * Install commands in four tabs. The remark plugin that turns ```npm fences into this markup (fumadocs-core remarkNpm) names the parts;
 * the choice is shared with every other install box on the site and remembered.
 */
export function CodeBlockTabs({ children }: { children: React.ReactNode; defaultValue?: string; groupId?: string; persist?: boolean }) {
  const [pm, set] = usePackageManager()
  const id = React.useId()
  return (
    <Ctx.Provider value={{ pm, set, id }}>
      <div dir="ltr" className="bg-card not-prose my-5 overflow-hidden rounded-xl border text-start">{children}</div>
    </Ctx.Provider>
  )
}

export function CodeBlockTabsList({ children }: { children: React.ReactNode }) {
  const { set } = useTabs()
  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const tabs = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'))
    const i = tabs.indexOf(document.activeElement as HTMLButtonElement)
    const dir = 1 // the tabs are drawn left to right, like the commands under them
    let next = -1
    if (e.key === "ArrowRight") next = (i + dir + tabs.length) % tabs.length
    if (e.key === "ArrowLeft") next = (i - dir + tabs.length) % tabs.length
    if (e.key === "Home") next = 0
    if (e.key === "End") next = tabs.length - 1
    if (next < 0) return
    e.preventDefault()
    tabs[next]!.focus()
    set(tabs[next]!.dataset.value as PM)
  }
  return (
    <div role="tablist" aria-label="Package manager" onKeyDown={onKey} className="flex h-10 items-center gap-0.5 border-b px-1.5">
      {children}
    </div>
  )
}

export function CodeBlockTabsTrigger({ value, children }: { value: string; children: React.ReactNode }) {
  const { pm, set, id } = useTabs()
  const active = pm === value
  return (
    <button
      type="button"
      role="tab"
      id={`${id}-tab-${value}`}
      data-value={value}
      aria-selected={active}
      aria-controls={`${id}-panel-${value}`}
      tabIndex={active ? 0 : -1}
      onClick={() => set(value as PM)}
      className={cn(
        "focus-visible:ring-ring/50 rounded-md px-2.5 py-1 font-mono text-xs outline-none transition-colors focus-visible:ring-[3px]",
        active ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  )
}

export function CodeBlockTab({ value, children }: { value: string; children: React.ReactNode }) {
  const { pm, id } = useTabs()
  return (
    <div
      role="tabpanel"
      id={`${id}-panel-${value}`}
      aria-labelledby={`${id}-tab-${value}`}
      hidden={pm !== value}
      className="[&>div]:my-0 [&>div]:rounded-none [&>div]:border-0 [&>div]:bg-transparent"
    >
      {children}
    </div>
  )
}

export const PACKAGE_MANAGERS = PMS
