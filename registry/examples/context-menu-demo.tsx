"use client";
import { Copy, ExternalLink, FileText, Pencil, Star, Trash2 } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ballmac/context-menu";
export default function ContextMenuDemo() {
  return (
    <ContextMenu>
      <ContextMenuTrigger
        tabIndex={0}
        aria-label="Q3 roadmap.pdf. Right-click or press Shift+F10 for actions"
        className="flex w-full max-w-sm items-center gap-3 rounded-xl border bg-card p-4 shadow-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <span className="flex size-11 items-center justify-center rounded-lg bg-muted">
          <FileText aria-hidden="true" className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">Q3 roadmap.pdf</p>
          <p className="text-xs text-muted-foreground">
            Right-click, long-press or Shift+F10
          </p>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem>
          <ExternalLink aria-hidden="true" /> Open
          <ContextMenuShortcut>↵</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          <Pencil aria-hidden="true" /> Rename
          <ContextMenuShortcut>F2</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Copy aria-hidden="true" /> Copy as
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem>Link</ContextMenuItem>
            <ContextMenuItem>Markdown</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuItem>
          <Star aria-hidden="true" /> Add to favorites
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem destructive>
          <Trash2 aria-hidden="true" /> Move to trash
          <ContextMenuShortcut>⌫</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
