"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type Library = "radix" | "base"
const KEY = "ballmac-library"
const CHANGED = "ballmac-library-change"

function read(): Library {
  try {
    return localStorage.getItem(KEY) === "base" ? "base" : "radix"
  } catch {
    return "radix"
  }
}
function subscribe(onChange: () => void) {
  window.addEventListener(CHANGED, onChange)
  window.addEventListener("storage", onChange)
  return () => {
    window.removeEventListener(CHANGED, onChange)
    window.removeEventListener("storage", onChange)
  }
}

/** Radix UI / Base UI choice for an item that has both. Both panels are server-rendered; the choice is remembered for the next item. */
export function LibrarySwitcher({ radix, base }: { radix: React.ReactNode; base: React.ReactNode }) {
  const library = React.useSyncExternalStore(subscribe, read, () => "radix" as Library)
  const id = React.useId()
  const choose = (next: Library) => {
    try {
      localStorage.setItem(KEY, next)
    } catch {}
    window.dispatchEvent(new Event(CHANGED))
  }
  const options = [
    ["radix", "Radix UI"],
    ["base", "Base UI"],
  ] as const
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div role="radiogroup" aria-label="Component library" className="bg-muted inline-flex rounded-lg p-0.5">
          {options.map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={library === value}
              onClick={() => choose(value)}
              className={cn(
                "focus-visible:ring-ring/50 rounded-md px-3 py-1 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px] motion-reduce:transition-none",
                library === value ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <p id={`${id}-note`} className="text-muted-foreground text-sm">
          {library === "base" ? "For projects whose shadcn style is a Base UI one (base-nova, base-vega...)." : "The default, and what a Radix-style project installs."}
        </p>
      </div>
      <div hidden={library !== "radix"} aria-describedby={`${id}-note`}>
        {radix}
      </div>
      <div hidden={library !== "base"} aria-describedby={`${id}-note`}>
        {base}
      </div>
    </div>
  )
}
