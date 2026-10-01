"use client"

import * as React from "react"

import { FileBrowser, type FileEntry } from "@/components/ballmac/file-browser"

const initial: FileEntry[] = [
  {
    id: "design",
    name: "Design",
    kind: "folder",
    modified: "2026-09-28T14:20:00Z",
    owner: "Priya",
    children: [
      { id: "tokens", name: "tokens.json", kind: "file", size: 8200, modified: "2026-09-27T09:00:00Z", owner: "Priya" },
      { id: "hero", name: "hero.png", kind: "file", size: 2_400_000, modified: "2026-09-26T16:30:00Z", owner: "Priya" },
    ],
  },
  { id: "src", name: "src", kind: "folder", modified: "2026-09-30T08:05:00Z", owner: "Lee", children: [{ id: "index", name: "index.ts", kind: "file", size: 1200, modified: "2026-09-30T08:05:00Z", owner: "Lee" }] },
  { id: "readme", name: "README.md", kind: "file", size: 5400, modified: "2026-09-29T11:12:00Z", owner: "Lee" },
  { id: "report", name: "Q3 report.pdf", kind: "file", size: 3_900_000, modified: "2026-09-25T10:00:00Z", owner: "Sam" },
  { id: "demo", name: "demo.mp4", kind: "file", size: 148_000_000, modified: "2026-09-22T13:45:00Z", owner: "Sam" },
  { id: "bundle", name: "release.zip", kind: "file", size: 52_000_000, modified: "2026-09-21T18:30:00Z", owner: "Lee" },
]

function remove(entries: FileEntry[], ids: string[]): FileEntry[] {
  return entries.filter((e) => !ids.includes(e.id)).map((e) => (e.children ? { ...e, children: remove(e.children, ids) } : e))
}

export default function FileBrowserDemo() {
  const [entries, setEntries] = React.useState(initial)
  return <FileBrowser entries={entries} rootLabel="Project files" onDelete={(ids) => setEntries((e) => remove(e, ids))} onDownload={() => {}} className="w-full max-w-3xl" />
}
