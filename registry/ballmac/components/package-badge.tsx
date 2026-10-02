// Ballmac UI: Package Badge. https://ui.ballmac.com/components/package-badge
"use client"

import * as React from "react"
import { Boxes, ExternalLink, Scale, Terminal } from "lucide-react"

import { CopyButton } from "@/components/ballmac/copy-button"
import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"

type PackageManager = "npm" | "pnpm" | "yarn" | "bun"

const INSTALL: Record<PackageManager, string> = {
  npm: "npm install",
  pnpm: "pnpm add",
  yarn: "yarn add",
  bun: "bun add",
}

/** 1_250_000 → "1.3M", 48_200 → "48.2k". */
function formatCount(value: number) {
  if (value >= 1_000_000) return `${+(value / 1_000_000).toFixed(1)}M`
  if (value >= 1000) return `${+(value / 1000).toFixed(1)}k`
  return String(value)
}

/** 18_432 bytes → "18.0 kB". */
function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} kB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function Sparkline({ values, label }: { values: number[]; label: string }) {
  const max = Math.max(...values, 1)
  const min = Math.min(...values)
  const w = 96
  const h = 28
  const pts = values.map((v, i) => [(i / Math.max(values.length - 1, 1)) * w, h - 3 - ((v - min) / Math.max(max - min, 1)) * (h - 6)] as const)
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ")
  const area = `${line} L${w} ${h} L0 ${h} Z`
  const id = React.useId().replace(/:/g, "")
  return (
    <svg role="img" aria-label={label} viewBox={`0 0 ${w} ${h}`} className="h-7 w-24 overflow-visible text-chart-2">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.28" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1]![0]} cy={pts[pts.length - 1]![1]} r="2.25" fill="currentColor" />
    </svg>
  )
}

type PackageBadgeProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Package name, such as "@acme/ui". */
  name: string
  /** Latest version, without a leading "v". */
  version: string
  /** One-line description. */
  description?: string
  /** Weekly downloads. */
  downloads?: number
  /** Weekly download counts, oldest first, for the sparkline. */
  trend?: number[]
  /** Minified and gzipped size in bytes. */
  size?: number
  /** SPDX license id, such as "MIT". */
  license?: string
  /** The package ships its own TypeScript types. */
  types?: boolean
  /** Module formats, such as ["ESM", "CJS"]. */
  formats?: string[]
  /** Link to the package page. The name becomes a link when set. */
  href?: string
  /** "card" shows everything, "inline" is a one-line pill for READMEs and docs. */
  variant?: "card" | "inline"
  /** Package manager shown in the install command. */
  manager?: PackageManager
  /** Hides the install command in the card. */
  hideInstall?: boolean
}

function PackageBadge({
  name,
  version,
  description,
  downloads,
  trend,
  size,
  license,
  types,
  formats,
  href,
  variant = "card",
  manager = "npm",
  hideInstall = false,
  className,
  ...props
}: PackageBadgeProps) {
  const msg = useMessages()
  const command = `${INSTALL[manager]} ${name}`
  const title = href ? (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="inline-flex items-center gap-1 rounded-sm outline-none hover:underline hover:underline-offset-4 focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      {name}
      <ExternalLink aria-hidden="true" className="size-3 text-muted-foreground" />
    </a>
  ) : (
    name
  )

  if (variant === "inline") {
    return (
      <div
        data-slot="package-badge"
        data-variant="inline"
        className={cn("inline-flex h-7 max-w-full items-center overflow-hidden rounded-full border bg-card text-xs shadow-xs", className)}
        {...props}
      >
        <span className="flex h-full items-center gap-1.5 truncate bg-muted/60 pe-2 ps-2.5 font-mono font-medium text-foreground">
          <Boxes aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">{title}</span>
        </span>
        <span className="flex h-full items-center border-s px-2.5 font-mono text-foreground tabular-nums">v{version}</span>
        {downloads !== undefined && (
          <span className="hidden h-full items-center border-s px-2.5 text-muted-foreground tabular-nums sm:flex">
            {msg("package-badge.perWeek", "{count}/wk", { count: formatCount(downloads) })}
          </span>
        )}
      </div>
    )
  }

  return (
    <div
      data-slot="package-badge"
      data-variant="card"
      className={cn("w-full overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xs", className)}
      {...props}
    >
      <div className="flex items-start gap-3 p-4 pb-3">
        <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted">
          <Boxes className="size-5 text-foreground" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="truncate font-mono text-sm font-semibold text-foreground">{title}</h3>
            <span className="rounded-full border bg-muted px-2 py-px font-mono text-[11px] text-foreground tabular-nums">v{version}</span>
          </div>
          {description && <p className="mt-0.5 line-clamp-2 text-[13px] leading-5 text-muted-foreground">{description}</p>}
        </div>
        {trend && trend.length > 1 && (
          <div className="hidden shrink-0 flex-col items-end gap-0.5 sm:flex">
            <Sparkline values={trend} label={`Weekly downloads over the last ${trend.length} weeks`} />
          </div>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-px border-y bg-border text-xs sm:grid-cols-4">
        {((): { k: string; v: string; icon?: React.ReactNode }[] => {
          const items: { k: string; v: string; icon?: React.ReactNode }[] = []
          if (downloads !== undefined) items.push({ k: "Weekly downloads", v: formatCount(downloads) })
          if (size !== undefined) items.push({ k: "Gzipped size", v: formatBytes(size) })
          if (license) items.push({ k: "License", v: license, icon: <Scale aria-hidden="true" className="size-3" /> })
          if (formats) items.push({ k: "Formats", v: formats.join(" · ") })
          return items
        })()
          .map((item) => (
            <div key={item.k} className="bg-card px-4 py-2.5">
              <dt className="text-muted-foreground">{item.k}</dt>
              <dd className="mt-0.5 flex items-center gap-1 text-[13px] font-medium text-foreground tabular-nums">
                {item.icon}
                {item.v}
              </dd>
            </div>
          ))}
      </dl>

      {(types || !hideInstall) && (
        <div className="flex flex-wrap items-center gap-2 p-3">
          {!hideInstall && (
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border bg-muted/40 py-1 pe-1 ps-3">
              <Terminal aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
              <code className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">{command}</code>
              <CopyButton size="sm" value={command} ariaLabel={`Copy install command: ${command}`} />
            </div>
          )}
          {types && (
            <span className="inline-flex h-7 items-center gap-1 rounded-full border px-2.5 text-xs font-medium text-foreground">
              <span aria-hidden="true" className="flex size-4 items-center justify-center rounded-[4px] bg-foreground font-mono text-[9px] font-bold text-background">
                {"TS"}
              </span>
              {msg("package-badge.typesIncluded", "Types included")}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export { PackageBadge, formatCount, formatBytes, type PackageBadgeProps }
