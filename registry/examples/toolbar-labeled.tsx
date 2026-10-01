import { Download, FolderPlus, Pencil, Trash2 } from "lucide-react"

import { Toolbar, ToolbarButton, ToolbarGroup, ToolbarSeparator, ToolbarSpacer } from "@/components/ballmac/toolbar"

export default function ToolbarLabeled() {
  return (
    <div className="w-full max-w-2xl overflow-hidden rounded-xl border bg-card">
      <Toolbar label="Actions">
        <ToolbarGroup>
          <ToolbarButton labeled icon={<FolderPlus />}>New Folder</ToolbarButton>
          <ToolbarButton labeled icon={<Pencil />}>Rename</ToolbarButton>
        </ToolbarGroup>
        <ToolbarSeparator />
        <ToolbarButton labeled icon={<Download />}>Download</ToolbarButton>
        <ToolbarSpacer />
        <ToolbarButton labeled icon={<Trash2 />}>Delete</ToolbarButton>
      </Toolbar>
    </div>
  )
}
