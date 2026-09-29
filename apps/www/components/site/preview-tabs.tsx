"use client"

import { Check, Copy, Maximize2, RotateCcw } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"

const SITE_URL = "https://ui.ballmac.com"

function ToolbarButton({ label, className, ...props }: React.ComponentProps<"button"> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:ring-ring/50 inline-flex size-8 items-center justify-center rounded-md outline-none transition-colors focus-visible:ring-[3px] [&_svg]:size-3.5",
        className
      )}
      {...props}
    />
  )
}

/** Copyable `@ballmac/<name>` chip that copies the full add command. */
function InstallChip({ name }: { name: string }) {
  const [copied, setCopied] = React.useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(`npx shadcn@latest add @ballmac/${name}`)
          setCopied(true)
          setTimeout(() => setCopied(false), 1600)
        } catch {
          // Clipboard unavailable.
        }
      }}
      aria-label={copied ? "Copied install command" : `Copy install command for @ballmac/${name}`}
      className="bg-background hover:bg-accent focus-visible:ring-ring/50 hidden h-8 max-w-72 items-center gap-2 whitespace-nowrap rounded-md border px-2.5 font-mono text-xs outline-none transition-colors focus-visible:ring-[3px] md:inline-flex"
    >
      <span className="text-muted-foreground">shadcn add</span>
      <span className="truncate">@ballmac/{name}</span>
      {copied ? <Check className="size-3.5 shrink-0" aria-hidden="true" /> : <Copy className="text-muted-foreground size-3.5 shrink-0" aria-hidden="true" />}
    </button>
  )
}

function V0Logo() {
  return (
    <svg viewBox="0 0 40 20" aria-hidden="true" className="h-2.5 w-auto fill-current">
      <path d="M23.3919 0H32.9188C36.7819 0 39.9136 3.13165 39.9136 6.99475V16.0805H36.0006V6.99475C36.0006 6.90167 35.9969 6.80925 35.9898 6.71766L26.4628 16.079C26.4949 16.08 26.5272 16.0805 26.5595 16.0805H36.0006V19.7762H26.5595C22.6964 19.7762 19.4788 16.6139 19.4788 12.7508V3.68923H23.3919V12.7508C23.3919 12.9253 23.4054 13.0977 23.4316 13.2668L33.1682 3.6995C33.0861 3.6927 33.003 3.68923 32.9188 3.68923H23.3919V0Z" />
      <path d="M13.7688 19.0956L0 3.68759H5.53933L13.6231 12.7337V3.68759H17.7535V17.5746C17.7535 19.6705 15.1654 20.6584 13.7688 19.0956Z" />
    </svg>
  )
}

/** Preview / Code tabs with a toolbar: install chip, Open in v0, replay (remount) and full screen. */
export function PreviewTabs({
  preview,
  code,
  className,
  minHeight = 460,
  name,
  example,
}: {
  preview: React.ReactNode
  code: React.ReactNode
  className?: string
  minHeight?: number
  /** Registry item name, for the install chip. */
  name?: string
  /** Example name, for Open in v0 and full screen. */
  example?: string
}) {
  const [tab, setTab] = React.useState<"preview" | "code">("preview")
  const [run, setRun] = React.useState(0)
  const id = React.useId()
  const tabs = ["preview", "code"] as const
  return (
    <div className={cn("bg-card overflow-hidden rounded-2xl border", className)}>
      <div className="flex h-12 items-center justify-between gap-2 border-b px-2">
        <div
          role="tablist"
          aria-label="View"
          className="bg-muted flex gap-0.5 rounded-lg p-0.5"
          onKeyDown={(e) => {
            if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return
            const next = tab === "preview" ? "code" : "preview"
            setTab(next)
            document.getElementById(`${id}-${next}`)?.focus()
          }}
        >
          {tabs.map((t) => (
            <button
              key={t}
              role="tab"
              id={`${id}-${t}`}
              aria-selected={tab === t}
              aria-controls={`${id}-${t}-panel`}
              tabIndex={tab === t ? 0 : -1}
              onClick={() => setTab(t)}
              className={cn(
                "focus-visible:ring-ring/50 rounded-md px-3 py-1 text-[13px] font-medium capitalize outline-none transition-all focus-visible:ring-[3px]",
                tab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {name && <InstallChip name={name} />}
          {example && (
            <a
              href={`https://v0.dev/chat/api/open?url=${encodeURIComponent(`${SITE_URL}/r/${example}.json`)}`}
              target="_blank"
              rel="noreferrer"
              className="bg-foreground text-background focus-visible:ring-ring/50 hidden h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium outline-none transition-opacity hover:opacity-90 focus-visible:ring-[3px] sm:inline-flex"
            >
              Open in <V0Logo />
              <span className="sr-only">v0 (opens in a new tab)</span>
            </a>
          )}
          <ToolbarButton
            label="Replay preview"
            onClick={() => {
              setTab("preview")
              setRun((r) => r + 1)
            }}
          >
            <RotateCcw />
          </ToolbarButton>
          {example && (
            <a
              href={`/preview/${example}`}
              target="_blank"
              rel="noreferrer"
              aria-label="Open preview full screen in a new tab"
              title="Full screen"
              className="text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:ring-ring/50 inline-flex size-8 items-center justify-center rounded-md outline-none transition-colors focus-visible:ring-[3px]"
            >
              <Maximize2 className="size-3.5" />
            </a>
          )}
        </div>
      </div>
      <div id={`${id}-preview-panel`} role="tabpanel" aria-labelledby={`${id}-preview`} hidden={tab !== "preview"}>
        <div className="bm-stage bg-background relative flex items-center justify-center overflow-hidden p-6 sm:p-10" style={{ minHeight }}>
          <React.Fragment key={run}>{preview}</React.Fragment>
        </div>
      </div>
      <div id={`${id}-code-panel`} role="tabpanel" aria-labelledby={`${id}-code`} hidden={tab !== "code"} className="max-h-[560px] overflow-auto">
        {code}
      </div>
    </div>
  )
}
