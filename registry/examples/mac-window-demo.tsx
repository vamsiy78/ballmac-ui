"use client"

import * as React from "react"
import { Check, Folder, Hash, ListChecks, Search, Share, SquarePen, Trash2 } from "lucide-react"

import {
  MacWindow,
  MacWindowContent,
  MacWindowControls,
  MacWindowMain,
  MacWindowSidebar,
  MacWindowSidebarItem,
  MacWindowTitleBar,
  MacWindowToolbarButton,
} from "@/components/ballmac/mac-window"

const folders = [
  { name: "All notes", count: 24 },
  { name: "Ideas", count: 5 },
  { name: "Launch", count: 8 },
  { name: "Recipes", count: 4 },
  { name: "Travel", count: 3 },
]

const initialTasks = [
  { label: "Record the product walkthrough", done: true },
  { label: "Final pass on pricing copy", done: true },
  { label: "Notarize and staple the DMG", done: false },
  { label: "Schedule the launch post for 9:00", done: false },
]

export default function MacWindowDemo() {
  const [folder, setFolder] = React.useState("Launch")
  const [tasks, setTasks] = React.useState(initialTasks)

  return (
    <div className="relative isolate flex w-full max-w-[640px] justify-center overflow-hidden rounded-2xl border border-foreground/10 px-4 py-8 sm:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 dark:brightness-[0.55]">
        <div className="absolute inset-0 bg-linear-to-br from-chart-3 via-chart-5 to-chart-4" />
        <div className="absolute -inset-x-1/4 top-1/3 h-full rounded-[50%] bg-white/20 blur-2xl" />
      </div>

      <MacWindow className="h-[340px] w-full" onClose={() => {}} onMinimize={() => {}} onZoom={() => {}}>
        <MacWindowSidebar className="max-sm:hidden">
          <nav aria-label="Folders" className="flex flex-col gap-0.5 px-2.5">
            <p className="px-2 pb-1 text-[11px] font-semibold text-muted-foreground">iCloud</p>
            {folders.map((f) => (
              <MacWindowSidebarItem key={f.name} selected={folder === f.name} onClick={() => setFolder(f.name)}>
                <Folder className="text-chart-3" aria-hidden="true" />
                <span className="flex-1 truncate">{f.name}</span>
                <span className="text-xs text-muted-foreground tabular-nums">{f.count}</span>
              </MacWindowSidebarItem>
            ))}
            <p className="px-2 pt-3 pb-1 text-[11px] font-semibold text-muted-foreground">Tags</p>
            <div className="flex flex-wrap gap-1 px-1.5">
              {["launch", "design", "mac"].map((tag) => (
                <span key={tag} className="inline-flex h-6 items-center gap-0.5 rounded-full bg-foreground/[0.07] px-2 text-xs text-foreground/70">
                  <Hash className="size-3" aria-hidden="true" />
                  {tag}
                </span>
              ))}
            </div>
          </nav>
        </MacWindowSidebar>

        <MacWindowMain>
          <MacWindowTitleBar
            controls={false}
            title={
              <span className="flex items-center gap-3">
                <MacWindowControls className="pointer-events-auto sm:hidden" />
                <span className="flex flex-col leading-tight">
                  <span>{folder}</span>
                  <span className="text-[11px] font-normal text-muted-foreground">{folders.find((f) => f.name === folder)?.count} notes</span>
                </span>
              </span>
            }
          >
            <MacWindowToolbarButton aria-label="Delete note" className="max-sm:hidden">
              <Trash2 aria-hidden="true" />
            </MacWindowToolbarButton>
            <MacWindowToolbarButton aria-label="Checklist">
              <ListChecks aria-hidden="true" />
            </MacWindowToolbarButton>
            <MacWindowToolbarButton aria-label="Share" className="max-sm:hidden">
              <Share aria-hidden="true" />
            </MacWindowToolbarButton>
            <MacWindowToolbarButton aria-label="New note">
              <SquarePen aria-hidden="true" />
            </MacWindowToolbarButton>
            <MacWindowToolbarButton aria-label="Search">
              <Search aria-hidden="true" />
            </MacWindowToolbarButton>
          </MacWindowTitleBar>

          <MacWindowContent className="px-6 py-4 sm:px-8">
            <p className="text-center text-[11px] text-muted-foreground">September 29, 2026 at 9:41 AM</p>
            <h3 className="mt-3 text-xl font-bold tracking-tight">Launch checklist</h3>
            <ul className="mt-3 flex flex-col gap-2">
              {tasks.map((task, i) => (
                <li key={task.label}>
                  <label className="flex cursor-default items-center gap-2.5 text-sm">
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => setTasks((t) => t.map((x, j) => (j === i ? { ...x, done: !x.done } : x)))}
                      className="peer sr-only"
                    />
                    <span
                      aria-hidden="true"
                      className="flex size-[18px] shrink-0 items-center justify-center rounded-full border border-foreground/25 text-white transition-colors peer-checked:border-transparent peer-checked:bg-chart-3 peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/50"
                    >
                      {task.done ? <Check className="size-3" strokeWidth={3} /> : null}
                    </span>
                    <span className={task.done ? "text-muted-foreground line-through decoration-foreground/30" : ""}>{task.label}</span>
                  </label>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm leading-relaxed text-foreground/70">
              Ship Tuesday morning. Keep the changelog short and lead with the menu bar redesign.
            </p>
          </MacWindowContent>
        </MacWindowMain>
      </MacWindow>
    </div>
  )
}
