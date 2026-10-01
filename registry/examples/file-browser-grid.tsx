import { FileBrowser, type FileEntry } from "@/components/ballmac/file-browser"

const entries: FileEntry[] = [
  { id: "a", name: "Brand", kind: "folder", modified: "2026-09-10T10:00:00Z", children: [{ id: "a1", name: "logo.svg", kind: "file", size: 2100, modified: "2026-09-10T10:00:00Z" }] },
  { id: "b", name: "Screenshots", kind: "folder", modified: "2026-09-18T10:00:00Z", children: [] },
  { id: "c", name: "cover.jpg", kind: "file", size: 910_000, modified: "2026-09-12T10:00:00Z" },
  { id: "d", name: "podcast.mp3", kind: "file", size: 24_000_000, modified: "2026-09-14T10:00:00Z" },
  { id: "e", name: "script.py", kind: "file", size: 3300, modified: "2026-09-15T10:00:00Z" },
  { id: "f", name: "archive.tar.gz", kind: "file", size: 7_800_000, modified: "2026-09-16T10:00:00Z" },
]

export default function FileBrowserGrid() {
  return <FileBrowser entries={entries} view="grid" rootLabel="Assets" className="w-full max-w-3xl" />
}
