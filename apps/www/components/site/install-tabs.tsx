"use client"

import { CopyButton } from "@/components/site/copy-button"
import { PMS, usePackageManager, type PM } from "@/components/site/use-package-manager"
import { cn } from "@/lib/utils"

/** Renders one command per package manager; the choice is shared site-wide. */
export function InstallTabs({ commands, className }: { commands: Record<PM, string>; className?: string }) {
  const [pm, setPm] = usePackageManager()
  const command = commands[pm]
  return (
    <div className={cn("bg-card overflow-hidden rounded-xl border", className)}>
      <div className="flex h-10 items-center justify-between border-b pr-2 pl-1.5">
        <div role="tablist" aria-label="Package manager" className="flex gap-0.5">
          {PMS.map((p) => (
            <button
              key={p}
              role="tab"
              aria-selected={p === pm}
              onClick={() => setPm(p)}
              className={cn(
                "rounded-md px-2.5 py-1 font-mono text-xs transition-colors",
                p === pm ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {p}
            </button>
          ))}
        </div>
        <CopyButton value={command} label="Copy command" />
      </div>
      <pre className="overflow-x-auto px-4 py-3.5 font-mono text-[13px] leading-6">
        <code>
          <span className="text-muted-foreground select-none">$ </span>
          {command}
        </code>
      </pre>
    </div>
  )
}
