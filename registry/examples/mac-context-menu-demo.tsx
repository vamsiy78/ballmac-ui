import { Copy, ExternalLink, Info, Share, Tag, Trash2 } from "lucide-react"

import { FileIcon } from "@/components/ballmac/mac-icons"
import {
  MacContextMenu,
  MacContextMenuContent,
  MacContextMenuItem,
  MacContextMenuLabel,
  MacContextMenuSeparator,
  MacContextMenuSub,
  MacContextMenuSubContent,
  MacContextMenuSubTrigger,
  MacContextMenuTrigger,
} from "@/components/ballmac/mac-context-menu"

const tags = ["Red", "Orange", "Green", "Blue"]

export default function MacContextMenuDemo() {
  return (
    <MacContextMenu>
      <MacContextMenuTrigger className="flex h-56 w-full max-w-xl select-none flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-card text-sm text-muted-foreground">
        <FileIcon size={64} label="pdf" tone="red" />
        <span className="font-medium text-foreground">Q3 Report.pdf</span>
        <span>Right-click, or long-press on touch</span>
      </MacContextMenuTrigger>
      <MacContextMenuContent className="w-64">
        <MacContextMenuItem icon={<ExternalLink />} shortcut="⌘O">Open</MacContextMenuItem>
        <MacContextMenuItem icon={<Info />} shortcut="⌘I">Get Info</MacContextMenuItem>
        <MacContextMenuSeparator />
        <MacContextMenuItem icon={<Copy />} shortcut="⌘D">Duplicate</MacContextMenuItem>
        <MacContextMenuSub>
          <MacContextMenuSubTrigger icon={<Tag />}>Tags</MacContextMenuSubTrigger>
          <MacContextMenuSubContent>
            {tags.map((t) => (
              <MacContextMenuItem key={t}>{t}</MacContextMenuItem>
            ))}
          </MacContextMenuSubContent>
        </MacContextMenuSub>
        <MacContextMenuItem icon={<Share />}>Share…</MacContextMenuItem>
        <MacContextMenuSeparator />
        <MacContextMenuLabel>Danger</MacContextMenuLabel>
        <MacContextMenuItem destructive icon={<Trash2 />} shortcut="⌘⌫">Move to Bin</MacContextMenuItem>
      </MacContextMenuContent>
    </MacContextMenu>
  )
}
