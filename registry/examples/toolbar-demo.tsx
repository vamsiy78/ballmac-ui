"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, LayoutGrid, List, Share, Tag } from "lucide-react"

import { Toolbar, ToolbarButton, ToolbarGroup, ToolbarSearch, ToolbarSegment, ToolbarSegmented, ToolbarSeparator, ToolbarSpacer } from "@/components/ballmac/toolbar"

export default function ToolbarDemo() {
  const [view, setView] = React.useState("icons")
  const [query, setQuery] = React.useState("")

  return (
    <div className="w-full max-w-2xl overflow-hidden rounded-xl border bg-card shadow-sm">
      <Toolbar label="Documents" title="Documents" subtitle="42 items" className="border-b">
        <ToolbarGroup>
          <ToolbarButton aria-label="Back" icon={<ChevronLeft />} />
          <ToolbarButton aria-label="Forward" icon={<ChevronRight />} disabled />
        </ToolbarGroup>
        <ToolbarSegmented type="single" value={view} onValueChange={(v) => v && setView(v)} aria-label="View">
          <ToolbarSegment value="icons" aria-label="Icons"><LayoutGrid /></ToolbarSegment>
          <ToolbarSegment value="list" aria-label="List"><List /></ToolbarSegment>
        </ToolbarSegmented>
        <ToolbarSeparator />
        <ToolbarButton aria-label="Share" icon={<Share />} />
        <ToolbarButton aria-label="Tags" icon={<Tag />} className="max-sm:hidden" />
        <ToolbarSpacer />
        <ToolbarSearch collapsedWidth="7rem" value={query} onChange={(e) => setQuery(e.target.value)} onClear={() => setQuery("")} />
      </Toolbar>
      <p className="px-6 py-10 text-center text-sm text-muted-foreground">
        Showing <strong className="text-foreground">{view}</strong>
        {query ? <> matching “{query}”</> : null}. Tab enters the toolbar; arrow keys move between controls.
      </p>
    </div>
  )
}
