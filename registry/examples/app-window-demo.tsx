"use client"

import * as React from "react"
import { FileText, Folder, PanelLeft, Plus, Search, Settings, Star } from "lucide-react"

import { AppWindow, AppWindowContent, AppWindowTitleBar } from "@/components/ballmac/app-window"
import { Button } from "@/components/ballmac/button"
import { Input } from "@/components/ballmac/input"
import { SegmentedControl, SegmentedControlItem } from "@/components/ballmac/segmented-control"
import { Switch } from "@/components/ballmac/switch"
import type { FeelId } from "@/lib/ballmac/feel"
import { cn } from "@/lib/utils"

const folders = [
  { name: "All notes", icon: FileText, count: 24 },
  { name: "Starred", icon: Star, count: 6 },
  { name: "Launch", icon: Folder, count: 8 },
  { name: "Recipes", icon: Folder, count: 4 },
]

/** A small desktop app, so the feel shows in the chrome, the sidebar, the controls and the focus ring all at once. */
export default function AppWindowDemo() {
  const [feel, setFeel] = React.useState<FeelId>("macos")
  const [folder, setFolder] = React.useState("Launch")
  const [maximized, setMaximized] = React.useState(false)
  const [open, setOpen] = React.useState(true)
  const [sync, setSync] = React.useState(true)

  return (
    <div className="flex w-full max-w-[760px] flex-col items-center gap-5">
      <SegmentedControl aria-label="Platform feel" value={feel} onValueChange={(v) => setFeel(v as FeelId)}>
        <SegmentedControlItem value="macos">macOS</SegmentedControlItem>
        <SegmentedControlItem value="windows">Windows</SegmentedControlItem>
        <SegmentedControlItem value="ios">iOS</SegmentedControlItem>
      </SegmentedControl>

      {/* data-feel scopes the whole feel to this block, so the page around it is unchanged */}
      <div data-feel={feel} className="bg-muted/40 flex min-h-[26rem] w-full items-center justify-center rounded-2xl border p-4 sm:p-8">
        {open ? (
          <AppWindow
            feel={feel}
            active
            maximized={maximized}
            onClose={() => setOpen(false)}
            onMinimize={() => setOpen(false)}
            onMaximize={() => setMaximized((m) => !m)}
            className={cn("h-[22rem] w-full shadow-[var(--bm-shadow-popover,0_12px_36px_-10px_rgb(0_0_0/0.25))]", maximized && "h-[26rem] max-w-none")}
          >
            <AppWindowTitleBar
              title="Notes"
              icon={<FileText />}
              leading={feel === "windows" ? undefined : <PanelLeft className="text-muted-foreground size-4 rtl:-scale-x-100" aria-hidden="true" />}
            >
              <Button variant="ghost" size="icon-sm" aria-label="New note">
                <Plus />
              </Button>
              <Button variant="ghost" size="icon-sm" aria-label="Settings">
                <Settings />
              </Button>
            </AppWindowTitleBar>
            <AppWindowContent className="flex">
              <nav aria-label="Folders" className="bg-muted/40 hidden w-44 shrink-0 flex-col gap-0.5 border-e p-2 sm:flex">
                {folders.map(({ name, icon: Icon, count }) => (
                  <button
                    key={name}
                    type="button"
                    aria-current={folder === name ? "page" : undefined}
                    onClick={() => setFolder(name)}
                    className={cn(
                      "relative flex h-[var(--bm-sidebar-item-h,calc(var(--spacing)*9))] w-full items-center gap-2 rounded-[var(--bm-sidebar-item-radius,var(--radius-lg))] px-2 text-start text-sm outline-none transition-colors duration-150",
                      "hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-[current=page]:bg-accent aria-[current=page]:font-medium",
                      "before:absolute before:inset-y-[22%] before:start-0 before:w-[var(--bm-sidebar-indicator,0px)] before:rounded-full before:bg-primary before:opacity-0 before:content-[''] aria-[current=page]:before:opacity-100"
                    )}
                  >
                    <Icon className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate">{name}</span>
                    <span className="text-muted-foreground text-xs tabular-nums">{count}</span>
                  </button>
                ))}
              </nav>
              <div className="flex min-w-0 flex-1 flex-col gap-4 p-4">
                <div className="relative">
                  <Search className="text-muted-foreground pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2" aria-hidden="true" />
                  <Input aria-label="Search notes" placeholder="Search notes" className="ps-8" />
                </div>
                <div className="grid gap-1">
                  <h3 className="text-base font-semibold tracking-tight">{folder}</h3>
                  <p className="text-muted-foreground text-sm">Ship the beta on Friday, then write the changelog and invite the first ten teams.</p>
                </div>
                <label className="flex items-center justify-between gap-3 text-sm">
                  Sync across devices
                  <Switch checked={sync} onCheckedChange={setSync} />
                </label>
                <div className="mt-auto flex gap-2">
                  <Button>Save</Button>
                  <Button variant="outline">Cancel</Button>
                </div>
              </div>
            </AppWindowContent>
          </AppWindow>
        ) : (
          <div className="text-muted-foreground grid justify-items-center gap-3 text-sm">
            The window is closed.
            <Button variant="outline" onClick={() => setOpen(true)}>
              Reopen
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
