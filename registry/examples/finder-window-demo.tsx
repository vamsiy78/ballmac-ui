"use client"

import * as React from "react"
import { Clock, Download, FileText, Home, Image as ImageIcon, Monitor } from "lucide-react"

import { FinderWindow, type FinderNode, type FinderSidebarSection } from "@/components/ballmac/finder-window"

const root: FinderNode = {
  id: "home",
  name: "yadav",
  kind: "folder",
  children: [
    {
      id: "documents",
      name: "Documents",
      kind: "folder",
      children: [
        { id: "report", name: "Q3 Report.pdf", kind: "file", ext: "pdf", tone: "red", size: "2.4 MB", modified: "Today, 9:41" },
        { id: "budget", name: "Budget.xlsx", kind: "file", ext: "xls", tone: "green", size: "184 KB", modified: "Yesterday" },
        { id: "notes", name: "Meeting notes.txt", kind: "file", ext: "txt", size: "6 KB", modified: "Sep 24, 2026" },
        { id: "contracts", name: "Contracts", kind: "folder", tone: "teal", children: [{ id: "nda", name: "NDA.pdf", kind: "file", ext: "pdf", tone: "red", size: "310 KB", modified: "Sep 2, 2026" }] },
      ],
    },
    {
      id: "pictures",
      name: "Pictures",
      kind: "folder",
      tone: "purple",
      children: [
        { id: "beach", name: "Beach.heic", kind: "file", ext: "heic", tone: "orange", size: "3.1 MB", modified: "Aug 12, 2026" },
        { id: "team", name: "Team offsite.png", kind: "file", ext: "png", tone: "blue", size: "1.2 MB", modified: "Aug 3, 2026" },
      ],
    },
    { id: "downloads", name: "Downloads", kind: "folder", tone: "green", children: [{ id: "installer", name: "Installer.dmg", kind: "file", ext: "dmg", tone: "graphite", size: "88 MB", modified: "Today, 8:02" }] },
    { id: "desktop", name: "Desktop", kind: "folder", tone: "amber", children: [] },
  ],
}

const sidebar: FinderSidebarSection[] = [
  {
    title: "Favorites",
    items: [
      { id: "home", label: "yadav", icon: <Home /> },
      { id: "desktop", label: "Desktop", icon: <Monitor /> },
      { id: "documents", label: "Documents", icon: <FileText /> },
      { id: "downloads", label: "Downloads", icon: <Download /> },
      { id: "pictures", label: "Pictures", icon: <ImageIcon /> },
    ],
  },
]

export default function FinderWindowDemo() {
  const [opened, setOpened] = React.useState<string | null>(null)
  return (
    <div className="flex w-full max-w-[720px] flex-col gap-3">
      <FinderWindow root={root} sidebar={sidebar} defaultFolder="documents" onOpenFile={(f) => setOpened(f.name)} className="h-[380px]" />
      <p className="flex items-center gap-1.5 text-sm text-muted-foreground" role="status">
        <Clock className="size-3.5" aria-hidden="true" />
        {opened ? `Opened ${opened}` : "Double-click a file or press Return to open it."}
      </p>
    </div>
  )
}
