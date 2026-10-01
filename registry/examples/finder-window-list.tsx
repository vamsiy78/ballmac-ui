import { Folder } from "lucide-react"

import { FinderWindow, type FinderNode } from "@/components/ballmac/finder-window"

const root: FinderNode = {
  id: "projects",
  name: "Projects",
  kind: "folder",
  children: [
    { id: "app", name: "ballmac-ui", kind: "folder", children: [{ id: "readme", name: "README.md", kind: "file", ext: "md", size: "4 KB", modified: "Today, 10:12" }] },
    { id: "site", name: "marketing-site", kind: "folder", tone: "teal", children: [] },
    { id: "pitch", name: "Pitch deck.key", kind: "file", ext: "key", tone: "orange", size: "18.4 MB", modified: "Sep 28, 2026" },
    { id: "logo", name: "logo.svg", kind: "file", ext: "svg", tone: "purple", size: "2 KB", modified: "Sep 20, 2026" },
    { id: "backup", name: "backup.zip", kind: "file", ext: "zip", tone: "amber", size: "412 MB", modified: "Sep 1, 2026" },
  ],
}

export default function FinderWindowList() {
  return (
    <FinderWindow
      root={root}
      view="list"
      sidebar={[{ title: "Locations", items: [{ id: "projects", label: "Projects", icon: <Folder /> }] }]}
      className="h-[320px] w-full max-w-[720px]"
    />
  )
}
