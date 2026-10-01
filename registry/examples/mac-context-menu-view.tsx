"use client"

import * as React from "react"

import {
  MacContextMenu,
  MacContextMenuCheckboxItem,
  MacContextMenuContent,
  MacContextMenuLabel,
  MacContextMenuRadioGroup,
  MacContextMenuRadioItem,
  MacContextMenuSeparator,
  MacContextMenuTrigger,
} from "@/components/ballmac/mac-context-menu"

export default function MacContextMenuView() {
  const [sort, setSort] = React.useState("name")
  const [hidden, setHidden] = React.useState(false)
  const [preview, setPreview] = React.useState(true)

  return (
    <MacContextMenu>
      <MacContextMenuTrigger className="flex h-48 w-full max-w-xl select-none items-center justify-center rounded-2xl border border-dashed bg-card px-4 text-center text-sm text-muted-foreground">
        <span>
          Sorted by <strong className="text-foreground capitalize">{sort}</strong>
          {hidden ? ", hidden files shown" : ""}
          {preview ? ", preview on" : ""}. Right-click to change.
        </span>
      </MacContextMenuTrigger>
      <MacContextMenuContent className="w-60">
        <MacContextMenuLabel>Sort By</MacContextMenuLabel>
        <MacContextMenuRadioGroup value={sort} onValueChange={setSort}>
          <MacContextMenuRadioItem value="name">Name</MacContextMenuRadioItem>
          <MacContextMenuRadioItem value="kind">Kind</MacContextMenuRadioItem>
          <MacContextMenuRadioItem value="date">Date Modified</MacContextMenuRadioItem>
        </MacContextMenuRadioGroup>
        <MacContextMenuSeparator />
        <MacContextMenuCheckboxItem checked={hidden} onCheckedChange={setHidden}>Show Hidden Files</MacContextMenuCheckboxItem>
        <MacContextMenuCheckboxItem checked={preview} onCheckedChange={setPreview}>Show Preview</MacContextMenuCheckboxItem>
      </MacContextMenuContent>
    </MacContextMenu>
  )
}
