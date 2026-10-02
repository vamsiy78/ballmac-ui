"use client"

import { ExternalLink, Languages, Monitor, Moon, RotateCcw, Smartphone, Sun, Tablet, Terminal } from "lucide-react"
import * as React from "react"

import { CopyButton } from "@/components/site/copy-button"
import { cn } from "@/lib/utils"

const SITE_URL = "https://ui.ballmac.com"

const viewports = [
  { id: "desktop", label: "Desktop", width: "100%", icon: Monitor },
  { id: "tablet", label: "Tablet", width: "768px", icon: Tablet },
  { id: "mobile", label: "Mobile", width: "375px", icon: Smartphone },
] as const

const iconButton =
  "text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:ring-ring/50 inline-flex size-7 items-center justify-center rounded-md outline-none transition-colors focus-visible:ring-[3px] [&_svg]:size-3.5"

/** Full-page preview in an iframe with a shadcn-style toolbar: view, viewport, reload, install and Open in v0. */
export function FramePreview({
  src,
  title,
  code,
  height = 720,
  name,
  example,
  v0 = true,
  pages,
}: {
  src: string
  title: string
  code: React.ReactNode
  height?: number
  /** Registry item name, for the install command. */
  name?: string
  /** Example name, for Open in v0. */
  example?: string
  /** Show "Open in v0"; off for Pro items, whose registry JSON needs a licence key. */
  v0?: boolean
  /** Extra pages of a multi-page template. When given, a page switcher replaces `src`. */
  pages?: { title: string; src: string }[]
}) {
  const [tab, setTab] = React.useState<"preview" | "code">("preview")
  const [viewport, setViewport] = React.useState<(typeof viewports)[number]["id"]>("desktop")
  const [run, setRun] = React.useState(0)
  const [pageIndex, setPageIndex] = React.useState(0)
  const [theme, setTheme] = React.useState<"site" | "light" | "dark">("site")
  const [dir, setDir] = React.useState<"ltr" | "rtl">("ltr")
  const frame = React.useRef<HTMLIFrameElement>(null)
  const current = pages?.[pageIndex]?.src ?? src
  const applyTheme = React.useCallback((t: "site" | "light" | "dark") => {
    if (t === "site") return
    try {
      frame.current?.contentDocument?.documentElement.classList.toggle("dark", t === "dark")
    } catch {}
  }, [])
  const applyDir = React.useCallback((d: "ltr" | "rtl") => {
    try {
      if (frame.current?.contentDocument) frame.current.contentDocument.documentElement.dir = d
    } catch {}
  }, [])
  const width = viewports.find((v) => v.id === viewport)!.width
  const command = name ? `npx shadcn@latest add @ballmac/${name}` : ""
  return (
    <div className="space-y-3">
      {pages && pages.length > 1 && (
        <div role="tablist" aria-label="Pages" className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
          {pages.map((p, i) => (
            <button
              key={p.src}
              role="tab"
              aria-selected={pageIndex === i}
              onClick={() => {
                setTab("preview")
                setPageIndex(i)
              }}
              className={cn(
                "focus-visible:ring-ring/50 h-8 shrink-0 rounded-full border px-3 text-[13px] font-medium outline-none transition-colors focus-visible:ring-[3px]",
                pageIndex === i ? "bg-foreground text-background border-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              {p.title}
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div role="tablist" aria-label="View" className="bg-muted flex gap-0.5 rounded-lg p-0.5">
          {(["preview", "code"] as const).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cn(
                "focus-visible:ring-ring/50 rounded-md px-2.5 py-1 text-[13px] font-medium capitalize outline-none transition-all focus-visible:ring-[3px]",
                tab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-0.5 rounded-lg border p-0.5 md:flex" role="radiogroup" aria-label="Viewport">
            {viewports.map((v) => (
              <button
                key={v.id}
                role="radio"
                aria-checked={viewport === v.id}
                aria-label={v.label}
                title={v.label}
                onClick={() => {
                  setTab("preview")
                  setViewport(v.id)
                }}
                className={cn(iconButton, viewport === v.id && "bg-accent text-foreground")}
              >
                <v.icon />
              </button>
            ))}
            <span className="bg-border mx-0.5 h-4 w-px" aria-hidden="true" />
            <button
              type="button"
              aria-pressed={theme === "dark"}
              aria-label="Preview in dark mode"
              title={theme === "dark" ? "Preview in light mode" : "Preview in dark mode"}
              onClick={() => {
                const next = theme === "dark" ? "light" : "dark"
                setTheme(next)
                applyTheme(next)
              }}
              className={cn(iconButton, theme === "dark" && "bg-accent text-foreground")}
            >
              {theme === "dark" ? <Moon /> : <Sun />}
            </button>
            <button
              type="button"
              aria-pressed={dir === "rtl"}
              aria-label="Preview right-to-left"
              title={dir === "rtl" ? "Preview left-to-right" : "Preview right-to-left (Arabic, Hebrew, Persian)"}
              onClick={() => {
                const next = dir === "rtl" ? "ltr" : "rtl"
                setDir(next)
                applyDir(next)
              }}
              className={cn(iconButton, dir === "rtl" && "bg-accent text-foreground")}
            >
              <Languages />
            </button>
            <button type="button" onClick={() => setRun((r) => r + 1)} aria-label="Reload preview" title="Reload" className={iconButton}>
              <RotateCcw />
            </button>
            <a href={current} target="_blank" rel="noreferrer" aria-label="Open preview in a new tab" title="Open in a new tab" className={iconButton}>
              <ExternalLink />
            </a>
          </div>
          {command && (
            <div className="hidden h-8 items-center gap-1.5 rounded-lg border pr-0.5 pl-2.5 font-mono text-xs lg:flex">
              <Terminal className="text-muted-foreground size-3.5" aria-hidden="true" />
              <span>{command.replace("npx shadcn@latest", "npx shadcn")}</span>
              <CopyButton value={command} label="Copy install command" />
            </div>
          )}
          {example && v0 && (
            <a
              href={`https://v0.dev/chat/api/open?url=${encodeURIComponent(`${SITE_URL}/r/${example}.json`)}`}
              target="_blank"
              rel="noreferrer"
              className="focus-visible:ring-ring/50 inline-flex h-8 items-center gap-1.5 rounded-lg bg-black px-2.5 text-xs font-medium text-white outline-none transition-opacity hover:opacity-85 focus-visible:ring-[3px] dark:bg-white dark:text-black"
            >
              Open in v0<span className="sr-only"> (opens in a new tab)</span>
            </a>
          )}
        </div>
      </div>
      <div hidden={tab !== "preview"} className="bg-muted/40 overflow-hidden rounded-xl border">
        <div className="flex justify-center">
          <iframe
            key={`${run}-${current}`}
            ref={frame}
            src={current}
            onLoad={() => {
              applyTheme(theme)
              applyDir(dir)
            }}
            title={title}
            loading="lazy"
            className="bg-background block max-w-full transition-[width] duration-300 ease-[var(--bm-ease-out)] data-[narrow=true]:border-x"
            data-narrow={viewport !== "desktop"}
            style={{ width, height }}
          />
        </div>
      </div>
      <div hidden={tab !== "code"} className="overflow-hidden rounded-xl border">
        {code}
      </div>
    </div>
  )
}
