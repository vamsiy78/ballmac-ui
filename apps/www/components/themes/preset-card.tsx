import { type ThemeSpec } from "@ballmac-ui/theme-engine"

import { cn } from "@/lib/utils"

import { themeStyle, type Mode } from "./theme-style"

/** A tiny app drawn with a preset's own tokens, so a card shows what the theme feels like and not only its swatches. */
export function PresetMini({ spec, mode, className }: { spec: ThemeSpec; mode: Mode; className?: string }) {
  return (
    <div data-theme-scope={mode} className={cn(mode === "dark" && "dark", className)} style={themeStyle(spec, mode)} aria-hidden="true">
      <div className="bg-background text-foreground border-border grid gap-2.5 overflow-hidden rounded-xl border p-3">
        <div className="flex items-center gap-1.5">
          <span className="bg-primary size-3.5 rounded-md" />
          <span className="bg-foreground/80 h-1.5 w-12 rounded-full" />
          <span className="bg-muted ml-auto h-1.5 w-8 rounded-full" />
        </div>
        <div className="bg-card border-border grid gap-2 rounded-lg border p-2.5">
          <span className="bg-foreground/80 h-1.5 w-16 rounded-full" />
          <span className="bg-muted-foreground/60 h-1 w-24 rounded-full" />
          <div className="flex h-9 items-end gap-1">
            {[0.45, 0.7, 0.55, 0.9, 0.65].map((h, i) => (
              <span key={i} className="flex-1 rounded-t-sm" style={{ height: `${h * 100}%`, background: `var(--chart-${i + 1})` }} />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="bg-primary text-primary-foreground grid h-5 flex-1 place-items-center rounded-md text-[9px] font-semibold">Button</span>
          <span className="bg-secondary h-5 w-9 rounded-md" />
          <span className="border-ring size-5 rounded-md border-2" />
        </div>
      </div>
    </div>
  )
}
