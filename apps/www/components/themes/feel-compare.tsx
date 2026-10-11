"use client"

import * as React from "react"
import { FileText, Folder, Plus, Search, Star } from "lucide-react"
import { feelSpec, FEELS, type FeelId, type ThemeSpec } from "@ballmac-ui/theme-engine"

import { AppWindow, AppWindowContent, AppWindowTitleBar } from "@/components/ballmac/app-window"
import { Button } from "@/components/ballmac/button"
import { Input } from "@/components/ballmac/input"
import { Switch } from "@/components/ballmac/switch"
import { cn } from "@/lib/utils"

import { themeStyle, type Mode } from "./theme-style"

const rows = [
  { name: "All notes", icon: FileText },
  { name: "Starred", icon: Star },
  { name: "Launch", icon: Folder },
]

/** The same small app drawn once per feel, in the theme being built, so the difference is the only thing to look at. */
function MiniApp({ feel }: { feel: FeelId }) {
  const [on, setOn] = React.useState(true)
  const [row, setRow] = React.useState("Launch")
  return (
    <AppWindow feel={feel} active onClose={() => {}} onMinimize={() => {}} onMaximize={() => {}} className="shadow-[var(--bm-shadow-popover,0_12px_36px_-10px_rgb(0_0_0/0.25))]">
      <AppWindowTitleBar title="Notes" icon={<FileText />}>
        <Button variant="ghost" size="icon-sm" aria-label="New note">
          <Plus />
        </Button>
      </AppWindowTitleBar>
      <AppWindowContent className="flex">
        <nav aria-label="Folders" className="bg-muted/40 flex w-32 shrink-0 flex-col gap-0.5 border-e p-1.5">
          {rows.map(({ name, icon: Icon }) => (
            <button
              key={name}
              type="button"
              aria-current={row === name ? "page" : undefined}
              onClick={() => setRow(name)}
              className={cn(
                "relative flex h-[var(--bm-sidebar-item-h,calc(var(--spacing)*9))] w-full items-center gap-2 rounded-[var(--bm-sidebar-item-radius,var(--radius-lg))] px-2 text-start text-sm outline-none transition-colors duration-150",
                "hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-[current=page]:bg-accent aria-[current=page]:font-medium",
                "before:absolute before:inset-y-[22%] before:start-0 before:w-[var(--bm-sidebar-indicator,0px)] before:rounded-full before:bg-primary before:opacity-0 before:content-[''] aria-[current=page]:before:opacity-100"
              )}
            >
              <Icon className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{name}</span>
            </button>
          ))}
        </nav>
        <div className="grid min-w-0 flex-1 content-start gap-3 p-3">
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2" aria-hidden="true" />
            <Input aria-label={`Search (${feel})`} placeholder="Search" className="ps-8" />
          </div>
          <label className="flex items-center justify-between gap-2 text-sm">
            Sync
            <Switch checked={on} onCheckedChange={setOn} />
          </label>
          <div className="flex gap-2">
            <Button size="sm">Save</Button>
            <Button size="sm" variant="outline">
              Cancel
            </Button>
          </div>
          {/* a menu surface, drawn the way the real menus are, to show row height, corners, frosting and shadow */}
          <div
            role="presentation"
            className="bg-popover/[var(--bm-material-alpha,100%)] text-popover-foreground rounded-xl border p-[var(--bm-menu-pad,0.25rem)] shadow-[var(--bm-shadow-popover,0_12px_36px_-10px_rgb(0_0_0/0.25))] backdrop-blur-[var(--bm-material-blur,0px)]"
          >
            {["Rename", "Duplicate"].map((l, i) => (
              <div
                key={l}
                className={cn(
                  "flex min-h-[var(--bm-menu-item-h,2rem)] items-center rounded-[var(--bm-menu-item-radius,var(--radius-md))] px-2 text-sm",
                  i === 0 && "bg-accent text-accent-foreground"
                )}
              >
                {l}
              </div>
            ))}
          </div>
        </div>
      </AppWindowContent>
    </AppWindow>
  )
}

/** All four feels side by side. */
export function FeelCompare({ spec, mode, reduced, id }: { spec: ThemeSpec; mode: Mode; reduced: boolean; id: string }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
      {FEELS.map((f) => (
        <figure key={f.slug} className="grid min-w-0 gap-2">
          <div
            data-theme-scope={mode}
            data-feel={f.slug}
            id={`${id}-${f.slug}`}
            className={cn(mode === "dark" && "dark", "@container bg-muted/40 rounded-2xl border p-4 text-foreground")}
            // the theme's colours with this feel's handling; the visitor's other motion and shape tweaks give way to the feel, which is the point of the comparison
            style={themeStyle({ ...spec, ...feelSpec(f.slug) }, mode, reduced)}
          >
            <MiniApp feel={f.slug} />
          </div>
          <figcaption className="px-1">
            <span className="text-sm font-medium">{f.title}</span>
            <span className="text-muted-foreground block text-xs leading-snug">{f.tagline}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  )
}
